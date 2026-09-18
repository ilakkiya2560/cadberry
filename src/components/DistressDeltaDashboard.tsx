import React from 'react';
import {
  TrendingDown,
  TrendingUp,
  Activity,
  Moon,
  Calendar,
  Sparkles,
  Flame,
  ShieldCheck,
  PlusCircle,
  Clock
} from 'lucide-react';
import { DistressMetrics, StudentCheckIn } from '../types';

interface DistressDeltaDashboardProps {
  checkIns: StudentCheckIn[];
  metrics: DistressMetrics;
  onOpenCheckInModal: () => void;
  onOpenBreathingModal: () => void;
}

export const DistressDeltaDashboard: React.FC<DistressDeltaDashboardProps> = ({
  checkIns,
  metrics,
  onOpenCheckInModal,
  onOpenBreathingModal,
}) => {
  const isImproving = metrics.distressDeltaPercent <= 0;

  // Emotion count breakdown
  const emotionCounts: Record<string, number> = {};
  checkIns.forEach((c) => {
    emotionCounts[c.emotion] = (emotionCounts[c.emotion] || 0) + 1;
  });

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 animate-fade-in">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Personal Wellbeing Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-800 mt-2">
            My Distress Delta & Longitudinal Baseline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Measuring real progress week-over-week, not just daily app engagement.
          </p>
        </div>

        <button
          onClick={onOpenCheckInModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-semibold text-sm transition shadow-md shadow-teal-700/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Voice Check-in</span>
        </button>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Distress Delta Score */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Distress Delta (7-Day)
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isImproving
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-amber-50 text-amber-600'
              }`}
            >
              {isImproving ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
            </div>
          </div>

          <div className="my-3">
            <div
              className={`text-4xl font-display font-extrabold tracking-tight ${
                isImproving ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {metrics.distressDeltaPercent > 0
                ? `+${metrics.distressDeltaPercent}%`
                : `${metrics.distressDeltaPercent}%`}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isImproving
                ? 'Stress levels have decreased compared to your initial baseline.'
                : 'Slight increase in strain detected; take extra care with sleep.'}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Status:</span>
            <span
              className={`font-semibold ${
                metrics.baselineComparison === 'improving'
                  ? 'text-emerald-700'
                  : metrics.baselineComparison === 'needs_care'
                  ? 'text-amber-700'
                  : 'text-slate-700'
              }`}
            >
              {metrics.baselineComparison === 'improving'
                ? 'Healthy Recovery Trend'
                : metrics.baselineComparison === 'needs_care'
                ? 'High Strain Alert'
                : 'Steady Baseline'}
            </span>
          </div>
        </div>

        {/* Metric 2: Average Stress Level */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Current Stress Index
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="my-3">
            <div className="text-4xl font-display font-extrabold text-slate-800 tracking-tight">
              {metrics.current7dAvgStress}{' '}
              <span className="text-xl font-normal text-slate-400">/ 10</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Initial baseline was {metrics.previous7dAvgStress}/10.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Safety Net Status:</span>
            <span className="font-semibold text-emerald-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Normal Bounds</span>
            </span>
          </div>
        </div>

        {/* Metric 3: Student Consistency & Sleep */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Mindfulness Habit
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Flame className="w-5 h-5 text-amber-500" />
            </div>
          </div>

          <div className="my-3">
            <div className="text-4xl font-display font-extrabold text-slate-800 tracking-tight">
              {metrics.currentStreakDays}{' '}
              <span className="text-xl font-normal text-slate-400">Days</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active check-in streak logging voice reflections with Cadberry.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Check-ins:</span>
            <span className="font-semibold text-slate-800">{metrics.checkInCount} sessions</span>
          </div>
        </div>
      </div>

      {/* Longitudinal Graph: Stress vs Sleep Over Time */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-800">
              Longitudinal Stress vs. Sleep Trajectory
            </h3>
            <p className="text-xs text-slate-500">
              Correlating sleep restoration with lower stress biomarkers across your check-ins
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-teal-600" />
              <span className="text-slate-600">Stress Score (1-10)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-purple-400" />
              <span className="text-slate-600">Sleep (Hours)</span>
            </div>
          </div>
        </div>

        {/* Visual Bar & Trend Chart */}
        <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-8 pb-2 border-b border-slate-200">
          {checkIns.map((item, idx) => {
            const stressHeight = (item.stressScore / 10) * 100;
            const sleepHeight = (item.sleepHours / 10) * 100;

            return (
              <div key={item.id || idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                {/* Hover Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col bg-slate-900 text-white text-[11px] rounded-xl p-2.5 shadow-xl z-20 w-44 pointer-events-none">
                  <div className="font-bold">{item.dayLabel}</div>
                  <div className="text-teal-300">Stress: {item.stressScore} / 10</div>
                  <div className="text-purple-300">Sleep: {item.sleepHours} hrs</div>
                  <div className="text-slate-300 mt-1 text-[10px] line-clamp-2">"{item.note}"</div>
                </div>

                {/* Bars */}
                <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full">
                  <div
                    style={{ height: `${stressHeight}%` }}
                    className="w-3 sm:w-5 bg-gradient-to-t from-teal-700 to-teal-500 rounded-t-md transition-all duration-500 group-hover:brightness-110"
                  />
                  <div
                    style={{ height: `${sleepHeight}%` }}
                    className="w-3 sm:w-5 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-md transition-all duration-500 group-hover:brightness-110"
                  />
                </div>

                {/* Label */}
                <span className="text-[11px] font-semibold text-slate-500 mt-1">
                  {item.dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Check-ins History Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-display font-bold text-lg text-slate-800">
          Check-in Log & Voice Notes History
        </h3>

        <div className="divide-y divide-slate-100">
          {checkIns.slice().reverse().map((record) => (
            <div key={record.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">{record.dayLabel}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                    {record.emotion}
                  </span>
                  <span className="text-xs text-slate-400 uppercase font-bold text-[10px]">
                    [{record.language}]
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 italic">
                  "{record.note}"
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs shrink-0">
                <div>
                  <span className="text-slate-400 block text-[10px]">Stress:</span>
                  <span className="font-bold text-slate-800">{record.stressScore}/10</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Sleep:</span>
                  <span className="font-bold text-slate-800">{record.sleepHours}h</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Distress Δ:</span>
                  <span className={`font-extrabold ${(record.distressDelta || 0) <= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {record.distressDelta && record.distressDelta > 0 ? `+${record.distressDelta}%` : `${record.distressDelta || 0}%`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
