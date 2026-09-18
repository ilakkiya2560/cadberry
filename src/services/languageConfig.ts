import { Language, LanguageOption } from '../types';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    voiceLang: 'en-US'
  },
  {
    code: 'hinglish',
    label: 'Hinglish',
    nativeLabel: 'Hinglish (Hindi + Eng)',
    voiceLang: 'hi-IN'
  },
  {
    code: 'hi',
    label: 'Hindi',
    nativeLabel: 'हिन्दी',
    voiceLang: 'hi-IN'
  },
  {
    code: 'ta',
    label: 'Tamil',
    nativeLabel: 'தமிழ்',
    voiceLang: 'ta-IN'
  },
  {
    code: 'bn',
    label: 'Bengali',
    nativeLabel: 'বাংলা',
    voiceLang: 'bn-IN'
  },
  {
    code: 'te',
    label: 'Telugu',
    nativeLabel: 'తెలుగు',
    voiceLang: 'te-IN'
  }
];

export interface StudentSamplePreset {
  id: string;
  lang: Language;
  title: string;
  subtitle: string;
  transcript: string;
  emotionPreview: string;
  stressPreview: number;
}

export const STUDENT_SAMPLE_PRESETS: StudentSamplePreset[] = [
  {
    id: 'sample-hinglish-1',
    lang: 'hinglish',
    title: 'Semester Project Overload',
    subtitle: 'Hinglish • Late night panic',
    transcript: 'Cadberry, honestly kal submission hai aur mere se bilkul focus nahi ho raha. Raat ko 3 baje tak jagi rehti hu, dimag pura blank ho gaya hai. Aisa lag raha hai sab mujhse aage nikal gaye.',
    emotionPreview: 'Overwhelmed',
    stressPreview: 8
  },
  {
    id: 'sample-hi-1',
    lang: 'hi',
    title: 'First-Year Homesickness',
    subtitle: 'हिन्दी • Campus isolation',
    transcript: 'कैडबरी, कॉलेज में आये दो महीने हो गए पर अभी भी बहुत अकेलापन लगता है। घर की बहुत याद आती है और मेस के खाने से लेकर कमरे तक कुछ अच्छा नहीं लग रहा।',
    emotionPreview: 'Lonely',
    stressPreview: 6
  },
  {
    id: 'sample-en-1',
    lang: 'en',
    title: 'Assignment Anxiety & Exhaustion',
    subtitle: 'English • Burnout & sleep debt',
    transcript: 'Cadberry, I have three back-to-back presentations this week. I slept maybe 4 hours last night, my chest feels tight, and I just can’t seem to catch my breath or prioritize anything.',
    emotionPreview: 'Anxious',
    stressPreview: 7
  },
  {
    id: 'sample-ta-1',
    lang: 'ta',
    title: 'Exam Pressure & Mind Blank',
    subtitle: 'தமிழ் • Exam apprehension',
    transcript: 'கேட்பரி, அடுத்த வாரம் எக்ஸாம்ஸ் இருக்கு. எவ்வளவு படிச்சாலும் ஒண்ணுமே ஞாபகம் இருக்க மாட்டேங்குது. ரொம்ப பயமா இருக்கு, தூங்கவே முடியல.',
    emotionPreview: 'Restless',
    stressPreview: 7
  },
  {
    id: 'sample-bn-1',
    lang: 'bn',
    title: 'Semester Thesis Fatigue',
    subtitle: 'বাংলা • Academic stress',
    transcript: 'ক্যাডবেরি, থিসিস পেপারের ডেডলাইন সামনে কিন্তু আমি কোনোভাবেই ফোকাস করতে পারছি না। প্রতিদিন মাথা ধরে থাকছে আর রাতে ঘুম আসছে না।',
    emotionPreview: 'Exhausted',
    stressPreview: 8
  }
];
