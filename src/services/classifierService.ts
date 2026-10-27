import {
  BackendHealth,
  ModelInfo,
  PredictionResult,
  WasteCategory,
} from '../types/waste';
import { WASTE_GUIDANCE_MAP } from '../data/recommendations';

/**
 * Backend base URL.
 * - Local dev:   http://127.0.0.1:8000   (default when VITE_API_BASE_URL is not set in dev)
 * - Production:  set VITE_API_BASE_URL in Vercel to your Render URL. No localhost fallback in production.
 */
const envUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
export const API_BASE_URL: string = (
  envUrl || (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '')
).replace(/\/+$/, '');

// Render free instances sleep when idle; the first request can take a minute while they wake up.
const REQUEST_TIMEOUT_MS = 90_000;

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  if (!API_BASE_URL) {
    console.error('VITE_API_BASE_URL is not set. See .env.example.');
    throw new ApiError('The classification service is not available right now. Please try again later.');
  }
  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      throw new ApiError('The service took too long to respond. It may be waking up, so please try again in a moment.');
    }
    console.error(`Cannot reach the backend at ${API_BASE_URL} (is it running? does CORS allow this site?)`);
    throw new ApiError("Can't reach the classification service right now. Please try again in a moment.");
  }
}

async function errorFromResponse(res: Response): Promise<ApiError> {
  const body = await res.json().catch(() => ({}));
  const detail = typeof body?.detail === 'string' ? body.detail : '';
  if (detail) console.warn(`API ${res.status}: ${detail}`); // technical detail goes to the console only
  if (res.status === 503) {
    return new ApiError('The classifier is temporarily unavailable. Please try again later.', res.status);
  }
  if (res.status >= 500) {
    return new ApiError('Something went wrong on our side. Please try again.', res.status);
  }
  // 4xx messages (wrong file type, too large, unreadable image) are written for end users
  return new ApiError(detail || 'The request could not be completed.', res.status);
}

export async function fetchHealth(): Promise<BackendHealth> {
  const res = await request('/health');
  if (!res.ok) throw await errorFromResponse(res);
  return res.json();
}

export async function fetchModelInfo(): Promise<ModelInfo> {
  const res = await request('/api/v1/model-info');
  if (!res.ok) throw await errorFromResponse(res);
  return res.json();
}

/** Sends the image to the real model. There is no client-side fallback: errors are shown as errors. */
export async function predictWaste(file: File): Promise<PredictionResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await request('/api/v1/predict', { method: 'POST', body: formData });
  if (!res.ok) throw await errorFromResponse(res);

  const data = await res.json();
  const category = data.predicted_category as WasteCategory;
  const guidance = WASTE_GUIDANCE_MAP[category];
  if (!guidance) {
    console.error('Unknown category from server:', data.predicted_category);
    throw new ApiError('Something went wrong on our side. Please try again.');
  }

  return {
    category,
    categoryLabel: data.category_label ?? guidance.name,
    confidence: data.confidence,
    isUncertain: data.is_uncertain,
    uncertaintyMessage: data.uncertainty_warning ?? undefined,
    alternatives: data.alternatives ?? [],
    guidance,
    inferenceTimeMs: data.inference_time_ms,
    imageUrl: URL.createObjectURL(file),
    analysisTimestamp: new Date().toISOString(),
  };
}

export async function sendFeedback(
  predictedCategory: WasteCategory,
  isAccurate: boolean
): Promise<void> {
  const res = await request('/api/v1/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ predicted_category: predictedCategory, is_accurate: isAccurate }),
  });
  if (!res.ok) throw await errorFromResponse(res);
}
