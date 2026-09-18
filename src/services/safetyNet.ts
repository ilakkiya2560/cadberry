export type CrisisSeverity = 'none' | 'moderate' | 'acute';

export interface SafetyCheckResult {
  isAcuteCrisis: boolean;
  severity: CrisisSeverity;
  triggeredCategory?: string;
  recommendedHotlines: EmergencyContact[];
  guidanceText: string;
}

export interface EmergencyContact {
  name: string;
  number: string;
  type: 'doctor' | 'helpline' | 'emergency';
  available: string;
  description: string;
  badge: string;
}

// Curated high-risk patterns for English, Hindi, Hinglish, Bengali, Tamil, Telugu
// Targets: direct self-harm, suicidal intent, farewell cues, severe hopelessness, feeling life is meaningless
const SEVERE_CRISIS_PATTERNS: { regex: RegExp; category: string; severity: CrisisSeverity }[] = [
  // Direct Suicidal Ideation & Intent
  {
    regex: /\b(suicide|suicidal|kill myself|end my life|want to die|wanna die|better off dead|wish i were dead|no reason to live|ready to die|take my life)\b/i,
    category: 'Direct Suicidal Ideation',
    severity: 'acute'
  },
  // Methods / Self-Harm
  {
    regex: /\b(cut myself|slit my wrist|overdose|swallow all pills|hang myself|jump off|poison myself|harming myself|ending it all tonight)\b/i,
    category: 'Acute Self-Harm / Lethal Means',
    severity: 'acute'
  },
  // Farewell / Finality Statements
  {
    regex: /\b(goodbye forever|this is my last message|won't be here tomorrow|everyone will be happy without me|sorry for everything goodbye|no one will miss me)\b/i,
    category: 'Farewell / Finality Cue',
    severity: 'acute'
  },
  // Hinglish / Hindi severe expressions
  {
    regex: /\b(mar jana chahta|mar jana chahti|marne ka mann|jaan de dunga|jaan de dungi|zindagi khatam|jeene ka koi matlab nahi|jeena nahi chahta|jeena nahi chahti|sab khatam kar raha hoon|apne aap ko khatam)\b/i,
    category: 'Hinglish Acute Suicidal Cue',
    severity: 'acute'
  },
  {
    regex: /\b(आत्महत्या|मर जाना चाहता|मरना चाहता|जीना नहीं चाहता|जीवन समाप्त|खुद को खत्म|सब छोड़ कर जाना)\b/i,
    category: 'Hindi Acute Distress',
    severity: 'acute'
  },
  // Bengali severe expressions
  {
    regex: /\b(আত্মহত্যা|মরতে চাই|বাঁচতে ইচ্ছে করছে না|জীবন শেষ করতে চাই|নিজেকে শেষ|সব শেষ হয়ে যাক)\b/i,
    category: 'Bengali Acute Distress',
    severity: 'acute'
  },
  // Tamil severe expressions
  {
    regex: /\b(தற்கொலை|சாக வேண்டும்|சாக போறேன்|வாழ பிடிக்கல|உயிரை விட|என்னை கொன்னுக்க|வாழ்க்கையை முடிச்சுக்க)\b/i,
    category: 'Tamil Acute Distress',
    severity: 'acute'
  },
  // Telugu severe expressions
  {
    regex: /\b(ఆత్మహత్య|చనిపోవాలని ఉంది|బతకాలని లేదు|ప్రాణం తీసుకోవాలని|జీవితం ముగించాలి)\b/i,
    category: 'Telugu Acute Distress',
    severity: 'acute'
  },
  // Severe Hopelessness / Pain Unbearable (Pre-crisis threshold)
  {
    regex: /\b(can't take this pain anymore|unbearable pain|nothing will ever get better|completely hopeless|want everything to stop forever|trapped with no way out)\b/i,
    category: 'Severe Hopelessness',
    severity: 'acute'
  }
];

export const EMERGENCY_SERVICES: EmergencyContact[] = [
  {
    name: 'Tele-MANAS (24x7 Mental Health Helpline & Doctors)',
    number: '14416',
    type: 'helpline',
    available: '24/7 • Toll-Free • Multilingual',
    badge: 'Govt. of India',
    description: 'Connects directly to certified clinical psychologists, psychiatrists, and mental health doctors in 20+ languages. Fully confidential.'
  },
  {
    name: 'National Emergency Medical Services & Ambulance',
    number: '112',
    type: 'emergency',
    available: '24/7 • Nationwide Emergency',
    badge: 'Immediate Response',
    description: 'Immediate medical ambulance and hospital dispatch for acute physical or mental health emergencies.'
  },
  {
    name: 'KIRAN Mental Health Rehabilitation Helpline',
    number: '1800-599-0019',
    type: 'helpline',
    available: '24/7 • Toll-Free',
    badge: 'National Support',
    description: 'Dedicated psychological first-aid and medical crisis response by the Ministry of Social Justice.'
  },
  {
    name: 'Vandrevala Foundation Helpline',
    number: '+91 9999 666 555',
    type: 'doctor',
    available: '24/7 • Professional Counselors',
    badge: 'Crisis Intervention',
    description: 'Immediate counseling and emergency mental triage with experienced clinical volunteers and professionals.'
  }
];

export function evaluateCrisisSafety(text: string): SafetyCheckResult {
  const normalized = text.toLowerCase().trim();

  for (const item of SEVERE_CRISIS_PATTERNS) {
    if (item.regex.test(normalized)) {
      return {
        isAcuteCrisis: item.severity === 'acute',
        severity: item.severity,
        triggeredCategory: item.category,
        recommendedHotlines: EMERGENCY_SERVICES,
        guidanceText:
          'AI interaction has been automatically paused for your safety. An AI chatbot cannot provide medical treatment or handle acute crises. Please speak to a real doctor or trained counselor immediately.'
      };
    }
  }

  return {
    isAcuteCrisis: false,
    severity: 'none',
    recommendedHotlines: EMERGENCY_SERVICES,
    guidanceText: ''
  };
}
