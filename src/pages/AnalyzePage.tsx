import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { ImageDropzone } from '../components/ImageDropzone';
import { AnalysisResultCard } from '../components/AnalysisResultCard';
import { PredictionResult, AnalysisRecord } from '../types/waste';
import { predictWaste, sendFeedback } from '../services/classifierService';

interface AnalyzePageProps {
  onRecordAnalysis: (record: AnalysisRecord) => void;
}

export const AnalyzePage: React.FC<AnalyzePageProps> = ({ onRecordAnalysis }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleAnalyze = async (file: File) => {
    setIsLoading(true);
    setAnalysisError(null);
    setLoadingStage('Analyzing… this can take up to a minute the first time');
    try {
      const result = await predictWaste(file);
      setPredictionResult(result);
      onRecordAnalysis({
        id: 'rec-' + Date.now(),
        timestamp: new Date().toISOString(),
        category: result.category,
        categoryLabel: result.categoryLabel,
        confidence: result.confidence,
        isUncertain: result.isUncertain,
      });
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  const handleFeedback = async (type: 'helpful' | 'incorrect') => {
    if (!predictionResult) return;
    await sendFeedback(predictionResult.category, type === 'helpful');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Classify your waste</h1>
        <p className="text-neutral-600 mt-2">Upload a photo of one item to see how to sort it.</p>
      </div>

      {!predictionResult ? (
        <div className="space-y-4">
          <ImageDropzone onAnalyze={handleAnalyze} isLoading={isLoading} loadingStage={loadingStage} />

          {analysisError && (
            <div role="alert" className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-800">
              {analysisError}
            </div>
          )}

          <p className="flex items-center justify-center gap-2 text-xs text-neutral-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Your photo is used only for this prediction and is not stored.
          </p>
        </div>
      ) : (
        <AnalysisResultCard
          result={predictionResult}
          onReset={() => {
            setPredictionResult(null);
            setAnalysisError(null);
          }}
          onFeedback={handleFeedback}
        />
      )}
    </div>
  );
};
