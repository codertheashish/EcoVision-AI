import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { WASTE_GUIDANCE_MAP, HAZARDOUS_WASTE_GUIDELINES } from '../data/recommendations';
import { WasteCategory } from '../types/waste';

export const GuidelinesPage: React.FC = () => {
  const [selected, setSelected] = useState<WasteCategory>('cardboard');
  const categories = Object.keys(WASTE_GUIDANCE_MAP) as WasteCategory[];
  const current = WASTE_GUIDANCE_MAP[selected];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Sorting guide</h1>
        <p className="text-neutral-600 mt-2">How to prepare each type of material.</p>
      </div>

      {/* Category tabs */}
      <div>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((key) => (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize cursor-pointer transition-colors ${
                selected === key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              {key}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              {current.recyclableStatus}
            </span>
            <h2 className="text-2xl font-bold text-neutral-900 mt-1">{current.name}</h2>
            <p className="text-neutral-600 mt-1">{current.shortDesc}</p>
          </div>

          <ol className="space-y-3">
            {current.preparationRules.map((rule, i) => (
              <li key={i} className="flex gap-3 text-sm text-neutral-700 leading-relaxed">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span>{rule}</span>
              </li>
            ))}
          </ol>

          {current.safetyWarning && (
            <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-lg p-4 text-sm text-rose-900">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{current.safetyWarning}</span>
            </div>
          )}

          <div className="text-sm text-neutral-600 space-y-1.5">
            <p>
              <span className="font-semibold text-neutral-800">Tip: </span>
              {current.ecoTip}
            </p>
            <p>
              <span className="font-semibold text-neutral-800">Check locally: </span>
              {current.localFacilityNote}
            </p>
            <p>
              <span className="font-semibold text-neutral-800">Examples: </span>
              {current.commonExamples.join(', ')}
            </p>
          </div>
        </div>
      </div>

      {/* Hazardous items */}
      <section className="border-t border-emerald-100 pt-10 space-y-5">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">Never put these in household bins</h2>
          <p className="text-sm text-neutral-600 mt-1">
            The classifier does not detect these items. Take them to a household hazardous waste drop-off.
          </p>
        </div>
        <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
          {HAZARDOUS_WASTE_GUIDELINES.map((item) => (
            <li key={item.name} className="text-sm">
              <div className="font-semibold text-neutral-900">{item.name}</div>
              <p className="text-neutral-600 mt-0.5 leading-relaxed">{item.safeDisposal}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
