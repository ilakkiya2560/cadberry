import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  PhoneCall,
  ShieldAlert,
  Menu,
  ChevronDown,
  Plus,
  MessageSquareText,
} from 'lucide-react';
import { ChatMessage, Language, PrimaryEmotion, ChatSession } from '../types';
import { cadberryAI } from '../services/cadberryAI';
import { voiceService } from '../services/voiceService';
import { SUPPORTED_LANGUAGES } from '../services/languageConfig';

interface CadberryCheckInViewProps {
  language: Language;
  onChangeLanguage: (lang: Language) => void;
  onCheckInCompleted?: (note: string) => void;
  onOpenCrisisModal: () => void;
  onOpenMobileSidebar: () => void;
  username?: string | null;
  chatSessions?: ChatSession[];
  activeChatId?: string | null;
  chatMessages?: ChatMessage[];
  chatLoading?: boolean;
  chatError?: string | null;
  onSelectChat?: (chatId: string) => void;
  onCreateNewChat?: () => void;
  onPersistUserMessage?: (text: string, language: Language) => void;
  onPersistCadberryReply?: (text: string, language: Language) => void;
}

export const CadberryCheckInView: React.FC<CadberryCheckInViewProps> = ({
  language,
  onChangeLanguage,
  onCheckInCompleted,
  onOpenCrisisModal,
  onOpenMobileSidebar,
  username,
  chatSessions = [],
  activeChatId,
  chatMessages = [],
  chatLoading = false,
  chatError = null,
  onSelectChat,
  onCreateNewChat,
  onPersistUserMessage,
  onPersistCadberryReply,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-1',
      sender: 'cadberry',
      text:
        language === 'hinglish'
          ? "Hey there, main Cadberry hoon. Chahe aap exhausted feel kar rahe ho, ya kuch ajeeb lag raha ho — I'm right here with you. Kaise ho aaj?"
          : language === 'hi'
          ? "नमस्ते, मैं कैडबरी हूँ। अगर आज मन में कोई भारीपन या सामान्य से अलग महसूस हो रहा है, तो मैं यहाँ आपके साथ हूँ। आज कैसा महसूस हो रहा है?"
          : language === 'ta'
          ? "வணக்கம், நான் கேட்பரி. இன்று உங்கள் மனம் சோர்வாகவோ அல்லது இயல்புக்கு மாறாகவோ இருந்தால் தயங்காமல் பகிருங்கள். நான் கேட்கிறேன்."
          : "Hello, I am Cadberry. Whenever you're feeling weighed down, overwhelmed, or simply feel 'different' and need a quiet space to check in — I am right here with you.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: language,
    },
  ]);

  useEffect(() => {
    if (chatMessages.length > 0) {
      setMessages(chatMessages);
      return;
    }

    setMessages([
      {
        id: 'init-1',
        sender: 'cadberry',
        text:
          language === 'hinglish'
            ? "Hey there, main Cadberry hoon. Chahe aap exhausted feel kar rahe ho, ya kuch ajeeb lag raha ho — I'm right here with you. Kaise ho aaj?"
            : language === 'hi'
            ? "नमस्ते, मैं कैडबरी हूँ। अगर आज मन में कोई भारीपन या सामान्य से अलग महसूस हो रहा है, तो मैं यहाँ आपके साथ हूँ। आज कैसा महसूस हो रहा है?"
            : language === 'ta'
            ? "வணக்கம், நான் கேட்பரி. இன்று உங்கள் மனம் சோர்வாகவோ அல்லது இயல்புக்கு மாறாகவோ இருந்தால் தயங்காமல் பகிருங்கள். நான் கேட்கிறேன்."
            : "Hello, I am Cadberry. Whenever you're feeling weighed down, overwhelmed, or simply feel 'different' and need a quiet space to check in — I am right here with you.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
      },
    ]);
  }, [chatMessages, language]);

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  // Safety Distress Banner State
  const [isSafetyHalted, setIsSafetyHalted] = useState(false);
  const [haltReason, setHaltReason] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript, isThinking]);

  useEffect(() => {
    return () => {
      voiceService.stopSpeaking();
      voiceService.stopListening();
    };
  }, []);

  const handleSendMessage = async (textToSend: string, isVoice = false) => {
    if (!textToSend.trim() || isThinking || isSafetyHalted) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language,
      isVoiceInput: isVoice,
    };

    setMessages((prev) => [...prev, userMsg]);
    onPersistUserMessage?.(textToSend.trim(), language);
    setInputText('');
    setInterimTranscript('');
    setIsThinking(true);

    try {
      // 1. Send through the dedicated Cadberry AI conversation service
      // (Handles safety check first -> Gemini API with full conversation context -> natural response)
      const result = await cadberryAI.sendMessage(textToSend, language);

      // 2. If safety concern is detected, halt AI conversation and activate calm support banner
      if (result.isSafetyHalt) {
        voiceService.stopListening();
        voiceService.stopSpeaking();
        setIsListening(false);
        setIsSafetyHalted(true);
        setHaltReason(result.safetyDetails?.triggeredCategory || 'Acute safety concern');

        const safetyMsg: ChatMessage = {
          id: 'msg-' + (Date.now() + 1),
          sender: 'cadberry',
          text: result.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          language,
        };

        setMessages((prev) => [...prev, safetyMsg]);

        if (!isMuted) {
          setIsSpeaking(true);
          voiceService.speak(
            result.text,
            language,
            'Overwhelmed',
            () => setIsSpeaking(true),
            () => setIsSpeaking(false)
          );
        }
        return;
      }

      // 3. Normal natural conversational response from Gemini
      const cadberryMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'cadberry',
        text: result.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
      };

      setMessages((prev) => [...prev, cadberryMsg]);
      onPersistCadberryReply?.(result.text, language);

      if (onCheckInCompleted) {
        onCheckInCompleted(textToSend);
      }

      // Voice read-out if unmuted
      if (!isMuted) {
        setIsSpeaking(true);
        voiceService.speak(
          result.text,
          language,
          undefined,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        );
      }
    } catch (err) {
      console.error('Cadberry conversation error:', err);
      const errorMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'cadberry',
        text: 'I experienced an unexpected connection issue. Please check your network and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const toggleMicListening = () => {
    if (isSafetyHalted) return;

    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
      if (interimTranscript.trim()) {
        handleSendMessage(interimTranscript.trim(), true);
      }
    } else {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
      setInterimTranscript('');
      const started = voiceService.startListening(
        language,
        (text, isFinal) => {
          setInterimTranscript(text);
          if (isFinal) {
            handleSendMessage(text, true);
            setIsListening(false);
          }
        },
        (err) => {
          console.warn('Voice recognition error:', err);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );
      if (started) setIsListening(true);
    }
  };

  const toggleMute = () => {
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    }
    setIsMuted(!isMuted);
  };

  const replayMessageVoice = (text: string, emotion?: PrimaryEmotion) => {
    if (isSafetyHalted) return;
    voiceService.stopSpeaking();
    setIsSpeaking(true);
    voiceService.speak(
      text,
      language,
      emotion,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const currentLanguageLabel =
    SUPPORTED_LANGUAGES.find((l) => l.code === language)?.label.toUpperCase() || 'ENGLISH';

  return (
    <div className="flex-1 flex flex-col h-screen max-w-6xl mx-auto px-4 sm:px-8 py-6 overflow-hidden">
      {/* Top Header: CHECK-IN · LANGUAGE */}
      <header className="flex items-center justify-between pb-4 border-b border-[#EAE4DC]/60 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="p-1.5 rounded-lg text-[#78726A] hover:bg-[#F4EFEA] md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-[0.18em] text-[#78726A] uppercase">
              CHECK-IN · {currentLanguageLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCreateNewChat}
            className="inline-flex items-center gap-2 rounded-full border border-[#E7DFC9] bg-white px-3 py-1.5 text-[11px] font-medium text-[#2D2A26] shadow-sm transition hover:bg-[#F7F3EE]"
          >
            <Plus className="h-3.5 w-3.5" />
            New Chat
          </button>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Subtle Language Selector */}
          <div className="relative inline-block">
            <select
              value={language}
              onChange={(e) => onChangeLanguage(e.target.value as Language)}
              className="appearance-none bg-transparent hover:bg-[#F4EFEA] text-[#78726A] hover:text-[#2D2A26] text-xs font-medium py-1 pl-2 pr-6 rounded-lg cursor-pointer transition focus:outline-hidden"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeLabel}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[#78726A] pointer-events-none absolute right-1.5 top-2" />
          </div>

          {/* Discreet Voice Mute Button */}
          <button
            onClick={toggleMute}
            title={isMuted ? 'Unmute voice' : 'Mute voice'}
            className="p-1.5 text-[#78726A] hover:text-[#2D2A26] rounded-lg transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-[#BA5344]" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Quiet Helpline link */}
          <button
            onClick={onOpenCrisisModal}
            className="text-xs text-[#78726A] hover:text-[#BA5344] font-medium transition ml-1"
          >
            Helpline
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-5 py-6">
        <aside className="w-full md:w-56 lg:w-64 shrink-0 rounded-2xl border border-[#EAE4DC] bg-white/60 p-3">
          <div className="flex items-center gap-2 px-2 pb-3">
            <MessageSquareText className="h-4 w-4 text-[#3D706E]" />
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#78726A]">
              Chat history
            </h3>
          </div>
          <div className="max-h-32 space-y-1 overflow-y-auto md:max-h-none md:h-[calc(100vh-13rem)]">
            {chatSessions.length > 0 ? (
              chatSessions.map((chat) => (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => onSelectChat?.(chat.id)}
                  className={`w-full rounded-xl px-3 py-2.5 text-left text-xs transition ${
                    chat.id === activeChatId
                      ? 'border border-[#D7C6E4] bg-[#F3ECF8] text-[#4B3857]'
                      : 'border border-transparent text-[#78726A] hover:border-[#EAE4DC] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <span className="block truncate font-medium">{chat.title}</span>
                </button>
              ))
            ) : (
              <p className="px-2 py-3 text-xs italic text-[#A69F96]">No chats yet.</p>
            )}
          </div>
        </aside>

        {/* Scrollable Conversation Stream */}
        <div className="min-w-0 flex-1 overflow-y-auto space-y-6 pr-1">
        {/* Large Editorial Serif Heading */}
        <div className="pt-2">
          <h2 className="font-serif text-3xl sm:text-4xl text-[#2D2A26] font-normal tracking-tight">
            Hello, {username || 'there'}
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#78726A] font-light mt-1.5">
            a private space to slow down and check in with yourself
          </p>
        </div>

        {/* Soft Lavender Welcome Card */}
        <div className="bg-[#F3ECF8] border border-[#EADDF2] rounded-2xl p-5 sm:p-6 shadow-2xs">
          <h3 className="font-serif text-lg font-medium text-[#4B3857]">
            I'm here with you.
          </h3>
          <p className="font-sans text-xs sm:text-sm text-[#644D73] mt-1.5 leading-relaxed">
            Take your time. Tell me what you are noticing, or simply start with a few words.
          </p>
        </div>

        {/* Calm Soft Peach / Salmon Safety Support Banner (Appears when distress detected) */}
        {isSafetyHalted && (
          <div className="bg-[#FFF7F5] border border-[#F8DBD4] rounded-2xl p-5 shadow-2xs animate-fade-in">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-[#BA5344] shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <h4 className="font-serif font-medium text-base text-[#943D30]">
                  Support is right here with you
                </h4>
                <p className="text-xs sm:text-sm text-[#BA5344] leading-relaxed font-normal">
                  We noticed you may be carrying something very heavy right now. Because your life and safety are the most important, an AI cannot replace human medical care. We encourage you to reach out to a free, confidential helpline or doctor immediately.
                </p>

                {/* Direct Helpline Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href="tel:14416"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2F5957] text-white text-xs font-semibold hover:bg-[#234442] transition shadow-xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Tele-MANAS (14416)</span>
                  </a>

                  <a
                    href="tel:112"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#BA5344] text-white text-xs font-semibold hover:bg-[#943D30] transition shadow-xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call 112 (Emergency)</span>
                  </a>

                  <button
                    onClick={() => {
                      setIsSafetyHalted(false);
                      voiceService.stopSpeaking();
                      setIsSpeaking(false);
                    }}
                    className="px-3 py-1.5 text-xs text-[#78726A] hover:text-[#2D2A26] underline ml-auto"
                  >
                    I am safe (Resume)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Existing Messages Stream */}
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-2xl rounded-2xl p-4 sm:p-5 text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#FAF7F2] border border-[#EAE4DC] text-[#2D2A26]'
                    : 'bg-[#FAF7F2] border border-[#EADDF2]/80 text-[#2D2A26]'
                }`}
              >
                {msg.sender === 'cadberry' && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-[#78726A] uppercase tracking-wider">
                      Cadberry
                    </span>
                    <button
                      onClick={() => replayMessageVoice(msg.text, msg.signals?.primaryEmotion)}
                      className="text-[11px] text-[#3D706E] hover:text-[#2F5957] flex items-center gap-1 font-medium transition"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Listen</span>
                    </button>
                  </div>
                )}

                <p className="whitespace-pre-wrap font-sans text-sm sm:text-base text-[#2D2A26] font-normal">
                  {msg.text}
                </p>
              </div>
              <span className="text-[10px] text-[#A69F96] mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {/* Interim speech-to-text transcript bubble */}
          {interimTranscript && (
            <div className="flex flex-col items-end">
              <div className="max-w-2xl rounded-2xl p-4 bg-[#FAF7F2] border border-[#3D706E]/40 text-[#78726A] text-sm italic">
                "{interimTranscript}..."
              </div>
            </div>
          )}

          {/* Thinking state */}
          {isThinking && (
            <div className="flex items-center gap-2 text-xs text-[#78726A] py-1 pl-2">
              <div className="w-2 h-2 rounded-full bg-[#3D706E] animate-pulse" />
              <span>Cadberry is reflecting with you...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
        </div>
      </div>

      {/* Suggested Starter Prompts (Quiet, Subtle Chips) */}
      {!isSafetyHalted && (
        <div className="py-2 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[11px] text-[#A69F96] font-medium shrink-0">
            Start with:
          </span>
          {[
            'I feel disconnected from everything',
            'My deadlines feel impossible right now',
            'I have not slept well in days',
            'Can we just pause together?'
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1 rounded-full bg-[#F4EFEA] hover:bg-[#ECE4DC] text-xs text-[#78726A] hover:text-[#2D2A26] whitespace-nowrap transition border border-[#EAE4DC]/50"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Large Rounded Composer at the bottom */}
      <div className="pt-2 pb-1 shrink-0">
        <div className="relative bg-white border border-[#EAE4DC] hover:border-[#DFD5C8] focus-within:border-[#3D706E] rounded-3xl p-2 sm:p-3 shadow-xs transition flex items-center gap-2 sm:gap-3">
          {/* Integrated Voice Button inside the Composer */}
          <button
            onClick={toggleMicListening}
            title={isListening ? 'Stop Listening' : 'Voice to text'}
            disabled={isSafetyHalted}
            className={`p-2.5 rounded-2xl transition flex items-center gap-1.5 text-xs font-medium ${
              isListening
                ? 'bg-[#FEEDEA] text-[#BA5344] animate-pulse'
                : isSpeaking
                ? 'bg-[#F3ECF8] text-[#644D73]'
                : 'bg-[#F4EFEA] hover:bg-[#ECE4DC] text-[#78726A] hover:text-[#2D2A26]'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 text-[#BA5344]" />
                <span className="hidden sm:inline">Listening...</span>
              </>
            ) : isSpeaking ? (
              <>
                <Volume2 className="w-4 h-4 text-[#644D73]" />
                <span className="hidden sm:inline">Speaking...</span>
              </>
            ) : isThinking ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-[#78726A] border-t-transparent animate-spin" />
                <span className="hidden sm:inline">Processing...</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span className="hidden sm:inline">Voice to text</span>
              </>
            )}
          </button>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage(inputText);
            }}
            disabled={isSafetyHalted}
            placeholder={
              isSafetyHalted
                ? 'Conversation paused for safety. Please call the helpline above.'
                : 'Write what is here...'
            }
            className="flex-1 bg-transparent text-sm sm:text-base text-[#2D2A26] placeholder-[#A69F96] focus:outline-hidden px-2"
          />

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage(inputText)}
            disabled={!inputText.trim() || isThinking || isSafetyHalted}
            className="p-2.5 sm:px-4 rounded-2xl bg-[#2F5957] hover:bg-[#234442] disabled:opacity-30 text-white text-xs sm:text-sm font-medium transition flex items-center gap-1.5 shadow-2xs"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
