import React from 'react';
import { ArrowRight, Camera, Cpu, Recycle } from 'lucide-react';
import { HERO_IMAGE } from '../assets/images';
import { WASTE_GUIDANCE_MAP } from '../data/recommendations';

interface HomePageProps {
  onStartAnalysis: () => void;
  onExploreGuidelines: () => void;
}

const STEPS = [
  { icon: Camera, title: 'Upload a photo', text: 'Take or choose a picture of the item.' },
  { icon: Cpu, title: 'AI identifies it', text: 'The model predicts the material and shows how confident it is.' },
  { icon: Recycle, title: 'Sort it right', text: 'Get clear steps for preparing and disposing of it.' },
];

export const HomePage: React.FC<HomePageProps> = ({ onStartAnalysis, onExploreGuidelines }) => {
  const categories = Object.values(WASTE_GUIDANCE_MAP);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 leading-tight">
              Know where your waste belongs.
            </h1>
            <p className="text-lg text-neutral-600 leading-relaxed max-w-lg">
              Upload a photo and EcoVision AI tells you whether it is cardboard, glass, metal, paper,
              plastic or general trash, with simple steps to recycle it properly.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={onStartAnalysis}
                className="px-6 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
              >
                Classify Waste <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onExploreGuidelines}
                className="px-6 py-3 text-sm font-semibold text-emerald-800 bg-white border border-emerald-200 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
              >
                Sorting Guide
              </button>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-emerald-100 shadow-lg">
            <img src={HERO_IMAGE} alt="Sorted recyclable materials" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-bold text-neutral-900 text-center mb-10">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-10">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-1">
                {i + 1}. {title}
              </h3>
              <p className="text-sm text-neutral-600 max-w-xs mx-auto">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What it recognises */}
      <section className="bg-emerald-50/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-2xl font-bold text-neutral-900 text-center mb-2">What it recognises</h2>
          <p className="text-sm text-neutral-600 text-center mb-8">
            Six material types. Batteries, electronics and food waste are not covered.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-emerald-100 px-4 py-4"
              >
                <div className="font-semibold text-neutral-900 capitalize">{c.id}</div>
                <div className="text-xs text-neutral-500 mt-0.5">{c.recyclableStatus}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">Try it with an item near you</h2>
        <button
          onClick={onStartAnalysis}
          className="px-6 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
        >
          Classify Waste
        </button>
      </section>
    </div>
  );
};
