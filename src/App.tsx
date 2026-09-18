import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Language, StudentCheckIn, MentalHealthSignals } from './types';
import { Navbar } from './components/Navbar';
import { CadberryLiveCompanion } from './components/CadberryLiveCompanion';
import { VoiceCheckInModal } from './components/VoiceCheckInModal';
import { DistressDeltaDashboard } from './components/DistressDeltaDashboard';
import { PeerCircles } from './components/PeerCircles';
import { WellnessToolkit } from './components/WellnessToolkit';
import { CrisisHelplineModal } from './components/CrisisHelplineModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import {
  getStudentCheckIns,
  saveCheckIn,
  computeDistressMetrics,
  getStoredApiKey,
} from './services/storageService';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'live' | 'checkin' | 'trends' | 'circles' | 'toolkit'>('live');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [checkIns, setCheckIns] = useState<StudentCheckIn[]>([]);
  const [apiKey, setApiKey] = useState<string>('');

  // Modals
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  useEffect(() => {
    const loaded = getStudentCheckIns();
    setCheckIns(loaded);
    setApiKey(getStoredApiKey());
  }, []);

  const metrics = computeDistressMetrics(checkIns);

  const handleCheckInSaved = (newRecord: StudentCheckIn) => {
    setCheckIns((prev) => [...prev, newRecord]);
    if ((newRecord.distressDelta || 0) <= -15) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {
        // ignore
      }
    }
  };

  const handleSignalFromLiveChat = (signals: MentalHealthSignals, rawText: string) => {
    // Proactively log signal into student's history
    const saved = saveCheckIn({
      stressScore: signals.stressScore,
      sleepHours: 7.0 - (signals.sleepDeficitHours || 0),
      emotion: signals.primaryEmotion,
      note: rawText.slice(0, 100),
      language: selectedLanguage,
    });
    setCheckIns((prev) => [...prev, saved]);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 flex flex-col selection:bg-teal-100 selection:text-teal-900">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'checkin') {
            setIsCheckInModalOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        selectedLanguage={selectedLanguage}
        onChangeLanguage={setSelectedLanguage}
        distressMetrics={metrics}
        onOpenCrisisModal={() => setIsCrisisModalOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        hasCustomApiKey={!!apiKey}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-10">
        {currentTab === 'live' && (
          <CadberryLiveCompanion
            language={selectedLanguage}
            onCheckInCompleted={handleSignalFromLiveChat}
            onOpenCrisisModal={() => setIsCrisisModalOpen(true)}
            onOpenBreathingModal={() => setCurrentTab('toolkit')}
            onOpenPeerCircles={() => setCurrentTab('circles')}
            apiKey={apiKey}
          />
        )}

        {currentTab === 'trends' && (
          <DistressDeltaDashboard
            checkIns={checkIns}
            metrics={metrics}
            onOpenCheckInModal={() => setIsCheckInModalOpen(true)}
            onOpenBreathingModal={() => setCurrentTab('toolkit')}
          />
        )}

        {currentTab === 'circles' && <PeerCircles />}

        {currentTab === 'toolkit' && <WellnessToolkit />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Cadberry</span>
          <span>• AI for student connection & emotional well-being</span>
        </div>
        <div className="text-[11px] text-slate-400">
          Emergency Mental Health: Tele-MANAS (14416 / 1800 891 4416) • Toll-free 24/7
        </div>
      </footer>

      {/* Global Modals */}
      <VoiceCheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        language={selectedLanguage}
        onCheckInSaved={handleCheckInSaved}
        apiKey={apiKey}
      />

      <CrisisHelplineModal
        isOpen={isCrisisModalOpen}
        onClose={() => setIsCrisisModalOpen(false)}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onApiKeyUpdated={setApiKey}
      />
    </div>
  );
};

export default App;
