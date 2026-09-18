import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  RefreshCw,
  Wind,
  Users,
  ShieldAlert,
  Bot,
  User,
  Heart,
  Flame,
  PhoneCall,
  AlertTriangle,
  Lock,
  Stethoscope,
  Ambulance,
  PhoneForwarded,
  CheckCircle2
} from 'lucide-react';
import { ChatMessage, Language, MentalHealthSignals, PrimaryEmotion } from '../types';
import { askCadberry } from '../services/geminiService';
import { voiceService } from '../services/voiceService';
import { STUDENT_SAMPLE_PRESETS, StudentSamplePreset } from '../services/languageConfig';
import { EMERGENCY_SERVICES } from '../services/safetyNet';

interface CadberryLiveCompanionProps {
  language: Language;
  onCheckInCompleted: (signals: MentalHealthSignals, note: string) => void;
  onOpenCrisisModal: () => void;
  onOpenBreathingModal: () => void;
  onOpenPeerCircles: () => void;
  apiKey?: string;
}

export const CadberryLiveCompanion: React.FC<CadberryLiveCompanionProps> = ({
  language,
  onCheckInCompleted,
  onOpenCrisisModal,
  onOpenBreathingModal,
  onOpenPeerCircles,
  apiKey,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-1',
      sender: 'cadberry',
      text:
        language === 'hinglish'
          ? "Hey there! Main Cadberry hoon. Chahe aap exhausted feel kar rahe ho, ya kuch ajeeb aur 'different' lag raha ho — I'm right here with you. Kaise feel ho raha hai aaj?"
          : language === 'hi'
          ? "नमस्ते! मैं कैडबरी हूँ। अगर आज आपको कुछ अजीब या सामान्य से अलग महसूस हो रहा है, तो मैं यहाँ आपके साथ हूँ। कैसा महसूस हो रहा है आज?"
          : language === 'ta'
          ? "வணக்கம்! நான் கேட்கரி. இன்று உங்கள் மனம் சோர்வாகவோ அல்லது இயல்புக்கு மாறாகவோ இருந்தால் தயங்காமல் பகிருங்கள். இன்று எப்படி உணர்கிறீர்கள்?"
          : "Hey there, I'm Cadberry. Whenever you're feeling overwhelmed, exhausted, or just feel 'different' and need a safe place to open up — I am right here with you. What is on your mind right now?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: language,
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [latestSignals, setLatestSignals] = useState<MentalHealthSignals | null>(null);
  const [activeTabMode, setActiveTabMode] = useState<'live' | 'chat'>('live');

  // Safety Intercept State: halts AI audio & text interaction in severe cases
  const [isSafetyHalted, setIsSafetyHalted] = useState(false);
  const [haltReason, setHaltReason] = useState<string>('');
  const [customEmergencyContact, setCustomEmergencyContact] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript]);

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
    setInputText('');
    setInterimTranscript('');
    setIsThinking(true);

    try {
      const history = messages.map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
        text: m.text,
      }));

      const result = await askCadberry(textToSend, language, history, apiKey);

      const cadberryMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'cadberry',
        text: result.responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
        signals: result.signals,
      };

      setMessages((prev) => [...prev, cadberryMsg]);
      setLatestSignals(result.signals);
      onCheckInCompleted(result.signals, textToSend);

      // CRITICAL SAFETY CHECK: Halt AI in severe cases
      if (result.forceHaltAI || result.signals.acuteCrisisDetected || result.signals.riskLevel === 'acute') {
        // 1. Immediately abort active speech recognition & ongoing synthesis
        voiceService.stopListening();
        voiceService.stopSpeaking();
        setIsListening(false);
        setIsSafetyHalted(true);
        setHaltReason(result.signals.academicStrainCues[0] || 'Acute emotional crisis indicator');

        // 2. Speak the solemn protective escalation message
        if (!isMuted) {
          setIsSpeaking(true);
          voiceService.speak(
            "I am pausing our conversation right now because your life and safety are the most important thing. Please connect with a real doctor or the national helpline immediately.",
            language,
            'Overwhelmed',
            () => setIsSpeaking(true),
            () => setIsSpeaking(false)
          );
        }
        return;
      }

      // Normal state: continue voice playback with emotional modulation
      if (!isMuted) {
        setIsSpeaking(true);
        voiceService.speak(
          result.responseText,
          language,
          result.signals.primaryEmotion,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        );
      }
    } catch (err) {
      console.error('Cadberry communication error:', err);
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

  const resetSafetyLock = () => {
    setIsSafetyHalted(false);
    setHaltReason('');
    voiceService.stopSpeaking();
    setIsSpeaking(false);
  };

  const triggerTestCrisis = () => {
    handleSendMessage("I want to end my life tonight, there's no reason to live", false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-5xl mx-auto p-2 sm:p-4 gap-3">
      {/* Top Status Bar */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md transition-all ${
                isSafetyHalted
                  ? 'bg-rose-600 shadow-rose-500/30 animate-pulse'
                  : 'bg-gradient-to-tr from-teal-600 to-purple-600 shadow-purple-500/10'
              }`}
            >
              {isSafetyHalted ? <ShieldAlert className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
            </div>
            {isSpeaking && !isSafetyHalted && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-slate-800 text-base sm:text-lg">
                Cadberry
              </h2>
              <span
                className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${
                  isSafetyHalted
                    ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                    : isSpeaking
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : isListening
                    ? 'bg-teal-50 text-teal-700 border-teal-200'
                    : 'bg-purple-50 text-purple-700 border-purple-200'
                }`}
              >
                {isSafetyHalted
                  ? '🛑 AI INTERACTION HALTED FOR SAFETY'
                  : isSpeaking
                  ? 'Speaking with natural voice'
                  : isListening
                  ? 'Listening actively...'
                  : isThinking
                  ? 'Reflecting...'
                  : 'Open & Ready to Listen'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {isSafetyHalted
                ? 'Crisis protocol active • Medical and helpline escalation enabled'
                : 'Interactive student safe space • Proactive crisis interception'}
            </p>
          </div>
        </div>

        {/* Action & Mode Switchers */}
        <div className="flex items-center gap-2 ml-auto">
          {!isSafetyHalted && (
            <>
              <button
                onClick={() => setActiveTabMode('live')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTabMode === 'live'
                    ? 'bg-purple-100 text-purple-900 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Live Voice Mode
              </button>
              <button
                onClick={() => setActiveTabMode('chat')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTabMode === 'chat'
                    ? 'bg-teal-100 text-teal-900 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Chat Notes
              </button>
              <button
                onClick={toggleMute}
                title={isMuted ? 'Unmute Cadberry Voice' : 'Mute Cadberry Voice'}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-rose-500" />
                ) : (
                  <Volume2 className="w-4 h-4 text-teal-600" />
                )}
              </button>
            </>
          )}

          {/* Test Crisis Trigger Button for verification */}
          <button
            onClick={triggerTestCrisis}
            title="Test Safety Intercept Mechanism"
            className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 transition"
          >
            Simulate Crisis Trigger
          </button>
        </div>
      </div>

      {/* EMERGENCY SAFETY INTERCEPT SCREEN (Replaces AI interaction in severe cases) */}
      {isSafetyHalted ? (
        <div className="flex-1 bg-gradient-to-b from-rose-50 via-white to-rose-50/40 rounded-3xl p-6 sm:p-8 border-2 border-rose-300 shadow-xl flex flex-col justify-between overflow-y-auto animate-fade-in">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-rose-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-rose-500/30 animate-bounce">
              <ShieldAlert className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-bold tracking-widest text-rose-700 uppercase bg-rose-100 px-3 py-1 rounded-full border border-rose-300">
                Ethical Safety Intercept Triggered
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900 mt-2">
                Cadberry Has Paused This Conversation
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                You are experiencing deep distress, and we refuse to let an AI chatbot keep talking when you need real, human medical attention. <strong className="text-rose-900 font-bold">Your life is profoundly valuable.</strong> An AI cannot replace a medical doctor or crisis counselor.
              </p>
            </div>

            {/* Direct 1-Click Helpline & Doctor Connections */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
              {/* Tele-MANAS */}
              <div className="p-4 rounded-2xl bg-white border-2 border-teal-600 shadow-md flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-teal-900">Tele-MANAS</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                      Govt. Free 24/7
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Connect instantly to registered mental health doctors, psychiatrists, and clinical psychologists in 20+ languages.
                  </p>
                </div>
                <a
                  href="tel:14416"
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-center font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition"
                >
                  <PhoneCall className="w-4 h-4 animate-bounce" />
                  <span>Call 14416 (Toll-Free)</span>
                </a>
              </div>

              {/* National Emergency 112 */}
              <div className="p-4 rounded-2xl bg-white border-2 border-rose-500 shadow-md flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-rose-900">Emergency Medical (112)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      Ambulance
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Direct national emergency dispatch for immediate medical or hospital assistance.
                  </p>
                </div>
                <a
                  href="tel:112"
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-center font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition"
                >
                  <Ambulance className="w-4 h-4" />
                  <span>Call 112 Immediately</span>
                </a>
              </div>

              {/* KIRAN Helpline */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-800">KIRAN Helpline</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      Psychological First Aid
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    National psychological rehabilitation helpline by Ministry of Social Justice.
                  </p>
                </div>
                <a
                  href="tel:18005990019"
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-center font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call 1800-599-0019</span>
                </a>
              </div>

              {/* Custom Campus Counselor / Trusted Person Contact */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between gap-3">
                <div>
                  <span className="font-bold text-sm text-slate-800">Campus Counselor / Friend</span>
                  <p className="text-xs text-slate-500 mt-1">
                    Dial a campus doctor, dorm warden, or loved one right now:
                  </p>
                  <input
                    type="tel"
                    placeholder="Enter phone number..."
                    value={customEmergencyContact}
                    onChange={(e) => setCustomEmergencyContact(e.target.value)}
                    className="w-full mt-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                {customEmergencyContact ? (
                  <a
                    href={`tel:${customEmergencyContact}`}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-center font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <PhoneForwarded className="w-3.5 h-3.5" />
                    <span>Call {customEmergencyContact}</span>
                  </a>
                ) : (
                  <div className="text-[11px] text-slate-400 text-center py-1">
                    Enter a number above to dial directly
                  </div>
                )}
              </div>
            </div>

            {/* Reassuring Grounding Anchor */}
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-teal-900 text-left flex items-center gap-3">
              <Heart className="w-6 h-6 text-teal-600 shrink-0 fill-current" />
              <div>
                <span className="font-bold block">Please stay safe:</span>
                Take three slow breaths. Stay in this room. Put your phone on call with 14416. People who care about you want to hear your voice.
              </div>
            </div>

            {/* Safety Unlock Mechanism */}
            <div className="pt-2">
              <button
                onClick={resetSafetyLock}
                className="text-xs text-slate-400 hover:text-slate-600 underline transition"
              >
                I am safe now and have reached out for support (Resume AI)
              </button>
            </div>
          </div>
        </div>
      ) : activeTabMode === 'live' ? (
        /* LIVE VOICE ORB MODE (Interactive, receptive space) */
        <div className="flex-1 bg-gradient-to-b from-white via-teal-50/20 to-purple-50/20 rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col items-center justify-between relative overflow-hidden">
          {/* Subtle Ambient Background Ring */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
            <div className="w-96 h-96 rounded-full border border-teal-200/60 animate-ping opacity-20" />
            <div className="w-[500px] h-[500px] rounded-full border border-purple-200/40" />
          </div>

          {/* Subtitle / Status */}
          <div className="text-center z-10 max-w-lg">
            <span className="text-xs font-bold tracking-widest text-teal-700 uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200/70">
              Interactive Student Safe Space
            </span>
            <h3 className="text-xl sm:text-2xl font-display font-bold text-slate-800 mt-2">
              {isSpeaking
                ? 'Cadberry is speaking to you...'
                : isListening
                ? 'I am listening... speak naturally'
                : isThinking
                ? 'Reflecting on your words...'
                : 'Feeling overwhelmed or different? Tap to talk.'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Natural voice modulation • Active safety triage in {language.toUpperCase()}
            </p>
          </div>

          {/* Central Live Voice Orb */}
          <div className="my-auto relative flex items-center justify-center py-6 z-10">
            <div
              className={`absolute rounded-full transition-all duration-700 ${
                isSpeaking
                  ? 'w-64 h-64 sm:w-80 sm:h-80 bg-purple-400/20 blur-2xl animate-pulse'
                  : isListening
                  ? 'w-64 h-64 sm:w-80 sm:h-80 bg-teal-400/25 blur-2xl animate-pulse'
                  : 'w-48 h-48 bg-slate-300/20 blur-xl'
              }`}
            />

            <button
              onClick={toggleMicListening}
              className={`relative z-10 w-44 h-44 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center text-white shadow-2xl transition-all duration-500 cursor-pointer ${
                isSpeaking
                  ? 'live-orb live-orb-speaking scale-105'
                  : isListening
                  ? 'live-orb live-orb-listening scale-105'
                  : 'bg-gradient-to-tr from-teal-600 via-teal-700 to-purple-700 hover:scale-102 hover:shadow-teal-500/30'
              }`}
            >
              {isSpeaking ? (
                <div className="flex flex-col items-center gap-2">
                  <Volume2 className="w-12 h-12 text-white animate-bounce" />
                  <span className="text-xs font-semibold tracking-wide uppercase opacity-90">
                    Cadberry Speaking
                  </span>
                </div>
              ) : isListening ? (
                <div className="flex flex-col items-center gap-2">
                  <Mic className="w-12 h-12 text-white animate-pulse" />
                  <span className="text-xs font-semibold tracking-wide uppercase opacity-90">
                    Listening...
                  </span>
                </div>
              ) : isThinking ? (
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="w-12 h-12 text-white animate-spin" />
                  <span className="text-xs font-semibold tracking-wide uppercase opacity-90">
                    Reflecting...
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Mic className="w-12 h-12 text-white" />
                  <span className="text-xs font-semibold tracking-wide uppercase">
                    Tap to Open Up
                  </span>
                </div>
              )}
            </button>
          </div>

          {/* Subtitle / Transcript Banner */}
          <div className="w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200/90 shadow-xs z-10 text-center min-h-[5rem] flex items-center justify-center">
            {interimTranscript ? (
              <p className="text-sm sm:text-base font-medium text-slate-800 italic animate-pulse">
                "{interimTranscript}"
              </p>
            ) : isSpeaking ? (
              <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
                "{messages[messages.length - 1]?.text}"
              </p>
            ) : messages.length > 0 ? (
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-teal-800">Cadberry: </span>
                {messages[messages.length - 1]?.text}
              </p>
            ) : (
              <p className="text-sm text-slate-400">
                Press the mic and speak whatever you feel inside.
              </p>
            )}
          </div>

          {/* Quick Emotional Prompts for Opening Up */}
          <div className="w-full max-w-2xl mt-4 z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Common Student Moments:
              </span>
              <span className="text-[11px] text-teal-700 font-medium">Click to Share</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {[
                { title: 'I feel numb & different', text: "I've been feeling weird and numb lately, not like myself at all." },
                { title: 'Deadlines are choking me', text: "Everything is due this week and my brain has completely frozen up." },
                { title: 'Cannot sleep past 3 AM', text: "I lie awake at 3 AM overthinking everything and feel exhausted." },
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.text)}
                  className="text-left p-2.5 rounded-xl bg-white hover:bg-teal-50/60 border border-slate-200/80 hover:border-teal-300 transition text-xs shadow-2xs group"
                >
                  <div className="font-semibold text-slate-800 group-hover:text-teal-900">
                    {p.title}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                    "{p.text}"
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Chat Notes Mode */
        <div className="flex-1 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-2xl ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-slate-700'
                      : 'bg-gradient-to-tr from-teal-600 to-purple-600'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>

                <div
                  className={`rounded-2xl p-4 text-sm leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-slate-800 text-white rounded-tr-xs'
                      : 'bg-teal-50/70 border border-teal-200/70 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className="text-[11px] font-semibold opacity-70">
                      {msg.sender === 'user' ? 'You' : 'Cadberry'}
                    </span>
                    <span className="text-[10px] opacity-60">{msg.timestamp}</span>
                  </div>

                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {msg.sender === 'cadberry' && (
                    <div className="mt-3 pt-2 border-t border-teal-200/50 flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={() => replayMessageVoice(msg.text, msg.signals?.primaryEmotion)}
                        className="flex items-center gap-1 text-xs font-semibold text-teal-800 hover:text-teal-950 transition"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>Listen to Cadberry</span>
                      </button>

                      {msg.signals && (
                        <span className="text-[11px] text-teal-700 font-medium">
                          Signal: {msg.signals.primaryEmotion} ({msg.signals.stressScore}/10)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar (locked when safety intercepted) */}
      {!isSafetyHalted && (
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 shadow-xs flex items-center gap-2">
          <button
            onClick={toggleMicListening}
            title={isListening ? 'Stop Recording' : 'Speak to Cadberry'}
            className={`p-3 rounded-xl transition flex items-center justify-center ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-400/30'
                : 'bg-teal-700 hover:bg-teal-800 text-white shadow-md shadow-teal-700/20'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage(inputText);
            }}
            placeholder={
              language === 'hinglish'
                ? 'Jab bhi alag ya heavy lage, Cadberry se baat karo...'
                : language === 'hi'
                ? 'जब भी मन में भारीपन हो, यहाँ लिखें या बोलें...'
                : 'Share what you are experiencing whenever you feel different...'
            }
            className="flex-1 bg-slate-50 border border-slate-200/90 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
          />

          <button
            onClick={() => handleSendMessage(inputText)}
            disabled={!inputText.trim() || isThinking}
            className="p-3 bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white rounded-xl transition shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
