import json
import logging
from typing import List, Optional

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from fastapi.concurrency import run_in_threadpool

from app.core.config import settings
from app.ml.preprocessing import ImageValidationError
from app.schemas.waste import (
    ModelInfoResponse,
    PredictionResponse,
    RecommendationResponse,
    UserFeedbackRequest,
)
from app.services.classifier import ModelUnavailableError, classifier_service
from app.services.recommendations import RECOMMENDATIONS_DATABASE, get_recommendation_for_category

logger = logging.getLogger("ecovision.api")
router = APIRouter()

ALLOWED_MIMES = {"image/jpeg", "image/png", "image/webp"}


def _read_json(path) -> Optional[dict]:
    try:
        if path.exists():
            return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        logger.warning("Could not read %s", path)
    return None


@router.get("/health", tags=["Health"])
async def health_check():
    """Liveness + model readiness. Always HTTP 200 while the server is up; check `model_loaded`."""
    return {
        "status": "ok",
        "service": "EcoVision AI Inference API",
        "model_loaded": classifier_service.is_ready,
        "model_status": classifier_service.status,
        "detail": classifier_service.detail,
    }


@router.get("/api/v1/categories", response_model=List[RecommendationResponse], tags=["Categories"])
async def get_supported_categories():
    return [RecommendationResponse(**item) for item in RECOMMENDATIONS_DATABASE.values()]


@router.get("/api/v1/categories/{category}", response_model=RecommendationResponse, tags=["Categories"])
async def get_category_detail(category: str):
    guidance = get_recommendation_for_category(category)
    if not guidance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category '{category}' is not recognized. Supported: {list(RECOMMENDATIONS_DATABASE)}",
        )
    return RecommendationResponse(**guidance)


@router.get("/api/v1/model-info", response_model=ModelInfoResponse, tags=["Model"])
async def get_model_information():
    """Static facts + whatever training/evaluation artifacts actually exist on disk."""
    params = None
    if classifier_service.is_ready:
        params = int(classifier_service.model.count_params())
    return ModelInfoResponse(
        model_loaded=classifier_service.is_ready,
        model_status=classifier_service.status,
        status_detail=classifier_service.detail,
        name="EcoVision MobileNetV2 classifier",
        backbone="MobileNetV2 (ImageNet pre-trained, fine-tuned)",
        input_dimensions=[224, 224, 3],
        supported_categories=classifier_service.class_names or settings.EXPECTED_CATEGORIES,
        uncertainty_threshold=settings.UNCERTAINTY_THRESHOLD,
        total_parameters=params,
        training_run=_read_json(settings.RUN_INFO_PATH),
        evaluation=_read_json(settings.EVALUATION_REPORT_PATH),
        dataset_name="Garbage Classification (TrashNet, 6 classes)",
        dataset_url="https://www.kaggle.com/datasets/asdasdasasdas/garbage-classification",
    )


@router.post("/api/v1/predict", response_model=PredictionResponse, tags=["Inference"])
async def predict_waste_item(file: UploadFile = File(...)):
    """Classify one uploaded image. 415 bad type, 413 too large, 422 corrupt/oversized image,
    503 model not available."""
    if file.content_type not in ALLOWED_MIMES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported media type '{file.content_type}'. Use JPEG, PNG or WEBP.",
        )

    # Read at most limit+1 bytes so a huge upload cannot exhaust memory.
    contents = await file.read(settings.MAX_IMAGE_SIZE_BYTES + 1)
    if len(contents) > settings.MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds the {settings.MAX_IMAGE_SIZE_BYTES // (1024 * 1024)} MB limit.",
        )
    if not contents:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    try:
        # TensorFlow inference is CPU-bound: run it in a worker thread, not on the event loop.
        result = await run_in_threadpool(classifier_service.predict, contents)
        return PredictionResponse(**result)
    except ModelUnavailableError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Model unavailable: {exc}",
        )
    except ImageValidationError as exc:
        code = (
            415
            if exc.unsupported_type
            else 422
        )
        raise HTTPException(status_code=code, detail=str(exc))
    except Exception:
        logger.error("Inference error", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error while processing the image.",
        )


@router.post("/api/v1/feedback", tags=["Feedback"])
async def submit_feedback(feedback: UserFeedbackRequest):
    """Feedback is written to the server log only (no database, no images)."""
    logger.info(
        "Feedback: predicted=%s accurate=%s confirmed=%s",
        feedback.predicted_category, feedback.is_accurate, feedback.user_confirmed_category,
    )
    return {"status": "logged", "message": "Thanks. Your feedback was logged (not stored permanently)."}
