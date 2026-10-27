"""Central configuration, read from environment variables (see backend/.env.example)."""
import os
from pathlib import Path
from typing import List, Optional

from pydantic import BaseModel

# backend/ directory (two levels above this file: backend/app/core/config.py)
BACKEND_DIR = Path(__file__).resolve().parents[2]


def _resolve(path_str: str) -> Path:
    """Relative paths are resolved against backend/, NOT the current working directory,
    so the model is found no matter where uvicorn is started from."""
    p = Path(path_str)
    return p if p.is_absolute() else (BACKEND_DIR / p)


def _split_csv(value: str) -> List[str]:
    return [v.strip().rstrip("/") for v in value.split(",") if v.strip()]


class Settings(BaseModel):
    PROJECT_NAME: str = "EcoVision AI Backend"
    API_V1_STR: str = "/api/v1"

    # --- Model artifacts -------------------------------------------------
    MODEL_PATH: Path = _resolve(os.getenv("MODEL_PATH", "models/mobilenetv2_waste.keras"))
    CLASS_INDICES_PATH: Path = _resolve(os.getenv("CLASS_INDICES_PATH", "models/class_indices.json"))
    EVALUATION_REPORT_PATH: Path = _resolve(os.getenv("EVALUATION_REPORT_PATH", "models/evaluation_report.json"))
    RUN_INFO_PATH: Path = _resolve(os.getenv("RUN_INFO_PATH", "models/run_info.json"))
    # Optional: download the model at startup if the file is missing (e.g. a GitHub Release asset).
    MODEL_URL: Optional[str] = os.getenv("MODEL_URL") or None
    MODEL_SHA256: Optional[str] = os.getenv("MODEL_SHA256") or None

    UNCERTAINTY_THRESHOLD: float = float(os.getenv("UNCERTAINTY_THRESHOLD", "0.55"))

    # --- Upload limits ----------------------------------------------------
    MAX_IMAGE_SIZE_BYTES: int = int(os.getenv("MAX_IMAGE_SIZE_MB", "10")) * 1024 * 1024
    MAX_DIMENSION: int = int(os.getenv("MAX_IMAGE_DIMENSION", "4096"))
    MAX_IMAGE_PIXELS: int = 25_000_000

    # --- CORS: explicit origins only. Never combine "*" with credentials. ---
    CORS_ORIGINS: List[str] = _split_csv(
        os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    )
    # Optional regex for Vercel preview URLs, e.g. https://ecovision-ai-.*\.vercel\.app
    CORS_ORIGIN_REGEX: Optional[str] = os.getenv("CORS_ORIGIN_REGEX") or None

    # Folder names produced by the dataset; used only for the recommendations table check.
    EXPECTED_CATEGORIES: List[str] = ["cardboard", "glass", "metal", "paper", "plastic", "trash"]


settings = Settings()
