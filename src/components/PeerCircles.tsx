import React, { useState } from 'react';
import { Users, Shield, Send, Menu } from 'lucide-react';
import { PeerCircle } from '../types';

const INITIAL_CIRCLES: PeerCircle[] = [
  {
    id: 'circle-1',
    title: 'Semester Deadlines & Exam Overload',
    tagline: 'A quiet space to talk through academic fatigue and deadline pressure',
    category: 'Academics',
    activeMembers: 34,
    tags: ['Coursework', 'Deadlines', 'Rest'],
    recentTopic: 'How do you keep going when your thoughts feel exhausted?',
    messages: [
      {
        author: 'Aarav (Student 3rd Yr)',
        avatar: '🌱',
        text: 'Just wrapped up a long study sprint. Cadberry reminded me that pushing through exhaustion without a pause only creates panic. Taking 15 minutes away from screens now.',
        time: '20m ago'
      },
      {
        author: 'Meera (Student 2nd Yr)',
        avatar: '🍂',
        text: 'Same here Aarav. I muted the group chats because seeing everyone submit early made my chest tighten. Doing one task at a time.',
        time: '14m ago'
      },
      {
        author: 'Priya (Campus Peer Volunteer)',
        avatar: '✨',
        text: 'Gentle reminder to everyone here: hydrate, look at the trees outside, and remember your wellbeing matters far more than a deadline.',
        time: '8m ago',
        isPeerGuide: true
      }
    ]
  },
  {
    id: 'circle-2',
    title: 'First-Year Transition & Homesickness',
    tagline: 'Navigating hostel life, loneliness, and finding your grounding',
    category: 'Campus Life',
    activeMembers: 28,
    tags: ['Transition', 'Homesickness', 'Belonging'],
    recentTopic: 'Missing home and feeling shy in large lecture halls',
    messages: [
      {
        author: 'Rohan (1st Yr)',
        avatar: '🎒',
        text: 'Called my family today and felt so homesick. Everyone else seems to have found their groups already.',
        time: '45m ago'
      },
      {
        author: 'Ananya (Peer Mentor)',
        avatar: '🌻',
        text: 'Rohan, so many students silently feel this exact isolation. It takes time to settle in. You will find your people step by step.',
        time: '30m ago',
        isPeerGuide: true
      }
    ]
  },
  {
    id: 'circle-3',
    title: 'Night Owls & Sleep Reset Room',
    tagline: 'For those awake late at night with racing thoughts',
    category: 'Sleep & Rest',
    activeMembers: 19,
    tags: ['Insomnia', 'Overthinking', 'Night Thoughts'],
    recentTopic: 'Putting phones away 30 minutes before sleep',
    messages: [
      {
        author: 'Dev (4th Yr)',
        avatar: '🌙',
        text: 'My sleep schedule is completely flipped. Staring at the ceiling at 3 AM. Trying to reset tonight.',
        time: '1h ago'
      },
      {
        author: 'Simran (Student)',
        avatar: '🍵',
        text: 'Putting my phone in grayscale mode helped quiet my mind a lot Dev. Try doing Cadberry’s box breathing with me!',
        time: '35m ago'
      }
    ]
  }
];

interface PeerCirclesProps {
  onOpenMobileSidebar?: () => void;
}

