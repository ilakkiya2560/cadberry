import { DistressMetrics, StudentCheckIn, UserPreference } from '../types';

export interface CopingRecommendation {
  title: string;
  text: string;
  tone: 'gentle' | 'supportive' | 'prominent';
}

const GENERIC_OPTIONS = [
  'Try two minutes of slow breathing, letting your shoulders soften on each exhale.',
  'Step away from your screen for a few minutes and get some water.',
  'Write down one small next step, then give yourself permission to pause.',
];

const PREFERENCE_SUGGESTIONS: Record<string, string> = {
  walking: 'Take a short walk if that usually helps you reset.',
  music: 'Take a short break with some music you enjoy.',
  badminton: 'If it feels manageable, play a little badminton as a change of pace.',
  drawing: 'Give yourself 10–15 minutes to sketch or draw as a reset.',
  movies: 'Take a gentle break with a familiar movie you enjoy.',
  friends: 'Consider messaging a friend you feel comfortable talking to.',
  reading: 'Read a few pages of something you enjoy before returning to your day.',
  gaming: 'Take a short, intentional gaming break if that feels restorative today.',
};

export function buildCopingRecommendations(
  checkIns: StudentCheckIn[],
  metrics: DistressMetrics,
  preferences: UserPreference[]
): CopingRecommendation[] {
  const latest = checkIns[checkIns.length - 1];
  const stress = latest?.stressScore ?? metrics.current7dAvgStress;
  const isHighStrain = stress >= 8 || metrics.baselineComparison === 'needs_care';
  const isModerateStrain = stress >= 6 || metrics.distressDeltaPercent >= 10;
  const knownSuggestion = preferences
    .map((item) => PREFERENCE_SUGGESTIONS[item.preference])
    .find(Boolean);

  if (isHighStrain) {
    return [
      {
        title: 'A small reset for right now',
        text: knownSuggestion || GENERIC_OPTIONS[0],
        tone: 'prominent',
      },
      {
        title: 'Make the next few minutes lighter',
        text: latest?.sleepHours != null && latest.sleepHours < 6
          ? 'Your recent check-ins mention limited sleep. If possible, choose a low-effort pause and protect a little time for rest.'
          : GENERIC_OPTIONS[1],
        tone: 'supportive',
      },
    ];
  }

  if (isModerateStrain) {
    return [{
      title: 'For right now',
      text: knownSuggestion || GENERIC_OPTIONS[2],
      tone: 'supportive',
    }];
  }

  return [{
    title: 'A gentle option',
    text: knownSuggestion || 'You could choose a few quiet minutes for something that helps you feel steady.',
    tone: 'gentle',
  }];
}
