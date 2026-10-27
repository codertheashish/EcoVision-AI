"""Backend tests.

Note on the `stub_model` fixture: it replaces the Keras model with a tiny fake ONLY to test the
API plumbing (validation, response shape, thresholds). It says nothing about real model accuracy.
Real-model behaviour is covered by `test_real_model_*`, which are skipped unless a trained
model file exists.
"""
import io
import json

import numpy as np
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.core.config import settings
from app.main import app
from app.services.classifier import classifier_service
from app.services.recommendations import RECOMMENDATIONS_DATABASE, get_recommendation_for_category

CLASSES = ["cardboard", "glass", "metal", "paper", "plastic", "trash"]


class _StubModel:
    def __init__(self, probs):
        self.probs = np.array(probs, dtype=np.float32)
        self.last_batch = None

    def predict(self, batch, verbose=0):
        self.last_batch = batch
        return np.tile(self.probs, (batch.shape[0], 1))


def make_image(fmt="JPEG", size=(64, 64), color=(120, 90, 60)):
    buf = io.BytesIO()
    Image.new("RGB", size, color).save(buf, format=fmt)
    buf.seek(0)
    return buf


@pytest.fixture
def client():
    # No `with` block -> lifespan (real model load) is not triggered; tests control the state.
    return TestClient(app)


@pytest.fixture
def stub_model(monkeypatch):
    def _install(probs):
        stub = _StubModel(probs)
        monkeypatch.setattr(classifier_service, "model", stub)
        monkeypatch.setattr(classifier_service, "status", "ready")
        monkeypatch.setattr(classifier_service, "class_names", CLASSES)
        return stub
    return _install


@pytest.fixture
def no_model(monkeypatch):
    monkeypatch.setattr(classifier_service, "model", None)
    monkeypatch.setattr(classifier_service, "status", "model_missing")
    monkeypatch.setattr(classifier_service, "detail", "Trained model not found.")


# ---------------------------------------------------------------- health / docs
def test_health_returns_json_and_reports_missing_model(client, no_model):
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["model_loaded"] is False
    assert body["model_status"] == "model_missing"


def test_health_reports_loaded_model(client, stub_model):
    stub_model([1, 0, 0, 0, 0, 0])
    assert client.get("/health").json()["model_loaded"] is True


def test_docs_available(client):
    assert client.get("/docs").status_code == 200


# ---------------------------------------------------------------- prediction
def test_predict_without_model_returns_503_not_fake_result(client, no_model):
    r = client.post("/api/v1/predict", files={"file": ("a.jpg", make_image(), "image/jpeg")})
    assert r.status_code == 503
    assert "predicted_category" not in r.json()


def test_predict_success_shape_and_raw_0_255_input(client, stub_model):
    stub = stub_model([0.05, 0.05, 0.70, 0.10, 0.05, 0.05])
    r = client.post("/api/v1/predict", files={"file": ("a.jpg", make_image(), "image/jpeg")})
    assert r.status_code == 200
    d = r.json()
    assert d["predicted_category"] == "metal"
    assert d["confidence"] == 0.7
    assert d["is_uncertain"] is False
    assert len(d["alternatives"]) == 3
    assert d["recommendation"]["category"] == "metal"
    # The model receives raw 0..255 pixels (scaling happens inside the model), shape (1,224,224,3)
    assert stub.last_batch.shape == (1, 224, 224, 3)
    assert stub.last_batch.max() > 1.0


def test_low_confidence_is_flagged_uncertain(client, stub_model):
    stub_model([0.2, 0.2, 0.2, 0.15, 0.15, 0.1])
    d = client.post("/api/v1/predict", files={"file": ("a.png", make_image("PNG"), "image/png")}).json()
    assert d["is_uncertain"] is True
    assert d["uncertainty_warning"]


def test_invalid_mime_returns_415(client, stub_model):
    stub_model([1, 0, 0, 0, 0, 0])
    r = client.post("/api/v1/predict", files={"file": ("a.txt", io.BytesIO(b"hello"), "text/plain")})
    assert r.status_code == 415


def test_fake_image_with_image_mime_returns_415(client, stub_model):
    stub_model([1, 0, 0, 0, 0, 0])
    r = client.post("/api/v1/predict", files={"file": ("a.jpg", io.BytesIO(b"not an image"), "image/jpeg")})
    assert r.status_code == 415


