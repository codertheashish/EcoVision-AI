/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AnalyzePage } from './pages/AnalyzePage';
import { DashboardPage } from './pages/DashboardPage';
import { GuidelinesPage } from './pages/GuidelinesPage';
import { AnalysisRecord } from './types/waste';

const STORAGE_KEY_RECORDS = 'ecovision_audit_records_v1';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');

  const [records, setRecords] = useState<AnalysisRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECORDS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore corrupt or unavailable storage
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
    } catch {
      // ignore
    }
  }, [records]);

  const goTo = (tab: NavTab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 font-sans">
      <Navbar currentTab={currentTab} onSelectTab={goTo} />

      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage onStartAnalysis={() => goTo('analyze')} onExploreGuidelines={() => goTo('guidelines')} />
        )}
        {currentTab === 'analyze' && (
          <AnalyzePage onRecordAnalysis={(record) => setRecords((prev) => [record, ...prev])} />
        )}
        {currentTab === 'guidelines' && <GuidelinesPage />}
        {currentTab === 'dashboard' && (
          <DashboardPage
            records={records}
            onClearHistory={() => {
              setRecords([]);
              localStorage.removeItem(STORAGE_KEY_RECORDS);
            }}
            onAnalyzeMore={() => goTo('analyze')}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
