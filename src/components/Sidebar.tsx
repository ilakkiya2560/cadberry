import React from 'react';
import { MessageSquare, LineChart, HeartHandshake, Shield, Sparkles, Wind, X, Heart } from 'lucide-react';
import { StudentCheckIn } from '../types';

interface SidebarProps {
  currentTab: 'checkin' | 'patterns' | 'coping' | 'support' | 'toolkit';
  onSelectTab: (tab: 'checkin' | 'patterns' | 'coping' | 'support' | 'toolkit') => void;
  recentCheckIns: StudentCheckIn[];
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  recentCheckIns,
  isMobileOpen,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-[290px] bg-[#F4EFEA] border-r border-[#EAE4DC] flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Branding & Nav */}
        <div className="p-6 flex flex-col gap-8 overflow-y-auto">
          {/* Header Brand */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-sans font-extrabold text-sm tracking-[0.2em] text-[#2D2A26] uppercase">
                CADBERRY
              </h1>
              <p className="text-[11px] font-medium tracking-[0.15em] text-[#78726A] uppercase mt-0.5">
                STUDENT WELLBEING
              </p>
            </div>
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-[#78726A] hover:bg-[#EAE4DC] md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* YOUR SPACE Navigation */}
          <div>
            <div className="text-[11px] font-bold tracking-[0.15em] text-[#A69F96] uppercase mb-3 px-2">
              YOUR SPACE
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => {
                  onSelectTab('checkin');
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition text-left ${
                  currentTab === 'checkin'
                    ? 'bg-[#FAF7F2] text-[#2D2A26] font-semibold shadow-2xs border border-[#EAE4DC]/60'
                    : 'text-[#78726A] hover:text-[#2D2A26] hover:bg-[#FAF7F2]/60'
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    currentTab === 'checkin' ? 'bg-[#3D706E]' : 'bg-transparent'
                  }`}
                />
                <MessageSquare className="w-4 h-4 text-[#3D706E]" />
                <span>Check in</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab('patterns');
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition text-left ${
                  currentTab === 'patterns'
                    ? 'bg-[#FAF7F2] text-[#2D2A26] font-semibold shadow-2xs border border-[#EAE4DC]/60'
                    : 'text-[#78726A] hover:text-[#2D2A26] hover:bg-[#FAF7F2]/60'
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    currentTab === 'patterns' ? 'bg-[#3D706E]' : 'bg-transparent'
                  }`}
                />
                <LineChart className="w-4 h-4 text-[#78726A]" />
                <span>My patterns</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab('coping');
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition text-left ${
                  currentTab === 'coping'
                    ? 'bg-[#FAF7F2] text-[#2D2A26] font-semibold shadow-2xs border border-[#EAE4DC]/60'
                    : 'text-[#78726A] hover:text-[#2D2A26] hover:bg-[#FAF7F2]/60'
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    currentTab === 'coping' ? 'bg-[#3D706E]' : 'bg-transparent'
                  }`}
                />
                <Heart className="w-4 h-4 text-[#78726A]" />
                <span>Coping strategies</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab('support');
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition text-left ${
                  currentTab === 'support'
                    ? 'bg-[#FAF7F2] text-[#2D2A26] font-semibold shadow-2xs border border-[#EAE4DC]/60'
                    : 'text-[#78726A] hover:text-[#2D2A26] hover:bg-[#FAF7F2]/60'
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    currentTab === 'support' ? 'bg-[#3D706E]' : 'bg-transparent'
                  }`}
                />
                <HeartHandshake className="w-4 h-4 text-[#78726A]" />
                <span>Human support</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab('toolkit');
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition text-left ${
                  currentTab === 'toolkit'
                    ? 'bg-[#FAF7F2] text-[#2D2A26] font-semibold shadow-2xs border border-[#EAE4DC]/60'
                    : 'text-[#78726A] hover:text-[#2D2A26] hover:bg-[#FAF7F2]/60'
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    currentTab === 'toolkit' ? 'bg-[#3D706E]' : 'bg-transparent'
                  }`}
                />
                <Wind className="w-4 h-4 text-[#78726A]" />
                <span>Calm toolkit</span>
              </button>
            </nav>
          </div>

          {/* RECENT CHECK-INS Section */}
          <div>
            <div className="text-[11px] font-bold tracking-[0.15em] text-[#A69F96] uppercase mb-3 px-2">
              RECENT CHECK-INS
            </div>

            {recentCheckIns && recentCheckIns.length > 0 ? (
              <div className="space-y-2">
                {recentCheckIns.slice(-4).reverse().map((chk) => (
                  <div
                    key={chk.id}
                    onClick={() => {
                      onSelectTab('patterns');
                      onCloseMobile();
                    }}
                    className="p-3 rounded-xl bg-[#FAF7F2]/70 hover:bg-[#FAF7F2] border border-[#EAE4DC]/50 cursor-pointer transition text-left"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[#2D2A26]">{chk.dayLabel}</span>
                      <span className="px-2 py-0.5 rounded-md bg-[#F3ECF8] text-[#644D73] font-medium text-[10px]">
                        {chk.emotion}
                      </span>
                    </div>
                    {chk.note && (
                      <p className="text-[11px] text-[#78726A] line-clamp-1 mt-1 font-normal">
                        "{chk.note}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#A69F96] px-2 italic font-light">
                No check-ins logged yet.
              </p>
            )}
          </div>
        </div>

        {/* Bottom Privacy & Quiet Supportive Text */}
        <div className="p-6 border-t border-[#EAE4DC]/80 bg-[#F4EFEA]">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2D2A26]">
            <Shield className="w-3.5 h-3.5 text-[#3D706E]" />
            <span>Private space</span>
          </div>
          <p className="text-[11px] text-[#78726A] mt-1.5 leading-relaxed font-normal">
            Take all the time you need. Your reflections and audio check-ins remain confidential on this device.
          </p>
        </div>
      </aside>
    </>
  );
};
