import React, { useState } from 'react';
import { Users, MessageSquare, Heart, Shield, Send, Sparkles, PlusCircle } from 'lucide-react';
import { PeerCircle } from '../types';

const INITIAL_CIRCLES: PeerCircle[] = [
  {
    id: 'circle-1',
    title: 'Semester Deadlines & Exam Overload',
    tagline: 'A gentle space to vent about coursework and panic without shame',
    category: 'Academics',
    activeMembers: 34,
    tags: ['Project Submissions', 'Exam Stress', 'Mental Fatigue'],
    recentTopic: 'How do you keep studying when your brain feels completely cooked?',
    messages: [
      {
        author: 'Aarav (CS 3rd Yr)',
        avatar: '👨‍💻',
        text: 'Just finished a 14-hour sprint. Felt guilty taking even 10 mins off, but Cadberry’s breathing helped me realize pushing through exhaustion is counter-productive.',
        time: '20m ago'
      },
      {
        author: 'Meera (Design 2nd Yr)',
        avatar: '🎨',
        text: 'Same here Aarav! I stopped looking at group chats because seeing everyone submit early gave me sheer palpitations. One task at a time.',
        time: '14m ago'
      },
      {
        author: 'Priya (Campus Peer Guide)',
        avatar: '🌟',
        text: 'Gentle reminder to everyone here: hydrate, get 10 minutes of fresh air, and remember your grades do not define your worth.',
        time: '8m ago',
        isPeerGuide: true
      }
    ]
  },
  {
    id: 'circle-2',
    title: 'First-Year Transition & Homesickness',
    tagline: 'Navigating hostel life, loneliness, and finding your people on campus',
    category: 'Campus Life',
    activeMembers: 28,
    tags: ['Hostel Life', 'Homesickness', 'Making Friends'],
    recentTopic: 'Missing home cooked meals and feeling shy in large lecture halls',
    messages: [
      {
        author: 'Rohan (1st Yr Biotech)',
        avatar: '🎒',
        text: 'Called my mom today and almost cried. Everyone else in the dorm seems to have cliques already. Feeling like an outsider.',
        time: '45m ago'
      },
      {
        author: 'Ananya (Senior Peer Volunteer)',
        avatar: '🌻',
        text: 'Rohan, I promise you 90% of freshmen feel this exact loneliness, they just put on a brave face on Instagram. You will find your people step by step.',
        time: '30m ago',
        isPeerGuide: true
      }
    ]
  },
  {
    id: 'circle-3',
    title: 'Night Owls & Sleep Reset Room',
    tagline: 'For those awake at 3 AM with racing thoughts and blue screens',
    category: 'Sleep & Rest',
    activeMembers: 19,
    tags: ['Insomnia', 'Overthinking', 'Sleep Wind-Down'],
    recentTopic: 'Putting phones away 30 mins before sleep challenge',
    messages: [
      {
        author: 'Dev (Mech 4th Yr)',
        avatar: '🌙',
        text: 'My sleep schedule is so inverted. I sleep at 5 AM and wake up at 1 PM with a headache. Trying to pull it back today.',
        time: '1h ago'
      },
      {
        author: 'Simran (Bio Med)',
        avatar: '🍵',
        text: 'Warm chamomile tea and putting phone in grayscale mode helped me a lot Dev. Try doing Cadberry’s 4-7-8 breathing circle!',
        time: '35m ago'
      }
    ]
  }
];

export const PeerCircles: React.FC = () => {
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
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full text-xs font-bold w-fit border border-indigo-200">
          <Shield className="w-3.5 h-3.5" />
          <span>Moderated & Anonymous Student Circles</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-800 mt-2">
          Peer Support Circles
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Real human connection with students who share your academic and campus challenges.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Circle Selector List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Available Circles ({circles.length})
          </h3>
          {circles.map((c) => {
            const isSelected = c.id === selectedCircleId;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCircleId(c.id)}
                className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-indigo-50/70 border-indigo-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {c.category}
                    </span>
                    <span className="text-[11px] font-semibold text-indigo-700 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {c.activeMembers} online
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-slate-800 mt-1.5">
                    {c.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {c.tagline}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1 mt-1">
                  {c.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-medium"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Circle Live Thread */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col h-[520px] overflow-hidden">
          {/* Thread Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-slate-800">
                {activeCircle.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Topic: <span className="text-slate-700 font-medium">{activeCircle.recentTopic}</span>
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              {activeCircle.activeMembers} Peers Active
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {activeCircle.messages.map((m, idx) => (
              <div key={idx} className="flex gap-3 text-sm">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg shrink-0">
                  {m.avatar}
                </div>
                <div
                  className={`flex-1 rounded-2xl p-4 shadow-2xs ${
                    m.isPeerGuide
                      ? 'bg-amber-50/80 border border-amber-200 text-slate-800'
                      : 'bg-slate-50 border border-slate-200/80 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-800">{m.author}</span>
                      {m.isPeerGuide && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          Peer Volunteer
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">{m.time}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {m.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Box to Share Reflection */}
          <div className="p-3 sm:p-4 border-t border-slate-100 bg-white flex items-center gap-2">
            <input
              type="text"
              value={newMsgText}
              onChange={(e) => setNewMsgText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePostMessage();
              }}
              placeholder="Share an encouraging thought or reflection anonymously..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handlePostMessage}
              disabled={!newMsgText.trim()}
              className="p-2.5 sm:px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Post</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
