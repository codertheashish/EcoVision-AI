from typing import List, Optional
from pydantic import BaseModel, Field

class AlternativePrediction(BaseModel):
    category: str
    label: str
    confidence: float

class RecommendationResponse(BaseModel):
    category: str
    name: str
    recyclable_status: str
    short_description: str
    preparation_rules: List[str]
    local_facility_note: str
    eco_tip: str
    safety_warning: Optional[str] = None
    common_examples: List[str]

class PredictionResponse(BaseModel):
    success: bool
    predicted_category: str
    category_label: str
    confidence: float
    is_uncertain: bool
    uncertainty_warning: Optional[str] = None
    alternatives: List[AlternativePrediction]
    recommendation: RecommendationResponse
    inference_time_ms: int

class ModelInfoResponse(BaseModel):
    """Only facts that are true by construction, or measured and read from files on disk."""
    model_loaded: bool
    model_status: str
    status_detail: str
    name: str
    backbone: str
    input_dimensions: List[int]
    supported_categories: List[str]
    uncertainty_threshold: float
    total_parameters: Optional[int] = None          # measured from the loaded model
    training_run: Optional[dict] = None             # contents of models/run_info.json, if present
    evaluation: Optional[dict] = None               # contents of models/evaluation_report.json, if present
    dataset_name: str
    dataset_url: str


class UserFeedbackRequest(BaseModel):
    prediction_id: Optional[str] = None
    predicted_category: str
    user_confirmed_category: Optional[str] = None
    is_accurate: bool
    notes: Optional[str] = Field(None, max_length=500)
