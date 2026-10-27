import React, { useState } from 'react';
import { Leaf, Menu, X } from 'lucide-react';

export type NavTab = 'home' | 'analyze' | 'guidelines' | 'dashboard';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

const LINKS: { tab: NavTab; label: string }[] = [
  { tab: 'analyze', label: 'Analyze' },
  { tab: 'guidelines', label: 'Sorting Guide' },
  { tab: 'dashboard', label: 'Dashboard' },
];

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const [open, setOpen] = useState(false);

  const go = (tab: NavTab) => {
    setOpen(false);
    onSelectTab(tab);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-emerald-100">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
        <button onClick={() => go('home')} className="flex items-center gap-2 cursor-pointer">
          <span className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <Leaf className="w-4 h-4" />
          </span>
          <span className="text-lg font-bold tracking-tight text-neutral-900">EcoVision AI</span>
        </button>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
          {LINKS.map(({ tab, label }) => (
            <button
              key={tab}
              onClick={() => go(tab)}
              className={`cursor-pointer transition-colors ${
                currentTab === tab ? 'text-emerald-700 font-semibold' : 'hover:text-neutral-900'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => go('analyze')}
            className="hidden sm:block px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            Classify Waste
          </button>
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="md:hidden p-2 text-neutral-700 rounded-lg hover:bg-neutral-100 cursor-pointer"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-emerald-100 bg-white px-4 py-3 flex flex-col">
          {[{ tab: 'home' as NavTab, label: 'Home' }, ...LINKS].map(({ tab, label }) => (
            <button
              key={tab}
              onClick={() => go(tab)}
              className={`text-left py-3 text-sm cursor-pointer ${
                currentTab === tab ? 'text-emerald-700 font-semibold' : 'text-neutral-700'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
};
