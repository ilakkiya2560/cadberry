import React, { useState, useEffect } from 'react';
import { Language, StudentCheckIn, ChatSession, ChatMessage as AppChatMessage } from './types';
import { Sidebar } from './components/Sidebar';
import { CadberryCheckInView } from './components/CadberryCheckInView';
import { DistressDeltaDashboard } from './components/DistressDeltaDashboard';
import { PeerCircles } from './components/PeerCircles';
import { WellnessToolkit } from './components/WellnessToolkit';
import { VoiceCheckInModal } from './components/VoiceCheckInModal';
import { CrisisHelplineModal } from './components/CrisisHelplineModal';
import { AuthPage } from './components/AuthPage';
import { supabase } from './lib/supabase';
import {
  createChat,
  listChats,
  getChatMessages,
  saveMessage,
  formatChatTitle,
} from './services/chatService';
import {
  getStudentCheckIns,
  saveCheckIn,
  computeDistressMetrics,
  deriveCheckInAnalytics,
} from './services/storageService';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<
    'checkin' | 'patterns' | 'support' | 'toolkit'
  >('checkin');

  const [selectedLanguage, setSelectedLanguage] =
    useState<Language>('en');

  const [checkIns, setCheckIns] = useState<StudentCheckIn[]>([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<AppChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Modals
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setSessionReady(true);
    };

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      void event;
      setUser(session?.user ?? null);
      setSessionReady(true);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const loaded = getStudentCheckIns();
    setCheckIns(loaded);
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setProfileName(null);
      setChatSessions([]);
      setActiveChatId(null);
      setChatMessages([]);
      return;
    }

    const loadChats = async () => {
      try {
        const chats = await listChats(user.id);
        setChatSessions(chats);

        if (chats.length > 0 && !activeChatId) {
          setActiveChatId(chats[0].id);
        }
      } catch (error) {
        console.error('Failed to load chat sessions:', error);
      }
    };

    void loadChats();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Failed to load profile:', error);
        setProfileName(null);
        return;
      }

      setProfileName(data?.full_name?.trim() || null);
    };

    void loadProfile();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !activeChatId) {
      setChatMessages([]);
      return;
    }

    const loadMessages = async () => {
      setChatLoading(true);
      setChatError(null);
      try {
        const persisted = await getChatMessages(activeChatId, user.id);
        const mapped: AppChatMessage[] = persisted.map((item) => ({
          id: item.id,
          sender: item.sender,
          text: item.content,
          timestamp: new Date(item.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          language: (item.language as Language) || selectedLanguage,
        }));
        setChatMessages(mapped);
      } catch (error) {
        console.error('Failed to load chat messages:', error);
        setChatError('Could not restore your recent conversation.');
      } finally {
        setChatLoading(false);
      }
    };

    void loadMessages();
  }, [activeChatId, user?.id]);

  const metrics = computeDistressMetrics(checkIns);

  const handleCheckInSaved = (newRecord: StudentCheckIn) => {
    setCheckIns((prev) => [...prev, newRecord]);
  };

  const handleCheckInFromChat = (rawText: string) => {
    const derived = deriveCheckInAnalytics(rawText, selectedLanguage);
    const saved = saveCheckIn({
      ...derived,
      note: rawText.slice(0, 100),
      language: selectedLanguage,
    });

    setCheckIns((prev) => [...prev, saved]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleCreateNewChat = async () => {
    if (!user?.id) return;

    try {
      const created = await createChat(user.id, formatChatTitle(new Date()));
      setChatSessions((prev) => [created, ...prev]);
      setActiveChatId(created.id);
      setChatMessages([]);
      setChatError(null);
    } catch (error) {
      console.error('Failed to create new chat:', error);
      setChatError('Could not create a new chat right now.');
    }
  };

  const handlePersistedSend = async (text: string, language: Language) => {
    if (!user?.id || !activeChatId) return;

    try {
      await saveMessage({
        chatId: activeChatId,
        userId: user.id,
        sender: 'user',
        content: text,
        language,
      });
      setChatSessions((prev) =>
        [...prev.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, updated_at: new Date().toISOString() }
            : chat
        )].sort((first, second) =>
          new Date(second.updated_at).getTime() - new Date(first.updated_at).getTime()
        )
      );
    } catch (error) {
      console.error('Failed to persist user message:', error);
      setChatError('Your message was sent, but saving it failed.');
    }
  };

  const handleCadberryPersistedReply = async (text: string, language: Language) => {
    if (!user?.id || !activeChatId) return;

    try {
      await saveMessage({
        chatId: activeChatId,
        userId: user.id,
        sender: 'cadberry',
        content: text,
        language,
      });
      setChatSessions((prev) =>
        [...prev.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, updated_at: new Date().toISOString() }
            : chat
        )].sort((first, second) =>
          new Date(second.updated_at).getTime() - new Date(first.updated_at).getTime()
        )
      );
    } catch (error) {
      console.error('Failed to persist Cadberry reply:', error);
      setChatError('Cadberry replied, but saving the response failed.');
    }
  };

  if (!sessionReady) {
    return <div className="min-h-screen bg-[#FAF7F2]" />;
  }

  if (!user) {
    return <AuthPage onAuthSuccess={() => undefined} />;
  }

  return (
    <div className="flex min-h-screen bg-[#FAF7F2] text-[#2D2A26] antialiased overflow-x-hidden selection:bg-[#EADDF2] selection:text-[#2E1E3B]">
      <button
        type="button"
        onClick={handleLogout}
        className="absolute right-4 top-4 z-20 rounded-full border border-[#E7DFC9] bg-white px-4 py-2 text-sm font-medium text-[#2D2A26] shadow-sm transition hover:bg-[#F7F3EE]"
      >
        Log out
      </button>

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
            username={profileName || user.user_metadata?.full_name || null}
            chatSessions={chatSessions}
            activeChatId={activeChatId}
            chatMessages={chatMessages}
            chatLoading={chatLoading}
            chatError={chatError}
            onSelectChat={setActiveChatId}
            onCreateNewChat={handleCreateNewChat}
            onPersistUserMessage={handlePersistedSend}
            onPersistCadberryReply={handleCadberryPersistedReply}
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