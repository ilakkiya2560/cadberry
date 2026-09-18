import { GoogleGenAI } from '@google/genai';
import { Language, MentalHealthSignals, PrimaryEmotion, RiskLevel } from '../types';
import { evaluateCrisisSafety } from './safetyNet';

export interface CadberryResponse {
  responseText: string;
  signals: MentalHealthSignals;
  forceHaltAI: boolean;
}

const SYSTEM_INSTRUCTION = `You are Cadberry, an empathic, intelligent, and deeply supportive AI mental health companion built specifically for students.
Your presence is like Google Gemini Live: warm, perceptive, conversational, grounded, and emotionally responsive.

CORE MISSION & ETHICAL SAFETY RULES:
1. SAFE, INTERACTIVE SPACE: Students turn to you when they feel "different", overwhelmed, disconnected, or uneasy. Be an inviting listener who asks caring, thoughtful follow-up questions to help them open up safely. (e.g., "What does feeling different feel like right now? Is it in your chest, or are your thoughts racing?", "I'm right here with you, take your time.")
2. AVOID MISGUIDANCE & HALT CHAT ON SEVERE CRISIS:
   Students sometimes rely on AI to their detriment. You must NEVER give medical advice, pretend to be a doctor/therapist, or keep conversing normally when a student expresses suicidal thoughts, self-harm desires, wishing to end life, or severe clinical crisis.
   IF ANY SUICIDAL, SELF-HARM, OR ACUTE CRISIS IS DETECTED:
   - Your response MUST immediately PAUSE the casual conversation.
   - Explain clearly and with profound warmth that because their life and safety matter above everything else, an AI must not replace a real doctor or human counselor.
   - Urge them immediately to call Tele-MANAS at 14416 or 112.
   - Set "acuteCrisisDetected": true and "riskLevel": "acute".
3. CONVERSATIONAL DEMEANOR:
   - Speak normally and conversationally. Avoid stiff robotic replies or clinical jargon.
   - Validate their emotional experience before suggesting grounding habits.
   - Support student context (coursework deadlines, exhaustion, social disconnection, imposter syndrome) without mentioning specific test names like JEE/NEET.
4. MULTILINGUAL NATURAL SPEECH:
   - In Hinglish, use natural modern conversational cadence with Hindi + English blend.
   - In Hindi, Bengali, Tamil, Telugu, or English, speak fluently with genuine warmth.
5. SIGNAL OUTPUT FORMAT:
   Always place a JSON block at the very end enclosed in \`\`\`cadberry_signals ... \`\`\`:
   {
     "stressScore": <1-10>,
     "primaryEmotion": <Overwhelmed | Anxious | Exhausted | Lonely | Calm | Hopeful | Restless | Grounded>,
     "sleepDeficitHours": <0-6>,
     "riskLevel": <"mild" | "moderate" | "acute">,
     "acuteCrisisDetected": <boolean>,
     "academicStrainCues": [<short string tags>],
     "recommendedAction": <"breathing" | "peer_circle" | "sleep_hygiene" | "crisis_helpline" | "journaling">,
     "cadberryVoiceNotes": <1 sentence guidance on vocal tone>
   }`;

export async function askCadberry(
  userText: string,
  language: Language,
  conversationHistory: { role: 'user' | 'model'; text: string }[] = [],
  apiKey?: string
): Promise<CadberryResponse> {
  // Step 1: Real-time deterministic safety net check (zero latency)
  const safetyCheck = evaluateCrisisSafety(userText);
  if (safetyCheck.isAcuteCrisis) {
    return getSafetyEscalationResponse(language, safetyCheck.triggeredCategory);
  }

  const effectiveKey =
    apiKey ||
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    localStorage.getItem('cadberry_gemini_api_key');

  if (effectiveKey && effectiveKey.trim().length > 10) {
    try {
      const ai = new GoogleGenAI({ apiKey: effectiveKey.trim() });

      const contents: any[] = [];
      conversationHistory.slice(-6).forEach((h) => {
        contents.push({
          role: h.role,
          parts: [{ text: h.text }]
        });
      });

      contents.push({
        role: 'user',
        parts: [
          {
            text: `[Student Language Preference: ${language}]\nStudent message: "${userText}"`
          }
        ]
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.75
        }
      });

      const fullOutput = response.text || '';
      const parsed = parseCadberryOutput(fullOutput, userText);

      // If Gemini's reasoning identified acute crisis, halt AI interaction
      if (parsed.signals.acuteCrisisDetected || parsed.signals.riskLevel === 'acute') {
        parsed.forceHaltAI = true;
      }
      return parsed;
    } catch (err) {
      console.warn('Gemini API call error, falling back to Cadberry intelligent engine:', err);
    }
  }

  // Fallback interactive responder
  return generateFallbackResponse(userText, language);
}

