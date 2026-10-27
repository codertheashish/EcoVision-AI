import React from 'react';
import { Leaf } from 'lucide-react';

export const Footer: React.FC = () => (
  <footer className="border-t border-emerald-100 bg-white">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
      <div className="flex items-center gap-2 text-neutral-700 font-semibold">
        <Leaf className="w-4 h-4 text-emerald-600" />
        EcoVision AI
      </div>
      <p className="text-center sm:text-right max-w-xl">
        Suggestions are general guidance. Recycling rules differ by city, so check your local rules.
        Photos are not stored.
      </p>
    </div>
  </footer>
);
