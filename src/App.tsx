import React, { useState, useEffect } from 'react';
import { Language, StudentCheckIn } from './types';
import { Sidebar } from './components/Sidebar';
import { CadberryCheckInView } from './components/CadberryCheckInView';
import { DistressDeltaDashboard } from './components/DistressDeltaDashboard';
import { PeerCircles } from './components/PeerCircles';
import { WellnessToolkit } from './components/WellnessToolkit';
import { VoiceCheckInModal } from './components/VoiceCheckInModal';
import { CrisisHelplineModal } from './components/CrisisHelplineModal';
import {
  getStudentCheckIns,
  saveCheckIn,
  computeDistressMetrics,
} from './services/storageService';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<
    'checkin' | 'patterns' | 'support' | 'toolkit'
  >('checkin');

  const [selectedLanguage, setSelectedLanguage] =
    useState<Language>('en');

  const [checkIns, setCheckIns] = useState<StudentCheckIn[]>([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  useEffect(() => {
    const loaded = getStudentCheckIns();
    setCheckIns(loaded);
  }, []);

  const metrics = computeDistressMetrics(checkIns);

  const handleCheckInSaved = (newRecord: StudentCheckIn) => {
    setCheckIns((prev) => [...prev, newRecord]);
  };

  const handleCheckInFromChat = (rawText: string) => {
    const saved = saveCheckIn({
      stressScore: 5,
      sleepHours: 7.0,
      emotion: 'Grounded',
      note: rawText.slice(0, 100),
      language: selectedLanguage,
    });

    setCheckIns((prev) => [...prev, saved]);
  };

  return (
    <div className="flex min-h-screen bg-[#FAF7F2] text-[#2D2A26] antialiased overflow-x-hidden selection:bg-[#EADDF2] selection:text-[#2E1E3B]">

      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        recentCheckIns={checkIns}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#FAF7F2]">

        {currentTab === 'checkin' && (
          <CadberryCheckInView
            language={selectedLanguage}
            onChangeLanguage={setSelectedLanguage}
            onCheckInCompleted={handleCheckInFromChat}
            onOpenCrisisModal={() => setIsCrisisModalOpen(true)}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          />
        )}

        {currentTab === 'patterns' && (
          <DistressDeltaDashboard
            checkIns={checkIns}
            metrics={metrics}
            onOpenCheckInModal={() => setIsVoiceModalOpen(true)}
            onOpenBreathingModal={() => setCurrentTab('toolkit')}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          />
        )}

        {currentTab === 'support' && (
          <PeerCircles
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          />
        )}

        {currentTab === 'toolkit' && (
          <WellnessToolkit
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          />
        )}
      </main>

      {/* Voice check-in */}
      <VoiceCheckInModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        language={selectedLanguage}
        onCheckInSaved={handleCheckInSaved}
      />

      {/* Crisis / urgent support */}
      <CrisisHelplineModal
        isOpen={isCrisisModalOpen}
        onClose={() => setIsCrisisModalOpen(false)}
      />

    </div>
  );
};

export default App;