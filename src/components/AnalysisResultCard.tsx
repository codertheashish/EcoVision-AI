import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { PredictionResult } from '../types/waste';

interface AnalysisResultCardProps {
  result: PredictionResult;
  onReset: () => void;
  onFeedback: (feedback: 'helpful' | 'incorrect') => Promise<void>;
}

export const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({ result, onReset, onFeedback }) => {
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackError, setFeedbackError] = useState(false);

  const sendFeedback = async (type: 'helpful' | 'incorrect') => {
    setFeedbackError(false);
    try {
      await onFeedback(type);
      setFeedbackSent(true);
    } catch {
      setFeedbackError(true);
    }
  };

  const pct = (result.confidence * 100).toFixed(0);
  const barColor =
    result.confidence >= 0.75 ? 'bg-emerald-500' : result.confidence >= 0.55 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
      {result.isUncertain && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-start gap-3 text-sm text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <span>
            {result.uncertaintyMessage ||
              'The model is not sure about this one. Please check the item yourself.'}
          </span>
        </div>
      )}

      {/* Prediction */}
      <div className="p-6 sm:p-8 grid sm:grid-cols-5 gap-6">
        <div className="sm:col-span-2 rounded-xl overflow-hidden bg-neutral-100 aspect-square">
          <img src={result.imageUrl} alt="Your uploaded item" className="w-full h-full object-cover" />
        </div>

        <div className="sm:col-span-3 flex flex-col justify-center space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              {result.guidance.recyclableStatus}
            </span>
            <h2 className="text-2xl font-bold text-neutral-900 mt-1">{result.categoryLabel}</h2>
            <p className="text-sm text-neutral-600 mt-1">{result.guidance.shortDesc}</p>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-neutral-600">Confidence</span>
              <span className="font-semibold text-neutral-900">{pct}%</span>
            </div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div className={`h-full ${barColor}`} style={{ width: `${Math.max(4, Number(pct))}%` }} />
            </div>
          </div>

          {result.alternatives.length > 0 && (
            <p className="text-xs text-neutral-500">
              Other possibilities:{' '}
              {result.alternatives
                .slice(0, 2)
                .map((a) => `${a.category} ${(a.confidence * 100).toFixed(0)}%`)
                .join(', ')}
            </p>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="px-6 sm:px-8 pb-8 space-y-6 border-t border-emerald-50 pt-6">
        <div>
          <h3 className="font-semibold text-neutral-900 mb-3">How to sort it</h3>
          <ol className="space-y-2.5">
            {result.guidance.preparationRules.map((rule, i) => (
              <li key={i} className="flex gap-3 text-sm text-neutral-700 leading-relaxed">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span>{rule}</span>
              </li>
            ))}
          </ol>
        </div>

        {result.guidance.safetyWarning && (
          <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-lg p-4 text-sm text-rose-900">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{result.guidance.safetyWarning}</span>
          </div>
        )}

        <div className="text-sm text-neutral-600 space-y-1.5">
          <p>
            <span className="font-semibold text-neutral-800">Tip: </span>
            {result.guidance.ecoTip}
          </p>
          <p>
            <span className="font-semibold text-neutral-800">Check locally: </span>
            {result.guidance.localFacilityNote}
          </p>
        </div>
      </div>

      {/* Footer actions */}
      <div className="px-6 sm:px-8 py-4 bg-emerald-50/50 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 text-neutral-600">
          {feedbackSent ? (
            <span className="text-emerald-700 font-medium">Thanks for the feedback.</span>
          ) : (
            <>
              <span>Was this right?</span>
              <button
                onClick={() => sendFeedback('helpful')}
                aria-label="Yes"
                className="p-1.5 rounded-md hover:bg-white text-neutral-600 hover:text-emerald-700 cursor-pointer"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => sendFeedback('incorrect')}
                aria-label="No"
                className="p-1.5 rounded-md hover:bg-white text-neutral-600 hover:text-rose-700 cursor-pointer"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
              {feedbackError && <span className="text-rose-700 text-xs">Could not send.</span>}
            </>
          )}
        </div>
        <button
          onClick={onReset}
          className="px-4 py-2 font-semibold text-emerald-800 bg-white border border-emerald-200 hover:bg-emerald-50 rounded-lg flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Classify another
        </button>
      </div>
    </div>
  );
};
