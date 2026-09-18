import React, { useState, useEffect } from 'react';
import { Wind, Eye, Moon, Play, Pause, RotateCcw, Menu } from 'lucide-react';

interface WellnessToolkitProps {
  onOpenMobileSidebar?: () => void;
}

export const WellnessToolkit: React.FC<WellnessToolkitProps> = ({ onOpenMobileSidebar }) => {
  const [activeExercise, setActiveExercise] = useState<'breathing' | 'grounding' | 'routine'>('breathing');

  // Box Breathing States
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathingTimer, setBreathingTimer] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setBreathingTimer((prev) => {
          if (prev <= 1) {
            setBreathingPhase((currentPhase) => {
              if (currentPhase === 'Inhale') return 'Hold';
              if (currentPhase === 'Hold') return 'Exhale';
              if (currentPhase === 'Exhale') return 'Rest';
              return 'Inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathingActive]);

  // Grounding Step
  const [groundingStep, setGroundingStep] = useState(0);
  const GROUNDING_STEPS = [
    { count: '5', sense: 'Things you can SEE', desc: 'Look around quietly: the grain of your desk, light through a window, a book...' },
    { count: '4', sense: 'Things you can TOUCH', desc: 'Notice physical sensations: the weight of your feet on the floor, your sleeves, the air on your skin...' },
    { count: '3', sense: 'Things you can HEAR', desc: 'Listen gently: distant hums, quiet breeze outside, your own breathing...' },
    { count: '2', sense: 'Things you can SMELL', desc: 'Notice any subtle scents in the room: fresh paper, clean air, tea...' },
    { count: '1', sense: 'Thing you can TASTE', desc: 'Notice the lingering taste of cool water or take a refreshing sip now.' }
  ];

  return (
    <div className="flex-1 flex flex-col h-screen max-w-5xl mx-auto px-4 sm:px-8 py-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#EAE4DC]/60 shrink-0">
        <div className="flex items-center gap-3">
          {onOpenMobileSidebar && (
            <button
              onClick={onOpenMobileSidebar}
              className="p-1.5 rounded-lg text-[#78726A] hover:bg-[#F4EFEA] md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <span className="text-xs font-semibold tracking-[0.18em] text-[#78726A] uppercase">
            YOUR SPACE · CALM TOOLKIT
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#F4EFEA] p-1 rounded-xl border border-[#EAE4DC]">
          <button
            onClick={() => setActiveExercise('breathing')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              activeExercise === 'breathing' ? 'bg-white text-[#2D2A26] font-semibold shadow-2xs' : 'text-[#78726A]'
            }`}
          >
            Box breathing
          </button>
          <button
            onClick={() => setActiveExercise('grounding')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              activeExercise === 'grounding' ? 'bg-white text-[#2D2A26] font-semibold shadow-2xs' : 'text-[#78726A]'
            }`}
          >
            5-4-3-2-1 Grounding
          </button>
          <button
            onClick={() => setActiveExercise('routine')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              activeExercise === 'routine' ? 'bg-white text-[#2D2A26] font-semibold shadow-2xs' : 'text-[#78726A]'
            }`}
          >
            Sleep habits
          </button>
        </div>
      </div>

      {/* Page Title */}
      <div>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#2D2A26] font-normal tracking-tight">
          Gentle Reset & Grounding
        </h2>
        <p className="font-sans text-sm text-[#78726A] font-light mt-1.5">
          Quiet micro-practices to ease nervous system tension
        </p>
      </div>

      {/* Main Exercise Content */}
      {activeExercise === 'breathing' && (
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-[#EAE4DC] shadow-2xs flex flex-col items-center justify-center text-center space-y-6">
          <div className="max-w-md">
            <h3 className="font-serif font-medium text-xl text-[#2D2A26]">
              4-4-4-4 Box Breathing
            </h3>
            <p className="text-xs text-[#78726A] font-light mt-1">
              Slow, balanced breathing to signal safety to your body during study stress.
            </p>
          </div>

          {/* Calming Breathing Circle */}
          <div className="relative w-56 h-56 flex items-center justify-center my-4">
            <div
              className={`absolute rounded-full transition-all duration-1000 ${
                isBreathingActive
                  ? breathingPhase === 'Inhale'
                    ? 'w-56 h-56 bg-[#F3ECF8] scale-110'
                    : breathingPhase === 'Exhale'
                    ? 'w-40 h-40 bg-[#F2F8F8] scale-90'
                    : 'w-48 h-48 bg-[#F3ECF8]'
                  : 'w-44 h-44 bg-[#F4EFEA]'
              }`}
            />

            <div
              className={`relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center text-white transition-all duration-1000 ${
                isBreathingActive
                  ? breathingPhase === 'Inhale'
                    ? 'bg-[#3D706E] scale-105'
                    : breathingPhase === 'Hold'
                    ? 'bg-[#457B79] scale-105'
                    : breathingPhase === 'Exhale'
                    ? 'bg-[#644D73] scale-95'
                    : 'bg-[#7E6390] scale-95'
                  : 'bg-[#2F5957]'
              }`}
            >
              <Wind className="w-5 h-5 mb-1 opacity-80" />
              <div className="font-serif text-lg font-medium">
                {isBreathingActive ? breathingPhase : 'Ready'}
              </div>
              <div className="text-[11px] opacity-75 font-light">
                {isBreathingActive ? `${breathingTimer}s` : '4s pace'}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBreathingActive(!isBreathingActive)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2F5957] hover:bg-[#234442] text-white text-xs font-medium rounded-xl transition shadow-2xs"
            >
              {isBreathingActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isBreathingActive ? 'Pause' : 'Begin Breathing'}</span>
            </button>
            <button
              onClick={() => {
                setIsBreathingActive(false);
                setBreathingPhase('Inhale');
                setBreathingTimer(4);
              }}
              className="p-2.5 bg-[#F4EFEA] hover:bg-[#ECE4DC] text-[#78726A] rounded-xl transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {activeExercise === 'grounding' && (
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[#EAE4DC] shadow-2xs space-y-6">
          <div className="max-w-md">
            <h3 className="font-serif font-medium text-xl text-[#2D2A26]">
              5-4-3-2-1 Sensory Grounding
            </h3>
            <p className="text-xs text-[#78726A] font-light mt-1">
              Gently brings your attention back to your physical surroundings when thoughts start racing.
            </p>
          </div>

          <div className="bg-[#FAF7F2] p-6 sm:p-8 rounded-2xl border border-[#EAE4DC] flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#3D706E] text-white flex items-center justify-center font-serif text-xl font-medium">
              {GROUNDING_STEPS[groundingStep].count}
            </div>

            <h4 className="font-serif text-lg font-medium text-[#2D2A26]">
              {GROUNDING_STEPS[groundingStep].sense}
            </h4>
            <p className="text-xs sm:text-sm text-[#78726A] max-w-sm font-light leading-relaxed">
              {GROUNDING_STEPS[groundingStep].desc}
            </p>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => setGroundingStep((prev) => Math.max(0, prev - 1))}
                disabled={groundingStep === 0}
                className="px-3.5 py-1.5 bg-white disabled:opacity-30 border border-[#EAE4DC] text-[#78726A] rounded-xl text-xs font-medium"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setGroundingStep((prev) =>
                    prev < GROUNDING_STEPS.length - 1 ? prev + 1 : 0
                  )
                }
                className="px-4 py-1.5 bg-[#2F5957] hover:bg-[#234442] text-white rounded-xl text-xs font-medium transition"
              >
                {groundingStep < GROUNDING_STEPS.length - 1 ? 'Next' : 'Complete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeExercise === 'routine' && (
        <div className="bg-white rounded-2xl p-6 border border-[#EAE4DC] shadow-2xs space-y-4">
          <div>
            <h3 className="font-serif font-medium text-xl text-[#2D2A26]">
              Rest & Evening Pacing
            </h3>
            <p className="text-xs text-[#78726A] font-light mt-0.5">
              Practical, gentle boundaries to protect student energy
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[
              {
                title: 'The 10-Minute Screen Unplug',
                desc: 'Every hour of laptop study, look outside at the horizon or greenery to relax eye strain and mental fatigue.'
              },
              {
                title: 'Paper Brain Dump',
                desc: 'Write tomorrow’s loose ends on an index card before bed. Your mind stops looping them once they are on paper.'
              },
              {
                title: 'Warm Drink Wind-Down',
                desc: 'Swap late-night coffee with warm water or chamomile tea after 10 PM to allow cortisol to settle.'
              },
              {
                title: 'Fresh Air Campus Walk',
                desc: 'A gentle 15-minute walk outside without headphones resets your circadian rhythm.'
              }
            ].map((habit, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EAE4DC]/70">
                <h4 className="font-medium text-xs sm:text-sm text-[#2D2A26]">{habit.title}</h4>
                <p className="text-xs text-[#78726A] font-light mt-1 leading-relaxed">{habit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
