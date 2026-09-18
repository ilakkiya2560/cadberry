import React, { useState, useEffect } from 'react';
import { Mic, MicOff, CheckCircle2, RefreshCw, Volume2, Sparkles, Play, Square } from 'lucide-react';
import { Language, PrimaryEmotion, StudentCheckIn } from '../types';
import { voiceService } from '../services/voiceService';
import { askCadberry } from '../services/geminiService';
import { saveCheckIn } from '../services/storageService';
import { STUDENT_SAMPLE_PRESETS, StudentSamplePreset } from '../services/languageConfig';

interface VoiceCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onCheckInSaved: (checkIn: StudentCheckIn) => void;
  apiKey?: string;
}

export const VoiceCheckInModal: React.FC<VoiceCheckInModalProps> = ({
  isOpen,
  onClose,
  language,
  onCheckInSaved,
  apiKey,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sleepHoursInput, setSleepHoursInput] = useState(6.5);
  const [completedRecord, setCompletedRecord] = useState<StudentCheckIn | null>(null);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  if (!isOpen) return null;

  const startVoiceRecording = () => {
    setCompletedRecord(null);
    setTranscript('');
    const started = voiceService.startListening(
      language,
      (text, isFinal) => {
        setTranscript(text);
      },
      (err) => {
        console.warn('Check-in voice error:', err);
        setIsRecording(false);
      },
      () => {
        setIsRecording(false);
      }
    );
    if (started) setIsRecording(true);
  };

  const stopVoiceRecording = async () => {
    voiceService.stopListening();
    setIsRecording(false);

    if (transcript.trim().length > 5) {
      await processAndSave(transcript.trim());
    }
  };

  const applyPreset = async (preset: StudentSamplePreset) => {
    setTranscript(preset.transcript);
    await processAndSave(preset.transcript);
  };

  const processAndSave = async (text: string) => {
    setIsProcessing(true);
    try {
      const result = await askCadberry(text, language, [], apiKey);
      const saved = saveCheckIn({
        stressScore: result.signals.stressScore,
        sleepHours: sleepHoursInput,
        emotion: result.signals.primaryEmotion,
        note: text,
        language: language,
      });

      setCompletedRecord(saved);
      onCheckInSaved(saved);
    } catch (e) {
      console.error('Failed to analyze voice note:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col gap-6 relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-slate-800">
                Daily 60s Voice Check-in
              </h3>
              <p className="text-xs text-slate-500">
                Speak freely in your preferred language • AI extracts wellness cues
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {!completedRecord ? (
          <>
            {/* Guide Text */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p className="font-semibold text-slate-800 mb-1">
                Share what’s on your mind today:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-500 text-xs">
                <li>How did you sleep last night?</li>
                <li>How are your classes, projects, or semester deadlines feeling?</li>
                <li>Any moments of pressure, loneliness, or relief today?</li>
              </ul>
            </div>

            {/* Central Recording Control & Waveform */}
            <div className="flex flex-col items-center justify-center py-6 bg-teal-50/40 border border-teal-100 rounded-3xl gap-4">
              <div className="relative">
                {isRecording && (
                  <div className="absolute inset-0 rounded-full bg-teal-400/30 animate-ping" />
                )}
                <button
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                  disabled={isProcessing}
                  className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-white transition-all shadow-lg ${
                    isRecording
                      ? 'bg-rose-500 shadow-rose-400/40 scale-105'
                      : 'bg-teal-700 hover:bg-teal-800 shadow-teal-700/30'
                  }`}
                >
                  {isRecording ? (
                    <Square className="w-8 h-8 fill-current" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </button>
              </div>

              <div className="text-center">
                <div className="text-sm font-bold text-slate-800">
                  {isRecording
                    ? `Recording: 0:${seconds < 10 ? '0' : ''}${seconds}`
                    : 'Tap to Record Voice Note'}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isRecording ? 'Click to stop & analyze' : 'Aim for 30–90 seconds'}
                </p>
              </div>

              {/* Simulated Audio Waveform when recording */}
              {isRecording && (
                <div className="flex items-center gap-1.5 h-8">
                  {[40, 75, 55, 90, 65, 80, 45, 95, 70, 50, 85, 60].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className="w-1 bg-teal-600 rounded-full animate-pulse"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Transcript Preview */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Live Speech-to-Text Transcript:
              </label>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={3}
                placeholder="Your voice notes will appear here automatically, or you can type directly..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Estimated Sleep input slider */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-700">Hours Slept Last Night:</span>
                <span className="text-xs text-teal-800 font-extrabold ml-2">{sleepHoursInput} hrs</span>
              </div>
              <input
                type="range"
                min="2"
                max="12"
                step="0.5"
                value={sleepHoursInput}
                onChange={(e) => setSleepHoursInput(parseFloat(e.target.value))}
                className="accent-teal-600 cursor-pointer"
              />
            </div>

            {/* Fast Presets for Quick Testing without Mic */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Quick Test Samples:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {STUDENT_SAMPLE_PRESETS.slice(0, 3).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 rounded-lg text-xs font-medium transition"
                  >
                    {p.title} ({p.lang})
                  </button>
                ))}
              </div>
            </div>

            {/* Manual submit button if typed */}
            {transcript.trim() && !isRecording && (
              <button
                onClick={() => processAndSave(transcript.trim())}
                disabled={isProcessing}
                className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-semibold text-sm transition shadow-md flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extracting Stress & Sleep Biomarkers...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze & Log Check-in</span>
                  </>
                )}
              </button>
            )}
          </>
        ) : (
          /* Check-in Logged Successfully Screen */
          <div className="py-6 flex flex-col items-center text-center gap-4 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h4 className="font-display font-bold text-xl text-slate-800">
                Check-in Logged with Cadberry!
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">
                Your voice signals have been analyzed and added to your personal Distress Delta baseline.
              </p>
            </div>

            <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left grid grid-cols-2 gap-4 my-2">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  Stress Detected
                </span>
                <div className="text-lg font-extrabold text-slate-800">
                  {completedRecord.stressScore} / 10
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  Primary Emotion
                </span>
                <div className="text-lg font-extrabold text-teal-800">
                  {completedRecord.emotion}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  Sleep Recorded
                </span>
                <div className="text-base font-bold text-slate-700">
                  {completedRecord.sleepHours} hrs
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  Distress Delta
                </span>
                <div
                  className={`text-base font-extrabold ${
                    (completedRecord.distressDelta || 0) <= 0
                      ? 'text-emerald-600'
                      : 'text-amber-600'
                  }`}
                >
                  {completedRecord.distressDelta && completedRecord.distressDelta > 0
                    ? `+${completedRecord.distressDelta}%`
                    : `${completedRecord.distressDelta || 0}%`}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-semibold text-sm transition shadow-md"
            >
              Done & View Wellness Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
