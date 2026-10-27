export type WasteCategory =
  | 'cardboard'
  | 'glass'
  | 'metal'
  | 'paper'
  | 'plastic'
  | 'trash';

export interface CategoryGuidance {
  id: WasteCategory;
  name: string;
  shortDesc: string;
  recyclableStatus: 'Recyclable' | 'Landfill / Solid Waste' | 'Conditional / Facility Dependent';
  color: string;
  preparationRules: string[];
  localFacilityNote: string;
  ecoTip: string;
  safetyWarning?: string;
  commonExamples: string[];
}

export interface PredictionAlternative {
  category: WasteCategory;
  label: string;
  confidence: number;
}

export interface PredictionResult {
  category: WasteCategory;
  categoryLabel: string;
  confidence: number;
  isUncertain: boolean;
  uncertaintyMessage?: string;
  alternatives: PredictionAlternative[];
  guidance: CategoryGuidance;
  inferenceTimeMs: number;
  imageUrl: string;
  analysisTimestamp: string;
}

export interface AnalysisRecord {
  id: string;
  timestamp: string;
  category: WasteCategory;
  categoryLabel: string;
  confidence: number;
  isUncertain: boolean;
  feedback?: 'helpful' | 'incorrect';
}

export interface PerClassMetrics {
  precision: number;
  recall: number;
  'f1-score': number;
  support: number;
}

/** Contents of backend/models/evaluation_report.json (only present after real evaluation). */
export interface EvaluationReport {
  num_test_images: number;
  accuracy: number;
  macro_precision: number;
  macro_recall: number;
  macro_f1: number;
  per_class: Record<string, PerClassMetrics>;
  classes: string[];
  confusion_matrix: number[][];
}

export interface ModelInfo {
  model_loaded: boolean;
  model_status: string;
  status_detail: string;
  name: string;
  backbone: string;
  input_dimensions: number[];
  supported_categories: string[];
  uncertainty_threshold: number;
  total_parameters: number | null;
  training_run: Record<string, unknown> | null;
  evaluation: EvaluationReport | null;
  dataset_name: string;
  dataset_url: string;
}

export interface BackendHealth {
  status: string;
  model_loaded: boolean;
  model_status: string;
  detail: string;
}
