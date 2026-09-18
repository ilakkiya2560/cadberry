export type Language = 'en' | 'hi' | 'hinglish' | 'ta' | 'bn' | 'te';

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
  voiceLang: string;
}

export type RiskLevel = 'mild' | 'moderate' | 'acute';

export type PrimaryEmotion =
  | 'Overwhelmed'
  | 'Anxious'
  | 'Exhausted'
  | 'Lonely'
  | 'Calm'
  | 'Hopeful'
  | 'Restless'
  | 'Grounded';

export interface MentalHealthSignals {
  stressScore: number; // 1 - 10
  primaryEmotion: PrimaryEmotion;
  sleepDeficitHours?: number; // estimated hours short of 8h
  riskLevel: RiskLevel;
  acuteCrisisDetected: boolean;
  academicStrainCues: string[];
  recommendedAction: 'breathing' | 'peer_circle' | 'sleep_hygiene' | 'crisis_helpline' | 'journaling';
  cadberryVoiceNotes?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'cadberry';
  text: string;
  timestamp: string;
  language: Language;
  signals?: MentalHealthSignals;
  isVoiceInput?: boolean;
  audioDurationSeconds?: number;
}

export interface StudentCheckIn {
  id: string;
  date: string; // ISO format
  dayLabel: string; // "Mon", "Tue"
  stressScore: number; // 1-10
  sleepHours: number;
  emotion: PrimaryEmotion;
  note: string;
  language: Language;
  distressDelta?: number; // % change vs previous baseline
}

export interface PeerCircle {
  id: string;
  title: string;
  tagline: string;
  category: 'Academics' | 'Sleep & Rest' | 'Campus Life' | 'Mindfulness';
  activeMembers: number;
  tags: string[];
  recentTopic: string;
  messages: {
    author: string;
    avatar: string;
    text: string;
    time: string;
    isPeerGuide?: boolean;
  }[];
}

export interface DistressMetrics {
  current7dAvgStress: number;
  previous7dAvgStress: number;
  distressDeltaPercent: number; // e.g. -18% (improvement) or +12%
  checkInCount: number;
  currentStreakDays: number;
  baselineComparison: 'improving' | 'stable' | 'needs_care';
}
