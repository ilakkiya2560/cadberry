import React from 'react';
import { Sparkles, PhoneCall, Key, HeartHandshake, Mic, LineChart, Users, Wind } from 'lucide-react';
import { Language, DistressMetrics } from '../types';
import { SUPPORTED_LANGUAGES } from '../services/languageConfig';

interface NavbarProps {
  currentTab: 'live' | 'checkin' | 'trends' | 'circles' | 'toolkit';
  onSelectTab: (tab: 'live' | 'checkin' | 'trends' | 'circles' | 'toolkit') => void;
  selectedLanguage: Language;
  onChangeLanguage: (lang: Language) => void;
  distressMetrics: DistressMetrics;
  onOpenCrisisModal: () => void;
  onOpenApiKeyModal: () => void;
  hasCustomApiKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  selectedLanguage,
  onChangeLanguage,
  distressMetrics,
  onOpenCrisisModal,
  onOpenApiKeyModal,
  hasCustomApiKey,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Name */}
          <div 
            onClick={() => onSelectTab('live')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-teal-600 via-emerald-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-teal-800 to-purple-800 bg-clip-text text-transparent">
                  Cadberry
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  Student Companion
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block -mt-0.5">
                Proactive student mental health & listening space
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => onSelectTab('live')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
                currentTab === 'live'
                  ? 'bg-white text-teal-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Cadberry Live</span>
            </button>

            <button
              onClick={() => onSelectTab('checkin')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
                currentTab === 'checkin'
                  ? 'bg-white text-teal-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Mic className="w-4 h-4 text-teal-600" />
              <span>Voice Check-in</span>
            </button>

            <button
              onClick={() => onSelectTab('trends')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
                currentTab === 'trends'
                  ? 'bg-white text-teal-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <LineChart className="w-4 h-4 text-emerald-600" />
              <span>Distress Trends</span>
            </button>

            <button
              onClick={() => onSelectTab('circles')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
                currentTab === 'circles'
                  ? 'bg-white text-teal-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Users className="w-4 h-4 text-indigo-500" />
              <span>Peer Circles</span>
            </button>

            <button
              onClick={() => onSelectTab('toolkit')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
                currentTab === 'toolkit'
                  ? 'bg-white text-teal-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Wind className="w-4 h-4 text-sky-500" />
              <span>Calm Toolkit</span>
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <div className="relative">
              <select
                value={selectedLanguage}
                onChange={(e) => onChangeLanguage(e.target.value as Language)}
                className="appearance-none bg-teal-50/70 border border-teal-200 text-teal-900 font-medium text-xs sm:text-sm rounded-xl pl-3 pr-8 py-1.5 sm:py-2 focus:ring-2 focus:ring-teal-500 focus:outline-hidden cursor-pointer shadow-xs transition"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeLabel}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-teal-700">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>

            {/* Distress Delta pill */}
            <div 
              onClick={() => onSelectTab('trends')}
              title="Distress Delta: Change in stress compared to baseline"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-semibold cursor-pointer hover:bg-emerald-100/70 transition"
            >
              <span>Distress Δ:</span>
              <span className={distressMetrics.distressDeltaPercent <= 0 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                {distressMetrics.distressDeltaPercent > 0 ? `+${distressMetrics.distressDeltaPercent}%` : `${distressMetrics.distressDeltaPercent}%`}
              </span>
            </div>

            {/* Emergency Crisis Hotline Button */}
            <button
              onClick={onOpenCrisisModal}
              title="24/7 National Student Crisis Support"
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs sm:text-sm font-semibold transition shadow-xs"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
              <span className="hidden sm:inline">SOS Help (14416)</span>
              <span className="sm:hidden">SOS</span>
            </button>

            {/* API Key Modal Button */}
            <button
              onClick={onOpenApiKeyModal}
              title="Gemini API Configuration"
              className={`p-2 rounded-xl border text-xs sm:text-sm transition ${
                hasCustomApiKey
                  ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Key className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-2 scrollbar-none border-t border-slate-100">
          <button
            onClick={() => onSelectTab('live')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              currentTab === 'live' ? 'bg-teal-700 text-white font-semibold' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cadberry Live</span>
          </button>
          <button
            onClick={() => onSelectTab('checkin')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              currentTab === 'checkin' ? 'bg-teal-700 text-white font-semibold' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice Check-in</span>
          </button>
          <button
            onClick={() => onSelectTab('trends')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              currentTab === 'trends' ? 'bg-teal-700 text-white font-semibold' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Trends</span>
          </button>
          <button
            onClick={() => onSelectTab('circles')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              currentTab === 'circles' ? 'bg-teal-700 text-white font-semibold' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Peer Circles</span>
          </button>
          <button
            onClick={() => onSelectTab('toolkit')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              currentTab === 'toolkit' ? 'bg-teal-700 text-white font-semibold' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Calm Toolkit</span>
          </button>
        </div>
      </div>
    </header>
  );
};