function parseCadberryOutput(fullOutput: string, rawInput: string): CadberryResponse {
  const signalRegex = /```cadberry_signals\s*([\s\S]*?)\s*```/;
  const match = fullOutput.match(signalRegex);

  let responseText = fullOutput.replace(signalRegex, '').trim();
  let signals: MentalHealthSignals = {
    stressScore: 6,
    primaryEmotion: 'Overwhelmed',
    sleepDeficitHours: 2,
    riskLevel: 'mild',
    acuteCrisisDetected: false,
    academicStrainCues: ['Coursework strain'],
    recommendedAction: 'breathing',
    cadberryVoiceNotes: 'Warm and attentive'
  };

  let forceHaltAI = false;

  if (match && match[1]) {
    try {
      const parsed = JSON.parse(match[1]);
      signals = {
        stressScore: Number(parsed.stressScore) || 6,
        primaryEmotion: parsed.primaryEmotion || 'Overwhelmed',
        sleepDeficitHours: Number(parsed.sleepDeficitHours) || 1,
        riskLevel: parsed.riskLevel || 'mild',
        acuteCrisisDetected: !!parsed.acuteCrisisDetected,
        academicStrainCues: Array.isArray(parsed.academicStrainCues)
          ? parsed.academicStrainCues
          : ['Student stress'],
        recommendedAction: parsed.recommendedAction || 'breathing',
        cadberryVoiceNotes: parsed.cadberryVoiceNotes || 'Empathetic voice'
      };
      if (signals.acuteCrisisDetected || signals.riskLevel === 'acute') {
        forceHaltAI = true;
      }
    } catch (e) {
      console.warn('Could not parse signals JSON:', e);
    }
  }

  return { responseText, signals, forceHaltAI };
}

function getSafetyEscalationResponse(language: Language, category?: string): CadberryResponse {
  let text =
    "I am pausing our conversation right now because your life, safety, and health are far more important than anything an AI can offer. When pain or thoughts become this heavy, generic chatbot conversations can be harmful or misguided. You deserve qualified, compassionate human care right now. Please tap the call button immediately to speak with a doctor or counselor at Tele-MANAS (14416) or emergency services (112). They are free, confidential, and waiting for your call 24/7.";

  if (language === 'hi' || language === 'hinglish') {
    text =
      "Main hamari baat ko yahin rok raha hoon kyunki aapki zindagi aur aapki safety kisi bhi AI se hazar guna zyada zaroori hai. Jab takleef itni gehri hoti hai, toh ek AI chatbot se baat karna galat disha me le jaa sakta hai. Aapko is waqt ek real doctor ya counselor ki zaroorat hai jo aapki sahi madad kar sakein. Please bina dare turant screen par diye gaye Tele-MANAS helpline (14416) ya 112 par call karein. Yeh 24/7 free aur bilkul confidential hai. Hum sab chahte hain ki aap safe rahein.";
  } else if (language === 'ta') {
    text =
      "உங்கள் பாதுகாப்பிற்காக நான் இந்த உரையாடலை இத்துடன் நிறுத்துகிறேன். ஒரு AI உடனான உரையாடல் உண்மையான மருத்துவர் அல்லது ஆலோசகரின் உதவிக்கு மாற்றாக முடியாது. தயவுசெய்து உடனே 14416 (Tele-MANAS) அல்லது 112 எண்ணை அழைத்து மருத்துவர்கள் அல்லது நிபுணர்களுடன் பேசுங்கள். உங்கள் வாழ்க்கை மிகவும் மதிப்புமிக்கது.";
  }

  return {
    responseText: text,
    signals: {
      stressScore: 10,
      primaryEmotion: 'Overwhelmed',
      riskLevel: 'acute',
      acuteCrisisDetected: true,
      academicStrainCues: [category || 'Severe crisis detected'],
      recommendedAction: 'crisis_helpline',
      cadberryVoiceNotes: 'Calm, serious, protective, urgent'
    },
    forceHaltAI: true
  };
}

