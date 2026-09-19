import { DistressMetrics, Language, PrimaryEmotion, StudentCheckIn } from '../types';

export function deriveCheckInAnalytics(rawText: string, language: Language): Pick<StudentCheckIn, 'stressScore' | 'sleepHours' | 'emotion'> {
  const text = (rawText || '').toLowerCase();
  const isEnglishLike = language === 'en' || language === 'hinglish';

  let stressScore = 5;
  let sleepHours: number | undefined;
  let emotion: PrimaryEmotion = 'Grounded';

  const sleepPatterns = [
    { pattern: /(didn['’]t sleep|no sleep|not slept|awake all night|insomnia|couldn['’]t sleep|bad sleep|sleep deprived)/i, value: 3 },
    { pattern: /(slept well|well rested|good sleep|rested well|sleeping better|got some sleep)/i, value: 8 },
    { pattern: /(slept\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten))\s*hours?/i, value: null },
    { pattern: /(\b\d\b|\b\d\.\d\b)\s*hours?\s*of sleep/i, value: null }
  ];

  for (const entry of sleepPatterns) {
    const match = text.match(entry.pattern as RegExp);
    if (!match) continue;

    if (entry.value !== null) {
      sleepHours = entry.value;
      break;
    }

    const numericMatch = text.match(/(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*hours?\s*of sleep|slept\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*hours?/i);
    if (numericMatch) {
      const extracted = numericMatch[1] || numericMatch[2] || '0';
      const normalized = Number.parseFloat(extracted);
      if (!Number.isNaN(normalized)) {
        sleepHours = normalized;
      }
      break;
    }
  }

  if (/overwhelmed|panic|spiraling|burnt out|too much|everything feels heavy|paralyzed|hopeless|crushing/i.test(text)) {
    emotion = 'Overwhelmed';
    stressScore = 8;
  } else if (/anxious|worried|nervous|racing thoughts|tense|stressed|deadline|assignment|exam|submission/i.test(text)) {
    emotion = 'Anxious';
    stressScore = 7;
  } else if (/exhausted|tired|drained|no sleep|awake all night|can['’]t keep my eyes open|sleep deprived|worn out/i.test(text)) {
    emotion = 'Exhausted';
    stressScore = 8;
  } else if (/lonely|alone|isolated|no one understands|left out|empty/i.test(text)) {
    emotion = 'Lonely';
    stressScore = 6;
  } else if (/hopeful|better|relieved|lighter|managed|okay|ok|more calm|peaceful|felt better/i.test(text)) {
    emotion = 'Hopeful';
    stressScore = 4;
  } else if (/restless|can't settle|wired|agitated|can't focus|jittery/i.test(text)) {
    emotion = 'Restless';
    stressScore = 6;
  } else if (/calm|grounded|settled|steady|fine|okay|peaceful|better/i.test(text)) {
    emotion = 'Calm';
    stressScore = 3;
  } else if (/different|not myself|numb|weird|strange|disconnected|empty/i.test(text)) {
    emotion = 'Grounded';
    stressScore = 5;
  }

  if (!isEnglishLike && /मैं|हूँ|तुम|आज|बहुत|थका|उदास|चिंता|नींद|घबराहट|अकेल|शांत/i.test(text)) {
    if (/बहुत|अकेल|घबराहट|चिंता|असहज|तंग|उदास|अव्यवस्था|बेकरार/i.test(text)) {
      stressScore = Math.max(stressScore, 7);
      emotion = 'Anxious';
    }
    if (/नींद|सोया|स्लीप|अचानक जाग|सुबह|थकान|उम्मीद|ठीक/i.test(text)) {
      const sleepMatch = text.match(/(\d+)\s*(घंटे|hours?|hr|hrs)|नींद\s*(कम|बुरी|अच्छी)|सॉरी|स्लीप/i);
      if (sleepMatch) {
        const parsed = Number.parseFloat(sleepMatch[1] || '0');
        if (!Number.isNaN(parsed) && parsed > 0) {
          sleepHours = parsed;
        }
      }
    }
  }

  return { stressScore: Math.max(1, Math.min(10, stressScore)), sleepHours, emotion };
}

const STORAGE_KEY_CHECKINS = 'cadberry_student_checkins_v1';
const STORAGE_KEY_API_KEY = 'cadberry_gemini_api_key';

export function getStoredApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY_API_KEY) || '';
}

export function setStoredApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_API_KEY, key.trim());
}

