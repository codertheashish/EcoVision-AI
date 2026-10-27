"""Model loading + inference. There is NO fallback/heuristic mode: if the trained model
is missing or broken the service reports it honestly and /predict returns HTTP 503."""
import hashlib
import json
import logging
import threading
import time
import urllib.request
from typing import Any, Dict, List, Optional

import numpy as np

from app.core.config import BACKEND_DIR, settings
from app.ml.preprocessing import bytes_to_model_input
from app.services.recommendations import get_recommendation_for_category

logger = logging.getLogger("ecovision.classifier")


def _rel(path) -> str:
    """Show paths relative to backend/ so server directory layout is not exposed to clients."""
    try:
        return str(path.relative_to(BACKEND_DIR))
    except ValueError:
        return path.name


class ModelUnavailableError(RuntimeError):
    """The trained model is not loaded (missing file, bad file, or TensorFlow not installed)."""


class WasteClassifierService:
    def __init__(self) -> None:
        self.model = None
        self.class_names: List[str] = []
        self.status: str = "not_loaded"  # not_loaded | ready | model_missing | error
        self.detail: str = "Model has not been loaded yet."
        self._lock = threading.Lock()

    # ------------------------------------------------------------------ properties
    @property
    def is_ready(self) -> bool:
        return self.model is not None and self.status == "ready"

    # ------------------------------------------------------------------ loading
    def _load_class_names(self) -> List[str]:
        path = settings.CLASS_INDICES_PATH
        if not path.exists():
            raise FileNotFoundError(f"Class index file not found: {path}")
        with open(path, "r", encoding="utf-8") as f:
            raw = json.load(f)
        mapping = {int(k): v for k, v in raw.items()}
        if sorted(mapping) != list(range(len(mapping))):
            raise ValueError("class_indices.json keys must be consecutive integers starting at 0.")
        return [mapping[i] for i in range(len(mapping))]

    def _maybe_download_model(self) -> None:
        if settings.MODEL_PATH.exists() or not settings.MODEL_URL:
            return
        if not settings.MODEL_URL.lower().startswith("https://"):
            raise ValueError("MODEL_URL must use https://")
        logger.info("Model file missing; downloading from MODEL_URL ...")
        settings.MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
        tmp_path = settings.MODEL_PATH.with_suffix(".download")
        urllib.request.urlretrieve(settings.MODEL_URL, tmp_path)  # noqa: S310 (https enforced above)
        if settings.MODEL_SHA256:
            digest = hashlib.sha256(tmp_path.read_bytes()).hexdigest()
            if digest.lower() != settings.MODEL_SHA256.lower():
                tmp_path.unlink(missing_ok=True)
                raise ValueError("Downloaded model failed SHA-256 verification.")
        tmp_path.replace(settings.MODEL_PATH)

    def load(self) -> None:
        """Load the model ONCE (called at application startup). Never raises."""
        with self._lock:
            try:
                self.class_names = self._load_class_names()
                self._maybe_download_model()

                if not settings.MODEL_PATH.exists():
                    self.status = "model_missing"
                    self.detail = (
                        f"Trained model not found at '{_rel(settings.MODEL_PATH)}'. "
                        "Train it with: python training/train.py (see README.md)."
                    )
                    logger.warning(self.detail)
                    return

                import tensorflow as tf  # imported lazily so the API can still start and explain itself

                logger.info("Loading Keras model from %s ...", settings.MODEL_PATH)
                model = tf.keras.models.load_model(settings.MODEL_PATH, compile=False)

                out_units = int(model.output_shape[-1])
                if out_units != len(self.class_names):
                    raise ValueError(
                        f"Model outputs {out_units} classes but class_indices.json lists {len(self.class_names)}."
                    )
                # Warm-up call so the first user request is not slow.
                model.predict(np.zeros((1, 224, 224, 3), dtype=np.float32), verbose=0)

                self.model = model
                self.status = "ready"
                self.detail = "Model loaded."
                logger.info("Model ready with classes: %s", self.class_names)
            except ImportError:
                self.model, self.status = None, "error"
                self.detail = "TensorFlow is not installed in this environment."
                logger.error(self.detail)
            except Exception as exc:  # noqa: BLE001 - report any load failure instead of crashing
                self.model, self.status = None, "error"
                self.detail = f"Model failed to load: {exc}"
                logger.error(self.detail, exc_info=True)

    # ------------------------------------------------------------------ inference
    def predict(self, image_bytes: bytes) -> Dict[str, Any]:
        if not self.is_ready:
            raise ModelUnavailableError(self.detail)

        start = time.perf_counter()
        batch, _ = bytes_to_model_input(
            image_bytes, max_dimension=settings.MAX_DIMENSION, max_pixels=settings.MAX_IMAGE_PIXELS
        )  # raises ImageValidationError for bad images
        probs = self.model.predict(batch, verbose=0)[0]

        ranked = sorted(
            (
                {
                    "category": name,
                    "label": (get_recommendation_for_category(name) or {}).get("name", name),
                    "confidence": float(probs[idx]),
                }
                for idx, name in enumerate(self.class_names)
            ),
            key=lambda r: r["confidence"],
            reverse=True,
        )
        top = ranked[0]
        low_conf = top["confidence"] < settings.UNCERTAINTY_THRESHOLD

        warning: Optional[str] = None
        if low_conf:
            warning = (
                f"Confidence ({top['confidence'] * 100:.1f}%) is below the "
                f"{settings.UNCERTAINTY_THRESHOLD * 100:.0f}% threshold. Please check the item yourself."
            )
        elif top["category"] == "trash":
            warning = "Classified as general trash. Check your local rules before discarding."

        recommendation = get_recommendation_for_category(top["category"])
        if recommendation is None:
            raise RuntimeError(f"No recommendation configured for class '{top['category']}'.")

        return {
            "success": True,
            "predicted_category": top["category"],
            "category_label": top["label"],
            "confidence": round(top["confidence"], 4),
            "is_uncertain": low_conf or top["category"] == "trash",
            "uncertainty_warning": warning,
            "alternatives": [
                {**a, "confidence": round(a["confidence"], 4)} for a in ranked[1:4]
            ],
            "recommendation": recommendation,
            "inference_time_ms": int((time.perf_counter() - start) * 1000),
        }


classifier_service = WasteClassifierService()
