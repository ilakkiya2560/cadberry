import { supabase } from '../lib/supabase';
import { UserPreference } from '../types';

export interface DetectedPreference {
  preference: string;
  label: string;
}

const PREFERENCE_PATTERNS: Array<{
  preference: string;
  label: string;
  pattern: RegExp;
}> = [
  { preference: 'walking', label: 'Walking', pattern: /\bwalk(?:ing|s)?\b|\bgoing for a walk\b/i },
  { preference: 'music', label: 'Music', pattern: /\bmusic\b|\bsongs?\b|\blisten(?:ing)? to music\b/i },
  { preference: 'badminton', label: 'Badminton', pattern: /\bbadminton\b/i },
  { preference: 'drawing', label: 'Drawing', pattern: /\bdraw(?:ing)?\b|\bsketch(?:ing)?\b/i },
  { preference: 'movies', label: 'Movies', pattern: /\bmovies?\b|\bfilms?\b/i },
  { preference: 'friends', label: 'Friends', pattern: /\b(?:my )?friends?\b|\btalking to people\b/i },
  { preference: 'reading', label: 'Reading', pattern: /\bread(?:ing)?\b|\bbooks?\b/i },
  { preference: 'gaming', label: 'Gaming', pattern: /\bplay(?:ing)? games?\b|\bgaming\b|\bvideo games?\b/i },
];

const POSITIVE_CONTEXT = /\b(?:i\s+(?:really\s+)?(?:like|love|enjoy|prefer)|i\s+(?:really\s+)?(?:enjoy|love)|(?:usually|often|sometimes)\s+helps?\s+me|helps?\s+me\s+(?:to\s+)?(?:relax|calm|reset|clear my head|feel better)|(?:find|found)\s+it\s+(?:helpful|relaxing|calming)|is\s+(?:helpful|relaxing|calming)\s+for me)\b/i;

export function extractPreferences(text: string): DetectedPreference[] {
  if (!text.trim() || !POSITIVE_CONTEXT.test(text)) return [];

  return PREFERENCE_PATTERNS
    .filter(({ pattern }) => pattern.test(text))
    .map(({ preference, label }) => ({ preference, label }));
}

export async function getUserPreferences(userId: string): Promise<UserPreference[]> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data || []) as UserPreference[];
}

export async function addUserPreference(
  userId: string,
  preference: DetectedPreference
): Promise<UserPreference> {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: userId,
        preference: preference.preference,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,preference' }
    )
    .select('*')
    .single();

  if (error) throw error;
  return data as UserPreference;
}

export async function removeUserPreference(userId: string, preference: string): Promise<void> {
  const { error } = await supabase
    .from('user_preferences')
    .delete()
    .eq('user_id', userId)
    .eq('preference', preference);

  if (error) throw error;
}
