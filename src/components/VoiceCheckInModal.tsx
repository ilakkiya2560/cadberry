import React, { useState, useEffect } from 'react';
import { Mic, CheckCircle2, RefreshCw, Square, X } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-[#EAE4DC] flex flex-col gap-5 relative">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-medium text-2xl text-[#2D2A26]">
              Voice Check-in
            </h3>
            <p className="text-xs text-[#78726A] font-light mt-0.5">
              Reflect in your own words for 30–90 seconds
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#A69F96] hover:text-[#2D2A26] p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!completedRecord ? (
          <>
            {/* Guide Text */}
            <div className="bg-[#F3ECF8] border border-[#EADDF2] rounded-2xl p-4 text-xs text-[#644D73] leading-relaxed">
              <p className="font-medium text-[#4B3857] mb-1">
                A few thoughts you might explore:
              </p>
              <ul className="list-disc pl-4 space-y-0.5 text-xs text-[#644D73]">
                <li>How rested did your body feel when waking up?</li>
                <li>Any deadlines or conversations lingering in your thoughts?</li>
                <li>What do you need right now to feel a little more at ease?</li>
              </ul>
            </div>

            {/* Recording Button */}
            <div className="flex flex-col items-center justify-center py-6 bg-white border border-[#EAE4DC] rounded-2xl gap-3">
              <button
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                disabled={isProcessing}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all shadow-xs ${
                  isRecording
                    ? 'bg-[#BA5344] scale-105'
                    : 'bg-[#2F5957] hover:bg-[#234442]'
                }`}
              >
                {isRecording ? (
                  <Square className="w-6 h-6 fill-current" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </button>

              <div className="text-center">
                <div className="text-xs font-medium text-[#2D2A26]">
                  {isRecording
                    ? `Recording: 0:${seconds < 10 ? '0' : ''}${seconds}`
                    : 'Click to start voice reflection'}
                </div>
                <p className="text-[11px] text-[#A69F96] mt-0.5 font-light">
                  {isRecording ? 'Click to finish' : 'Take your time'}
                </p>
              </div>
            </div>

            {/* Transcript Preview */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#78726A]">
                Transcript:
              </label>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={3}
                placeholder="Spoken words will appear here, or you may write directly..."
                className="w-full bg-white border border-[#EAE4DC] rounded-xl p-3 text-xs sm:text-sm text-[#2D2A26] placeholder-[#A69F96] focus:outline-hidden focus:border-[#3D706E]"
              />
            </div>

            {/* Sleep slider */}
            <div className="bg-white p-3 rounded-xl border border-[#EAE4DC] flex items-center justify-between gap-4">
              <span className="text-xs text-[#78726A]">Hours slept:</span>
              <span className="text-xs font-semibold text-[#2D2A26]">{sleepHoursInput} hrs</span>
              <input
                type="range"
                min="2"
                max="12"
                step="0.5"
                value={sleepHoursInput}
                onChange={(e) => setSleepHoursInput(parseFloat(e.target.value))}
                className="accent-[#2F5957] cursor-pointer"
              />
            </div>

            {/* Sample presets */}
            <div>
              <span className="text-[11px] text-[#A69F96] font-medium block mb-1">
                Sample reflection:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {STUDENT_SAMPLE_PRESETS.slice(0, 2).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p)}
                    className="px-2.5 py-1 bg-white hover:bg-[#F4EFEA] text-[#78726A] border border-[#EAE4DC] rounded-lg text-xs transition"
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit if typed */}
            {transcript.trim() && !isRecording && (
              <button
                onClick={() => processAndSave(transcript.trim())}
                disabled={isProcessing}
                className="w-full py-2.5 bg-[#2F5957] hover:bg-[#234442] text-white rounded-xl font-medium text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-2xs"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Reflecting...</span>
                  </>
                ) : (
                  <span>Save Check-in</span>
                )}
              </button>
            )}
          </>
        ) : (
          /* Check-in Logged */
          <div className="py-4 flex flex-col items-center text-center gap-3 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-[#F2F8F8] text-[#2F5957] flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h4 className="font-serif font-medium text-xl text-[#2D2A26]">
              Check-in Logged
            </h4>

            <div className="w-full bg-white border border-[#EAE4DC] rounded-2xl p-4 text-left grid grid-cols-2 gap-3 my-1">
              <div>
                <span className="text-[10px] text-[#A69F96] uppercase block">Stress</span>
                <span className="text-base font-semibold text-[#2D2A26]">
                  {completedRecord.stressScore}/10
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#A69F96] uppercase block">Emotion</span>
                <span className="text-base font-semibold text-[#644D73]">
                  {completedRecord.emotion}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#A69F96] uppercase block">Sleep</span>
                <span className="text-xs text-[#78726A]">{completedRecord.sleepHours} hrs</span>
              </div>
              <div>
                <span className="text-[10px] text-[#A69F96] uppercase block">Distress Delta</span>
                <span
                  className={`text-xs font-semibold ${
                    (completedRecord.distressDelta || 0) <= 0 ? 'text-[#2F5957]' : 'text-[#BA5344]'
                  }`}
                >
                  {completedRecord.distressDelta && completedRecord.distressDelta > 0
                    ? `+${completedRecord.distressDelta}%`
                    : `${completedRecord.distressDelta || 0}%`}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-[#2F5957] hover:bg-[#234442] text-white rounded-xl font-medium text-xs sm:text-sm transition shadow-2xs"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
