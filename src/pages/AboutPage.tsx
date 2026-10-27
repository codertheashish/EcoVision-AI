import React from 'react';
import { ShieldCheck, Server, Globe, Cpu, Lock, CheckCircle2, Terminal } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
          <Globe className="w-3.5 h-3.5" />
          <span>System Architecture & Governance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
          About EcoVision AI
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-2xl">
          A student project: a React frontend on Vercel that sends images to a FastAPI service on Render, which runs a fine-tuned MobileNetV2 model.
        </p>
      </div>

      {/* Privacy Guarantee */}
      <section className="bg-emerald-900 text-white rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-700/80 flex items-center justify-center">
            <Lock className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Privacy & Ethical Data Protocol</h2>
            <span className="text-xs text-emerald-200">Uploads are not stored</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed max-w-3xl mb-4">
          How the code handles your data:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-emerald-100">
          <div className="bg-white/10 p-3.5 rounded-lg border border-white/15">
            <span className="font-semibold block text-white mb-1">In-Memory Ingestion</span>
            Uploaded images are decoded in memory for the prediction and are never written to disk by the backend.
          </div>
          <div className="bg-white/10 p-3.5 rounded-lg border border-white/15">
            <span className="font-semibold block text-white mb-1">No Profiling or Tracking</span>
            The app has no accounts, cookies or analytics. Feedback, if you send it, is written to the server log without the image.
          </div>
          <div className="bg-white/10 p-3.5 rounded-lg border border-white/15">
            <span className="font-semibold block text-white mb-1">Open Source & Auditable</span>
            Training, evaluation and API code are in the repository so the results can be reproduced.
          </div>
        </div>
      </section>

      {/* Two-Tier Architecture */}
      <section className="bg-white rounded-xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 mb-1">
            Production Deployment Topology
          </h2>
          <p className="text-xs text-neutral-500">
            Two separate deployments: static frontend on Vercel, ML API on Render.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Frontend Box */}
          <div className="p-5 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-700" />
              <h3 className="text-sm font-bold text-neutral-900">
                Frontend (Vercel)
              </h3>
            </div>
            <ul className="text-xs text-neutral-600 space-y-1.5 list-disc list-inside">
              <li>Framework: React 19 + Vite + TypeScript</li>
              <li>Styling: Tailwind CSS v4 design system</li>
              <li>Visualizations: Recharts SVG data graphics</li>
              <li>Config: Reads <code className="text-emerald-700 font-mono">VITE_API_BASE_URL</code></li>
            </ul>
          </div>

          {/* Backend Box */}
          <div className="p-5 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-3">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-teal-700" />
              <h3 className="text-sm font-bold text-neutral-900">
                Backend API (Render Cloud)
              </h3>
            </div>
            <ul className="text-xs text-neutral-600 space-y-1.5 list-disc list-inside">
              <li>Framework: Python & FastAPI</li>
              <li>Serving: Uvicorn ASGI server</li>
              <li>ML Inference: MobileNetV2 (Keras model file loaded once at startup)</li>
              <li>Sanitization: Pillow decoding with size, pixel and format limits</li>
              <li>CORS: Restricted to approved frontend origins</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Local Development Commands */}
      <section className="bg-white rounded-xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-neutral-700" />
          <span>Local Development Setup</span>
        </h2>

        <div className="space-y-3 text-xs">
          <div>
            <span className="font-semibold text-neutral-800 block mb-1">
              1. Start Backend FastAPI Service:
            </span>
            <div className="bg-neutral-900 text-neutral-200 p-3 rounded-lg font-mono">
              cd backend<br />
              pip install -r requirements.txt<br />
              uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload<br />
              # then open http://127.0.0.1:8000/docs
            </div>
          </div>

          <div>
            <span className="font-semibold text-neutral-800 block mb-1">
              2. Start Frontend Development Server:
            </span>
            <div className="bg-neutral-900 text-neutral-200 p-3 rounded-lg font-mono">
              npm install<br />
              npm run dev<br />
              # then open http://127.0.0.1:3000
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
