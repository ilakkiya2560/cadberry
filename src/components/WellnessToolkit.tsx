import React, { useState, useEffect } from 'react';
import { Wind, Eye, Compass, Moon, Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';

export const WellnessToolkit: React.FC = () => {
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
    { count: '5', sense: 'Things you can SEE', desc: 'Look around your desk or room: a notebook, a pen, light through the window...' },
    { count: '4', sense: 'Things you can TOUCH', desc: 'Feel the texture of your sweater, your desk surface, the floor under your feet...' },
    { count: '3', sense: 'Things you can HEAR', desc: 'Listen closely: the hum of a fan, distant footsteps outside, your own breathing...' },
    { count: '2', sense: 'Things you can SMELL', desc: 'Notice any scent in the air: coffee, pencil wood, clean air...' },
    { count: '1', sense: 'Thing you can TASTE', desc: 'Notice the lingering taste of water or mint, or take a refreshing sip now.' }
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
            Self-Regulation & Healthy Routines
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-800 mt-2">
            Calm & Reset Toolkit
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Proactive micro-interventions for acute nervous system regulation.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/70">
          <button
            onClick={() => setActiveExercise('breathing')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeExercise === 'breathing' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            Box Breathing
          </button>
          <button
            onClick={() => setActiveExercise('grounding')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeExercise === 'grounding' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            5-4-3-2-1 Grounding
          </button>
          <button
            onClick={() => setActiveExercise('routine')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeExercise === 'routine' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            Study Reset
          </button>
        </div>
      </div>

      {/* Main Exercise Display */}
      {activeExercise === 'breathing' && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center space-y-6">
          <div className="max-w-md">
            <h3 className="font-display font-bold text-xl text-slate-800">
              4-4-4-4 Box Breathing
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Physiologically resets elevated heart rates and releases adrenaline during high-stress study sessions.
            </p>
          </div>

          {/* Interactive Breathing Visualizer */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-6">
            {/* Animated Outer Pulse */}
            <div
              className={`absolute rounded-full transition-all duration-1000 ${
                isBreathingActive
                  ? breathingPhase === 'Inhale'
                    ? 'w-72 h-72 sm:w-80 sm:h-80 bg-teal-400/20 scale-110'
                    : breathingPhase === 'Exhale'
                    ? 'w-52 h-52 sm:w-60 sm:h-60 bg-purple-400/20 scale-95'
                    : 'w-64 h-64 sm:w-72 sm:h-72 bg-sky-400/20'
                  : 'w-56 h-56 bg-slate-100'
              }`}
            />

            {/* Main Center Circle */}
            <div
              className={`relative z-10 w-48 h-48 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-all duration-1000 ${
                isBreathingActive
                  ? breathingPhase === 'Inhale'
                    ? 'bg-gradient-to-tr from-teal-600 to-emerald-500 scale-105'
                    : breathingPhase === 'Hold'
                    ? 'bg-gradient-to-tr from-sky-600 to-teal-500 scale-105'
                    : breathingPhase === 'Exhale'
                    ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 scale-95'
                    : 'bg-gradient-to-tr from-indigo-500 to-teal-600 scale-95'
                  : 'bg-teal-700'
              }`}
            >
              <Wind className="w-8 h-8 mb-1 opacity-90" />
              <div className="font-display font-bold text-2xl">
                {isBreathingActive ? breathingPhase : 'Ready'}
              </div>
              <div className="text-xs font-semibold opacity-80 mt-0.5">
                {isBreathingActive ? `${breathingTimer}s` : '4 seconds each'}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsBreathingActive(!isBreathingActive)}
              className="flex items-center gap-2 px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm rounded-2xl shadow-md transition"
            >
              {isBreathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isBreathingActive ? 'Pause Exercise' : 'Begin Breathing Cycle'}</span>
            </button>
            <button
              onClick={() => {
                setIsBreathingActive(false);
                setBreathingPhase('Inhale');
                setBreathingTimer(4);
              }}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {activeExercise === 'grounding' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
          <div className="max-w-xl">
            <h3 className="font-display font-bold text-xl text-slate-800">
              5-4-3-2-1 Sensory Grounding Technique
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Brings your attention out of racing thoughts and returns your sensory awareness into the present physical room.
            </p>
          </div>

          <div className="bg-gradient-to-tr from-sky-50 to-teal-50/50 p-6 sm:p-8 rounded-3xl border border-sky-100 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-sky-600 text-white flex items-center justify-center font-display font-black text-3xl shadow-md">
              {GROUNDING_STEPS[groundingStep].count}
            </div>

            <div>
              <h4 className="font-display font-extrabold text-xl text-slate-800">
                {GROUNDING_STEPS[groundingStep].sense}
              </h4>
              <p className="text-sm text-slate-600 mt-2 max-w-md">
                {GROUNDING_STEPS[groundingStep].desc}
              </p>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => setGroundingStep((prev) => Math.max(0, prev - 1))}
                disabled={groundingStep === 0}
                className="px-4 py-2 bg-white disabled:opacity-40 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Previous
              </button>

              <button
                onClick={() =>
                  setGroundingStep((prev) =>
                    prev < GROUNDING_STEPS.length - 1 ? prev + 1 : 0
                  )
                }
                className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-md transition"
              >
                {groundingStep < GROUNDING_STEPS.length - 1 ? 'Next Sense' : 'Complete & Grounded'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeExercise === 'routine' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="font-display font-bold text-xl text-slate-800">
              Student Routine & Sleep Reset Checklist
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Proactive habits to protect your cognitive energy during busy semesters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {[
              {
                title: 'The 20-Minute Study Break Rule',
                desc: 'Every 50 minutes of deep study, step away from screens for 10 minutes. Look at trees or daylight to un-fatigue your optic nerve.',
                icon: '🌿'
              },
              {
                title: 'Bedtime Screen Curfew (30 Mins)',
                desc: 'Blue light from laptops suppresses melatonin. Switch your devices to Night Shift or reading mode by 11:30 PM.',
                icon: '🌙'
              },
              {
                title: 'Brain Dump Micro-Journaling',
                desc: 'Before sleeping, write down every pending assignment or deadline on paper. Once externalized, your mind stops looping them.',
                icon: '📝'
              },
              {
                title: 'Hydration & Campus Walk',
                desc: 'Drink at least 2 liters of water daily. A brisk 15-minute campus walk lowers cortisol levels significantly.',
                icon: '💧'
              }
            ].map((habit, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex gap-3">
                <span className="text-2xl shrink-0">{habit.icon}</span>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">{habit.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{habit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