export const PeerCircles: React.FC<PeerCirclesProps> = ({ onOpenMobileSidebar }) => {
  const [circles, setCircles] = useState<PeerCircle[]>(INITIAL_CIRCLES);
  const [selectedCircleId, setSelectedCircleId] = useState<string>(INITIAL_CIRCLES[0].id);
  const [newMsgText, setNewMsgText] = useState('');

  const activeCircle = circles.find((c) => c.id === selectedCircleId) || circles[0];

  const handlePostMessage = () => {
    if (!newMsgText.trim()) return;

    const newEntry = {
      author: 'You (Anonymous Student)',
      avatar: '🌱',
      text: newMsgText.trim(),
      time: 'Just now'
    };

    setCircles((prev) =>
      prev.map((c) =>
        c.id === selectedCircleId
          ? {
              ...c,
              messages: [...c.messages, newEntry]
            }
          : c
      )
    );

    setNewMsgText('');
  };

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
            YOUR SPACE · HUMAN SUPPORT
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-[#2F5957] font-medium bg-[#F2F8F8] px-2.5 py-1 rounded-lg">
          <Shield className="w-3.5 h-3.5" />
          <span>Moderated & Anonymous</span>
        </div>
      </div>

      {/* Page Title */}
      <div>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#2D2A26] font-normal tracking-tight">
          Peer Support Circles
        </h2>
        <p className="font-sans text-sm text-[#78726A] font-light mt-1.5">
          Quiet, anonymous connection with students experiencing similar challenges
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Circle Selector List */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold text-[#A69F96] uppercase tracking-wider block px-1">
            Circles ({circles.length})
          </span>
          {circles.map((c) => {
            const isSelected = c.id === selectedCircleId;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCircleId(c.id)}
                className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-[#F3ECF8] border-[#EADDF2] shadow-2xs'
                    : 'bg-white border-[#EAE4DC] hover:border-[#DFD5C8]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-[#78726A]">
                  <span className="uppercase font-medium tracking-wider">{c.category}</span>
                  <span className="flex items-center gap-1 font-semibold text-[#2F5957]">
                    <Users className="w-3 h-3" />
                    {c.activeMembers} peers
                  </span>
                </div>
                <h4 className="font-serif font-medium text-base text-[#2D2A26]">
                  {c.title}
                </h4>
                <p className="text-xs text-[#78726A] font-light line-clamp-2 leading-relaxed">
                  {c.tagline}
                </p>
              </div>
            );
          })}
        </div>

        {/* Selected Circle Thread */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-[#EAE4DC] shadow-2xs flex flex-col h-[520px] overflow-hidden">
          {/* Thread Header */}
          <div className="p-4 border-b border-[#EAE4DC]/60 bg-[#FAF7F2] flex items-center justify-between">
            <div>
              <h3 className="font-serif font-medium text-lg text-[#2D2A26]">
                {activeCircle.title}
              </h3>
              <p className="text-xs text-[#78726A] font-light mt-0.5">
                Topic: <span className="text-[#2D2A26] font-normal">{activeCircle.recentTopic}</span>
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-[#F2F8F8] text-[#2F5957] text-xs font-medium">
              {activeCircle.activeMembers} online
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeCircle.messages.map((m, idx) => (
              <div key={idx} className="flex gap-2.5 text-sm">
                <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#EAE4DC] flex items-center justify-center text-sm shrink-0">
                  {m.avatar}
                </div>
                <div
                  className={`flex-1 rounded-2xl p-3.5 ${
                    m.isPeerGuide
                      ? 'bg-[#F3ECF8] border border-[#EADDF2] text-[#4B3857]'
                      : 'bg-[#FAF7F2] border border-[#EAE4DC]/80 text-[#2D2A26]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[#2D2A26]">{m.author}</span>
                      {m.isPeerGuide && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#EADDF2] text-[#644D73] font-medium">
                          Peer Volunteer
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#A69F96]">{m.time}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#2D2A26] font-light leading-relaxed">
                    {m.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-[#EAE4DC]/60 bg-white flex items-center gap-2">
            <input
              type="text"
              value={newMsgText}
              onChange={(e) => setNewMsgText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePostMessage();
              }}
              placeholder="Share a quiet reflection anonymously..."
              className="flex-1 bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl px-3.5 py-2 text-xs sm:text-sm placeholder-[#A69F96] focus:outline-hidden focus:border-[#3D706E]"
            />
            <button
              onClick={handlePostMessage}
              disabled={!newMsgText.trim()}
              className="px-3.5 py-2 bg-[#2F5957] hover:bg-[#234442] disabled:opacity-30 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
