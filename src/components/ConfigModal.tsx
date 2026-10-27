import React, { useState } from 'react';
import { X, Server, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { API_BASE_URL, fetchHealth } from '../services/classifierService';
import { BackendHealth } from '../types/waste';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Read-only backend connection status. The URL comes from VITE_API_BASE_URL at build time. */
export const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose }) => {
  const [checking, setChecking] = useState(false);
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const runCheck = async () => {
    setChecking(true);
    setError(null);
    setHealth(null);
    try {
      setHealth(await fetchHealth());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connection failed.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl border border-neutral-200 max-w-md w-full shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-neutral-900">Backend Connection</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div>
            <span className="font-semibold text-neutral-800 block mb-1">API base URL</span>
            <code className="block bg-neutral-100 rounded-lg px-3 py-2 font-mono break-all text-neutral-700">
              {API_BASE_URL || 'Not configured (set VITE_API_BASE_URL)'}
            </code>
            <p className="text-[11px] text-neutral-500 mt-1">
              Set at build time with the <code>VITE_API_BASE_URL</code> environment variable.
            </p>
          </div>

          <button
            onClick={runCheck}
            disabled={checking}
            className="px-4 py-2 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:bg-neutral-400 rounded-lg flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Checking…' : 'Test connection'}</span>
          </button>

          {health && (
            <div
              className={`p-3 rounded-lg border flex items-start gap-2 ${
                health.model_loaded
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              {health.model_loaded ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <div>
                <span className="font-semibold block">
                  Server reachable · model {health.model_loaded ? 'loaded' : 'NOT loaded'}
                </span>
                {!health.model_loaded && health.detail}
              </div>
            </div>
          )}
          {error && (
            <div className="p-3 rounded-lg border bg-rose-50 border-rose-200 text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <div>{error}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
