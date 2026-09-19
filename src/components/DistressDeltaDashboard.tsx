import React from 'react';
import {
  TrendingDown,
  TrendingUp,
  Activity,
  Moon,
  ShieldCheck,
  PlusCircle,
  Menu
} from 'lucide-react';
import { DistressMetrics, StudentCheckIn } from '../types';

interface DistressDeltaDashboardProps {
  checkIns: StudentCheckIn[];
  metrics: DistressMetrics;
  onOpenCheckInModal: () => void;
  onOpenBreathingModal: () => void;
  onOpenMobileSidebar?: () => void;
}

export const DistressDeltaDashboard: React.FC<DistressDeltaDashboardProps> = ({
  checkIns,
  metrics,
  onOpenCheckInModal,
  onOpenMobileSidebar,
}) => {
  const isImproving = metrics.distressDeltaPercent <= 0;

  return (
    <div className="flex-1 flex flex-col h-screen max-w-5xl mx-auto px-4 sm:px-8 py-6 overflow-y-auto space-y-6">
      {/* Top Header */}
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
            YOUR SPACE · MY PATTERNS
          </span>
        </div>

        <button
          onClick={onOpenCheckInModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2F5957] hover:bg-[#234442] text-white text-xs font-medium transition shadow-2xs"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Check-in</span>
        </button>
      </div>

      {/* Page Title */}
      <div>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#2D2A26] font-normal tracking-tight">
          My Wellbeing Patterns
        </h2>
        <p className="font-sans text-sm text-[#78726A] font-light mt-1.5">
          Longitudinal baseline and Distress Delta over time
        </p>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Distress Delta */}
        <div className="bg-white rounded-2xl p-5 border border-[#EAE4DC] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#78726A] uppercase tracking-wider">
              Distress Delta (7-Day)
            </span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isImproving ? 'bg-[#F2F8F8] text-[#2F5957]' : 'bg-[#FFF7F5] text-[#BA5344]'
              }`}
            >
              {isImproving ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            </div>
          </div>

          <div className="my-3">
            <div
              className={`text-3xl font-serif font-medium ${
                isImproving ? 'text-[#2F5957]' : 'text-[#BA5344]'
              }`}
            >
              {metrics.distressDeltaPercent > 0
                ? `+${metrics.distressDeltaPercent}%`
                : `${metrics.distressDeltaPercent}%`}
            </div>
            <p className="text-xs text-[#78726A] mt-1 font-light">
              {isImproving
                ? 'Stress levels lower compared to your initial baseline.'
                : 'Slight increase in strain; ensure gentle rest.'}
            </p>
          </div>

          <div className="pt-2.5 border-t border-[#EAE4DC]/60 flex items-center justify-between text-[11px]">
            <span className="text-[#A69F96]">Trend:</span>
            <span
              className={`font-medium ${
                metrics.baselineComparison === 'improving'
                  ? 'text-[#2F5957]'
                  : metrics.baselineComparison === 'needs_care'
                  ? 'text-[#BA5344]'
                  : 'text-[#78726A]'
              }`}
            >
              {metrics.baselineComparison === 'improving'
                ? 'Recovery trend'
                : metrics.baselineComparison === 'needs_care'
                ? 'High strain'
                : 'Steady baseline'}
            </span>
          </div>
        </div>

        {/* Current Stress Index */}
        <div className="bg-white rounded-2xl p-5 border border-[#EAE4DC] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#78726A] uppercase tracking-wider">
              Current Stress Index
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#F3ECF8] text-[#644D73] flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <div className="text-3xl font-serif font-medium text-[#2D2A26]">
              {metrics.current7dAvgStress}{' '}
              <span className="text-lg font-normal text-[#A69F96]">/ 10</span>
            </div>
            <p className="text-xs text-[#78726A] mt-1 font-light">
              Initial baseline was {metrics.previous7dAvgStress}/10.
            </p>
          </div>

          <div className="pt-2.5 border-t border-[#EAE4DC]/60 flex items-center justify-between text-[11px]">
            <span className="text-[#A69F96]">Safety Net:</span>
            <span className="font-medium text-[#2F5957] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Normal bounds</span>
            </span>
          </div>
        </div>

        {/* Check-in Streak */}
        <div className="bg-white rounded-2xl p-5 border border-[#EAE4DC] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#78726A] uppercase tracking-wider">
              Check-in Habit
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#F4EFEA] text-[#78726A] flex items-center justify-center">
              <Moon className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <div className="text-3xl font-serif font-medium text-[#2D2A26]">
              {metrics.currentStreakDays}{' '}
              <span className="text-lg font-normal text-[#A69F96]">Days</span>
            </div>
            <p className="text-xs text-[#78726A] mt-1 font-light">
              Consistent reflections logged with Cadberry.
            </p>
          </div>

          <div className="pt-2.5 border-t border-[#EAE4DC]/60 flex items-center justify-between text-[11px]">
            <span className="text-[#A69F96]">Total Check-ins:</span>
            <span className="font-medium text-[#2D2A26]">{metrics.checkInCount} sessions</span>
          </div>
        </div>
      </div>

      {/* Trajectory Bar Chart */}
      <div className="bg-white rounded-2xl p-6 border border-[#EAE4DC] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif font-medium text-lg text-[#2D2A26]">
              Stress vs. Sleep Trajectory
            </h3>
            <p className="text-xs text-[#78726A] font-light mt-0.5">
              Comparing daily stress ratings with restful sleep hours
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-xs bg-[#3D706E]" />
              <span className="text-[#78726A]">Stress (1-10)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-xs bg-[#C1A2D6]" />
              <span className="text-[#78726A]">Sleep (Hrs)</span>
            </div>
          </div>
        </div>

        {/* Chart Bars */}
        <div className="h-52 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 border-b border-[#EAE4DC]">
          {checkIns.map((item, idx) => {
            const stressHeight = (item.stressScore / 10) * 100;
            const sleepHeight = item.sleepHours == null ? 0 : (item.sleepHours / 10) * 100;

            return (
              <div key={item.id || idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-1.5 hidden group-hover:flex flex-col bg-[#2D2A26] text-white text-[11px] rounded-lg p-2 shadow-lg z-20 w-40 pointer-events-none">
                  <div className="font-medium">{item.dayLabel}</div>
                  <div className="text-[#99F6E4]">Stress: {item.stressScore} / 10</div>
                  <div className="text-[#EADDF2]">Sleep: {item.sleepHours ?? '—'} hrs</div>
                  {item.note && <div className="text-[#C8BBAA] mt-1 text-[10px] truncate">"{item.note}"</div>}
                </div>

                {/* Bars */}
                <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full">
                  <div
                    style={{ height: `${stressHeight}%` }}
                    className="w-2.5 sm:w-4 bg-[#3D706E] rounded-t-xs transition-all duration-300"
                  />
                  <div
                    style={{ height: `${sleepHeight}%` }}
                    className={`w-2.5 sm:w-4 rounded-t-xs transition-all duration-300 ${item.sleepHours == null ? 'bg-[#EAE4DC]' : 'bg-[#C1A2D6]'}`}
                  />
                </div>

                <span className="text-[10px] text-[#A69F96] mt-1 font-medium">
                  {item.dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* History Log */}
      <div className="bg-white rounded-2xl p-6 border border-[#EAE4DC] shadow-2xs space-y-3">
        <h3 className="font-serif font-medium text-lg text-[#2D2A26]">
          Check-in History
        </h3>

        <div className="divide-y divide-[#EAE4DC]/60">
          {checkIns.slice().reverse().map((record) => (
            <div key={record.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-[#2D2A26]">{record.dayLabel}</span>
                  <span className="text-[#A69F96]">•</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#F3ECF8] text-[#644D73] font-medium text-[10px]">
                    {record.emotion}
                  </span>
                  <span className="text-[10px] text-[#A69F96] uppercase">[{record.language}]</span>
                </div>
                {record.note && (
                  <p className="text-xs text-[#78726A] font-light italic">
                    "{record.note}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-[#A69F96] block">Stress</span>
                  <span className="font-medium text-[#2D2A26]">{record.stressScore}/10</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#A69F96] block">Sleep</span>
                  <span className="font-medium text-[#2D2A26]">{record.sleepHours == null ? '—' : `${record.sleepHours}h`}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#A69F96] block">Delta</span>
                  <span
                    className={`font-semibold ${
                      (record.distressDelta || 0) <= 0 ? 'text-[#2F5957]' : 'text-[#BA5344]'
                    }`}
                  >
                    {record.distressDelta && record.distressDelta > 0
                      ? `+${record.distressDelta}%`
                      : `${record.distressDelta || 0}%`}
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
