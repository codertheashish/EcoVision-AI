import React, { useEffect, useState } from 'react';
import { ExternalLink, Database, Cpu, AlertTriangle, Layers, RefreshCw } from 'lucide-react';
import { fetchModelInfo } from '../services/classifierService';
import { ModelInfo } from '../types/waste';

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

export const ModelInfoPage: React.FC = () => {
  const [info, setInfo] = useState<ModelInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setInfo(await fetchModelInfo());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load model information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const ev = info?.evaluation ?? null;
  const run = info?.training_run as
    | { weights?: string; split_sizes?: Record<string, number>; raw_class_counts?: Record<string, number>; exact_duplicates_removed?: number }
    | null
    | undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
          <Cpu className="w-3.5 h-3.5" />
          <span>Model & Dataset</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
          Model, Dataset & Evaluation
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-3xl">
          Everything on this page is read from the running backend. If the model has not been trained or evaluated, this page says so instead of showing numbers.
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-xs text-neutral-600">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading from backend (the first request may take a minute if the server was asleep)…
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center justify-between gap-4">
          <span>{error}</span>
          <button onClick={load} className="font-semibold underline cursor-pointer">Retry</button>
        </div>
      )}

      {info && (
        <>
          {/* Model status */}
          <section className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-700" /> Model
            </h2>
            {!info.model_loaded && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">No trained model is loaded, so classification is unavailable.</span>
                  {info.status_detail}
                </div>
              </div>
            )}
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs">
              <div><dt className="text-neutral-500">Backbone</dt><dd className="font-mono text-neutral-900">{info.backbone}</dd></div>
              <div><dt className="text-neutral-500">Input</dt><dd className="font-mono text-neutral-900">{info.input_dimensions.join(' × ')} RGB</dd></div>
              <div><dt className="text-neutral-500">Classes</dt><dd className="font-mono text-neutral-900">{info.supported_categories.join(', ')}</dd></div>
              <div><dt className="text-neutral-500">Parameters (measured)</dt><dd className="font-mono text-neutral-900">{info.total_parameters ? info.total_parameters.toLocaleString() : 'n/a (model not loaded)'}</dd></div>
              <div><dt className="text-neutral-500">Uncertainty threshold</dt><dd className="font-mono text-neutral-900">{pct(info.uncertainty_threshold)}</dd></div>
              <div><dt className="text-neutral-500">Training weights</dt><dd className="font-mono text-neutral-900">{run?.weights ?? 'n/a (no training record)'}</dd></div>
            </dl>
          </section>

          {/* Dataset */}
          <section className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-700" /> Dataset
              </h2>
              <a
                href={info.dataset_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-emerald-800 flex items-center gap-1"
              >
                Kaggle page <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-xs text-neutral-700 leading-relaxed">
              {info.dataset_name}: the TrashNet photos (Gary Thung &amp; Mindy Yang). Check the license shown on the Kaggle page before reusing the data; the original TrashNet repository is MIT-licensed. Images are not included in this project.
            </p>
            {run?.split_sizes ? (
              <p className="text-xs text-neutral-700">
                Split used in the recorded training run: train {run.split_sizes.train}, validation {run.split_sizes.val}, test {run.split_sizes.test}
                {typeof run.exact_duplicates_removed === 'number' && ` · exact duplicates removed: ${run.exact_duplicates_removed}`}.
              </p>
            ) : (
              <p className="text-xs text-neutral-500">Split sizes appear here after a training run is recorded.</p>
            )}
            {run?.raw_class_counts && (
              <p className="text-xs text-neutral-700">
                Images per class: {Object.entries(run.raw_class_counts).map(([k, v]) => `${k} ${v}`).join(' · ')}. Classes are imbalanced, so class weights are used in training.
              </p>
            )}
          </section>

          {/* Evaluation */}
          <section className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-neutral-900">Held-out test evaluation</h2>
            {!ev ? (
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-700 space-y-2">
                <p className="font-semibold">Not evaluated yet. No metrics are shown because none have been measured.</p>
                <p>Run <code className="font-mono">python training/train.py</code> (it evaluates automatically) or <code className="font-mono">python training/evaluate.py</code> in the backend folder, then redeploy with the generated <code className="font-mono">models/evaluation_report.json</code>.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {[
                    ['Accuracy', ev.accuracy],
                    ['Macro precision', ev.macro_precision],
                    ['Macro recall', ev.macro_recall],
                    ['Macro F1', ev.macro_f1],
                  ].map(([label, v]) => (
                    <div key={label as string} className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                      <span className="text-neutral-500 block">{label as string}</span>
                      <span className="text-2xl font-bold font-mono text-neutral-900">{pct(v as number)}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-neutral-500">Measured on {ev.num_test_images} test images not used for training or model selection. A small test set gives noisy estimates.</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-neutral-200 text-neutral-500">
                        <th className="py-2 px-3">Class</th><th className="py-2 px-3">Precision</th><th className="py-2 px-3">Recall</th><th className="py-2 px-3">F1</th><th className="py-2 px-3">Support</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ev.classes.map((c) => (
                        <tr key={c} className="border-b border-neutral-100">
                          <td className="py-2 px-3 capitalize font-medium">{c}</td>
                          <td className="py-2 px-3">{ev.per_class[c].precision.toFixed(2)}</td>
                          <td className="py-2 px-3">{ev.per_class[c].recall.toFixed(2)}</td>
                          <td className="py-2 px-3">{ev.per_class[c]['f1-score'].toFixed(2)}</td>
                          <td className="py-2 px-3">{ev.per_class[c].support}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="overflow-x-auto">
                  <h3 className="text-xs font-semibold text-neutral-700 mb-2">Confusion matrix (rows: true class, columns: predicted)</h3>
                  <table className="text-xs text-center border-collapse">
                    <thead>
                      <tr>
                        <th className="p-2" />
                        {ev.classes.map((c) => <th key={c} className="p-2 capitalize text-neutral-500">{c}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {ev.confusion_matrix.map((row, i) => (
                        <tr key={i}>
                          <th className="p-2 text-left capitalize text-neutral-500">{ev.classes[i]}</th>
                          {row.map((v, j) => (
                            <td key={j} className={`p-2 border border-neutral-100 font-mono ${i === j ? 'bg-emerald-50 font-bold text-emerald-900' : v > 0 ? 'bg-rose-50 text-rose-800' : 'text-neutral-400'}`}>{v}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
};