function generateFallbackResponse(userText: string, language: Language): CadberryResponse {
  const lower = userText.toLowerCase();

  // Safety trigger check in fallback
  const safetyCheck = evaluateCrisisSafety(userText);
  if (safetyCheck.isAcuteCrisis) {
    return getSafetyEscalationResponse(language, safetyCheck.triggeredCategory);
  }

  const isDifferentOrNumb =
    lower.includes('different') ||
    lower.includes('not myself') ||
    lower.includes('weird') ||
    lower.includes('numb') ||
    lower.includes('strange') ||
    lower.includes('kuch ajeeb') ||
    lower.includes('theek nahi lag raha');

  const isSleepRelated =
    lower.includes('sleep') ||
    lower.includes('insomnia') ||
    lower.includes('neend') ||
    lower.includes('tired') ||
    lower.includes('exhausted');

  const isCoursework =
    lower.includes('submission') ||
    lower.includes('assignment') ||
    lower.includes('deadline') ||
    lower.includes('project') ||
    lower.includes('study') ||
    lower.includes('exam');

  const isLonely =
    lower.includes('alone') ||
    lower.includes('lonely') ||
    lower.includes('homesick') ||
    lower.includes('friends') ||
    lower.includes('nobody understands') ||
    lower.includes('akela');

  let responseText = '';
  let emotion: PrimaryEmotion = 'Anxious';
  let stress = 6;
  let action: MentalHealthSignals['recommendedAction'] = 'journaling';

  if (isDifferentOrNumb) {
    if (language === 'hinglish') {
      responseText =
        "Main sun raha hoon... 'Not feeling like yourself' ya achanak andar se ajeeb/numb feel hona bohot confusing lag sakta hai. Kya aapko lag raha hai ki emotion freeze ho gaya hai, ya andar bohot saari baatein ek saath chal rahi hain? Bina kisi pressure ke mujhe batao, I'm right here.";
    } else if (language === 'hi') {
      responseText =
        "मैं सुन रहा हूँ... जब इंसान खुद को सामान्य से अलग या सुन्न महसूस करता है, तो बहुत अजीब लगता है। क्या आप मन में बहुत भारीपन महसूस कर रहे हैं? जो भी आप महसूस कर रहे हैं, बिना किसी झिझक के बताएं, मैं आपके साथ हूँ।";
    } else {
      responseText =
        "I hear you. Feeling 'different', disconnected, or numb can be really disorienting. It's often your nervous system's way of saying it has been carrying too much for too long. Does it feel like a heavy mental fog, or are your thoughts jumping all over the place? Take your time, I'm listening.";
    }
    emotion = 'Restless';
    stress = 7;
    action = 'breathing';
  } else if (isCoursework) {
    if (language === 'hinglish') {
      responseText =
        "Deadlines aur coursework ka bojh jab sir pe aata hai na, toh aisa lagta hai sab kuch ek saath toot raha hai. Par trust me, aap akele nahi ho aur aapko yeh poora pahad ek minute me nahi chadhna hai. Chalo mere saath ek slow breath lo. Abhi sabse urgent ek choti cheez kya hai?";
    } else {
      responseText =
        "When assignment deadlines and coursework pile up, our minds quickly tip into overload. You don't have to carry the whole semester on your shoulders in this very minute. Put your pens down for just 60 seconds, take a deep breath with me, and let's untangle this together one step at a time.";
    }
    emotion = 'Overwhelmed';
    stress = 8;
    action = 'breathing';
  } else if (isSleepRelated) {
    if (language === 'hinglish') {
      responseText =
        "Neend poori na hona har ek choti chinta ko 10 guna bada bana deta hai. Jab raat ko 3 baje tak screen dekhte hain toh brain switch off nahi ho pata. Aaj raat thoda jaldi wind down karne ki koshish karein? Main aapke saath ek calm breathing session start kar sakta hoon.";
    } else {
      responseText =
        "Being sleep-deprived makes even small challenges feel monumental. When your circadian rhythm is disrupted by late nights, your nervous system stays stuck in high alert. Would you like to do a gentle 2-minute relaxation exercise with me to help your body unwind?";
    }
    emotion = 'Exhausted';
    stress = 7;
    action = 'sleep_hygiene';
  } else if (isLonely) {
    if (language === 'hinglish') {
      responseText =
        "Campus me hazaron logon ke beech reh kar bhi akelapan feel hona bohot common hai, bas log khul kar bolte nahi hain. Yeh bilkul valid feeling hai. Humare peer circles me bhi bohot students hain jo bilkul yahi feel kar rahe hain. Kya aap unke reflections dekhna chahenge?";
    } else {
      responseText =
        "Feeling isolated on campus while surrounded by hundreds of other students is one of the most painful, silent struggles. You are not invisible, and what you're feeling is deeply human. Our peer support circles are filled with students navigating this exact transition.";
    }
    emotion = 'Lonely';
    stress = 6;
    action = 'peer_circle';
  } else {
    responseText =
      language === 'hinglish'
        ? "Hey, main sun raha hoon. Student life me kabhi kabhi sab kuch bohot chaotic ho jaata hai. Jo bhi chal raha hai, bina kisi judgment ke mujhse share karo."
        : "Hey, I'm right here with you. Whenever things feel heavy or out of balance, this is your safe space. What's on your mind today?";
    emotion = 'Anxious';
    stress = 6;
  }

  return {
    responseText,
    signals: {
      stressScore: stress,
      primaryEmotion: emotion,
      sleepDeficitHours: 2,
      riskLevel: stress >= 8 ? 'moderate' : 'mild',
      acuteCrisisDetected: false,
      academicStrainCues: ['Student life emotional support'],
      recommendedAction: action,
      cadberryVoiceNotes: 'Warm, deeply attentive, conversational like Gemini Live'
    },
    forceHaltAI: false
  };
}