// Initial seeded student check-in history to showcase longitudinal pattern tracking
const DEFAULT_CHECKINS: StudentCheckIn[] = [
  {
    id: 'chk-1',
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    dayLabel: '6d ago',
    stressScore: 8.5,
    sleepHours: 4.5,
    emotion: 'Overwhelmed',
    note: 'Multiple assignment submissions due tomorrow; felt completely paralyzed',
    language: 'hinglish',
    distressDelta: 0
  },
  {
    id: 'chk-2',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    dayLabel: '5d ago',
    stressScore: 8.0,
    sleepHours: 5.0,
    emotion: 'Anxious',
    note: 'Submitted the first draft. Head throbbing and eyes burning.',
    language: 'en',
    distressDelta: -5.8
  },
  {
    id: 'chk-3',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    dayLabel: '4d ago',
    stressScore: 7.2,
    sleepHours: 6.0,
    emotion: 'Exhausted',
    note: 'Did 10-minute box breathing with Cadberry before bed; slept a bit deeper.',
    language: 'hinglish',
    distressDelta: -12.5
  },
  {
    id: 'chk-4',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    dayLabel: '3d ago',
    stressScore: 6.5,
    sleepHours: 6.5,
    emotion: 'Restless',
    note: 'Lab viva today. Was nervous but managed to get through.',
    language: 'en',
    distressDelta: -18.2
  },
  {
    id: 'chk-5',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    dayLabel: '2d ago',
    stressScore: 5.8,
    sleepHours: 7.0,
    emotion: 'Calm',
    note: 'Joined the Semester Exam Calm peer circle. Relieved to see others felt the same.',
    language: 'hinglish',
    distressDelta: -24.0
  },
  {
    id: 'chk-6',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    dayLabel: 'Yesterday',
    stressScore: 5.2,
    sleepHours: 7.5,
    emotion: 'Hopeful',
    note: 'Went for a 20-min evening walk around campus lawn. Mind feels lighter.',
    language: 'en',
    distressDelta: -28.4
  }
];

export function getStudentCheckIns(): StudentCheckIn[] {
  if (typeof window === 'undefined') return DEFAULT_CHECKINS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHECKINS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CHECKINS, JSON.stringify(DEFAULT_CHECKINS));
      return DEFAULT_CHECKINS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_CHECKINS;
  }
}

export function saveCheckIn(checkIn: Omit<StudentCheckIn, 'id' | 'date' | 'dayLabel' | 'distressDelta'>): StudentCheckIn {
  const currentList = getStudentCheckIns();
  
  // Calculate Distress Delta against baseline
  const baseline = currentList.length > 0
    ? currentList.slice(0, Math.min(3, currentList.length)).reduce((acc, c) => acc + c.stressScore, 0) / Math.min(3, currentList.length)
    : checkIn.stressScore;

  const delta = baseline > 0 ? ((checkIn.stressScore - baseline) / baseline) * 100 : 0;

  const newRecord: StudentCheckIn = {
    ...checkIn,
    id: 'chk-' + Date.now(),
    date: new Date().toISOString(),
    dayLabel: 'Today',
    distressDelta: Math.round(delta * 10) / 10
  };

  const updated = [...currentList, newRecord];
  try {
    localStorage.setItem(STORAGE_KEY_CHECKINS, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to persist checkin:', e);
  }

  return newRecord;
}

export function computeDistressMetrics(checkIns: StudentCheckIn[]): DistressMetrics {
  if (checkIns.length === 0) {
    return {
      current7dAvgStress: 5,
      previous7dAvgStress: 5,
      distressDeltaPercent: 0,
      checkInCount: 0,
      currentStreakDays: 1,
      baselineComparison: 'stable'
    };
  }

  const recent = checkIns.slice(-4);
  const older = checkIns.slice(0, Math.max(1, checkIns.length - 3));

  const currentAvg = recent.reduce((sum, c) => sum + c.stressScore, 0) / recent.length;
  const olderAvg = older.reduce((sum, c) => sum + c.stressScore, 0) / older.length;

  const diffPercent = olderAvg > 0 ? ((currentAvg - olderAvg) / olderAvg) * 100 : 0;
  const roundedDelta = Math.round(diffPercent * 10) / 10;

  let comparison: 'improving' | 'stable' | 'needs_care' = 'stable';
  if (roundedDelta <= -10) comparison = 'improving';
  else if (roundedDelta >= 10) comparison = 'needs_care';

  return {
    current7dAvgStress: Math.round(currentAvg * 10) / 10,
    previous7dAvgStress: Math.round(olderAvg * 10) / 10,
    distressDeltaPercent: roundedDelta,
    checkInCount: checkIns.length,
    currentStreakDays: Math.min(checkIns.length, 6),
    baselineComparison: comparison
  };
}