def test_truncated_image_returns_422(client, stub_model):
    stub_model([1, 0, 0, 0, 0, 0])
    data = make_image("PNG", size=(200, 200)).getvalue()
    r = client.post("/api/v1/predict", files={"file": ("a.png", io.BytesIO(data[: len(data) // 2]), "image/png")})
    assert r.status_code == 422


def test_empty_file_returns_400(client, stub_model):
    stub_model([1, 0, 0, 0, 0, 0])
    r = client.post("/api/v1/predict", files={"file": ("a.jpg", io.BytesIO(b""), "image/jpeg")})
    assert r.status_code == 400


def test_oversize_file_returns_413(client, stub_model, monkeypatch):
    stub_model([1, 0, 0, 0, 0, 0])
    monkeypatch.setattr(settings, "MAX_IMAGE_SIZE_BYTES", 1000)
    big = make_image("PNG", size=(300, 300)).getvalue()
    assert len(big) > 1000 or True
    payload = big + b"0" * 2000
    r = client.post("/api/v1/predict", files={"file": ("a.png", io.BytesIO(payload), "image/png")})
    assert r.status_code == 413


def test_too_many_pixels_returns_422(client, stub_model, monkeypatch):
    stub_model([1, 0, 0, 0, 0, 0])
    monkeypatch.setattr(settings, "MAX_DIMENSION", 100)
    r = client.post("/api/v1/predict", files={"file": ("a.png", make_image("PNG", size=(150, 150)), "image/png")})
    assert r.status_code == 422


def test_missing_file_field_returns_422(client):
    assert client.post("/api/v1/predict").status_code == 422


# ---------------------------------------------------------------- recommendations / categories
def test_every_expected_class_has_a_recommendation():
    for name in settings.EXPECTED_CATEGORIES:
        assert get_recommendation_for_category(name) is not None
    assert set(RECOMMENDATIONS_DATABASE) == set(settings.EXPECTED_CATEGORIES)


def test_categories_endpoints(client):
    assert len(client.get("/api/v1/categories").json()) == 6
    assert client.get("/api/v1/categories/glass").json()["category"] == "glass"
    assert client.get("/api/v1/categories/nonexistent").status_code == 404


def test_glass_safety_warning_present():
    assert "Pyrex" in get_recommendation_for_category("glass")["safety_warning"]


# ---------------------------------------------------------------- model loading failure handling
def test_load_with_missing_model_file_does_not_crash(monkeypatch, tmp_path):
    from app.services.classifier import WasteClassifierService
    idx = tmp_path / "class_indices.json"
    idx.write_text(json.dumps({str(i): c for i, c in enumerate(CLASSES)}))
    monkeypatch.setattr(settings, "MODEL_PATH", tmp_path / "nope.keras")
    monkeypatch.setattr(settings, "CLASS_INDICES_PATH", idx)
    monkeypatch.setattr(settings, "MODEL_URL", None)
    svc = WasteClassifierService()
    svc.load()
    assert svc.status == "model_missing" and not svc.is_ready


def test_load_with_corrupt_model_file_reports_error(monkeypatch, tmp_path):
    from app.services.classifier import WasteClassifierService
    idx = tmp_path / "class_indices.json"
    idx.write_text(json.dumps({str(i): c for i, c in enumerate(CLASSES)}))
    bad = tmp_path / "bad.keras"
    bad.write_bytes(b"this is not a keras file")
    monkeypatch.setattr(settings, "MODEL_PATH", bad)
    monkeypatch.setattr(settings, "CLASS_INDICES_PATH", idx)
    svc = WasteClassifierService()
    svc.load()
    assert svc.status == "error" and not svc.is_ready


def test_cors_allows_configured_origin_and_blocks_others(client):
    ok = client.options("/api/v1/predict", headers={
        "Origin": "http://127.0.0.1:3000", "Access-Control-Request-Method": "POST"})
    assert ok.headers.get("access-control-allow-origin") == "http://127.0.0.1:3000"
    bad = client.options("/api/v1/predict", headers={
        "Origin": "https://evil.example", "Access-Control-Request-Method": "POST"})
    assert "access-control-allow-origin" not in bad.headers


# ---------------------------------------------------------------- real model (skipped if not trained)
real_model = pytest.mark.skipif(not settings.MODEL_PATH.exists(), reason="no trained model file present")


@real_model
def test_real_model_loads_and_predicts():
    from app.services.classifier import WasteClassifierService
    svc = WasteClassifierService()
    svc.load()
    assert svc.is_ready, svc.detail
    out = svc.predict(make_image().getvalue())
    assert out["predicted_category"] in CLASSES
    assert 0.0 <= out["confidence"] <= 1.0
