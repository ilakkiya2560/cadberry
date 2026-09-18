import { GoogleGenAI } from '@google/genai';
import { Language } from '../types';
import { evaluateCrisisSafety, SafetyCheckResult } from './safetyNet';

export interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

export interface CadberryAIResult {
  text: string;
  isSafetyHalt: boolean;
  safetyDetails?: SafetyCheckResult;
  error?: string;
}

const GEMINI_MODEL_NAME = 'gemini-3.6-flash';

const CADBERRY_SYSTEM_INSTRUCTION = `You are Cadberry, a calm, thoughtful, empathetic student wellbeing companion.
You are a genuine conversational AI powered by Google's Gemini.

CORE BEHAVIOR AND TONE:
- Speak naturally, like a thoughtful, modern conversational AI.
- You should NOT sound robotic, clinical, scripted, overly cheerful, or repetitive.
- You should NOT diagnose mental health conditions.
- You should NOT pretend to be a human, but speak with genuine warmth and conversational presence.
- Respond directly to what the student says, remembering the ongoing context of the current conversation.
- Ask natural, curious, or supportive follow-up questions when useful, just like a good conversationalist.
- DO NOT force breathing exercises, coping exercises, or generic mental health advice into every response. Only offer a calming pause or exercise if the student specifically asks for it or is in clear panic.
- If the student is simply chatting, shoot the breeze and chat naturally with them.
- If the student asks an ordinary or factual question (e.g. studying techniques, coding questions, book suggestions, how something works, general knowledge), answer it directly, accurately, and naturally rather than artificially redirecting everything to wellbeing or feelings.
- If the student discusses college, relationships, exams, assignments, loneliness, stress, hobbies, room-mates, or everyday life, engage naturally and listen with authentic care.
- If the student prefers another language (e.g., Hinglish, Hindi, Tamil, Bengali, Telugu), converse fluently and comfortably in that language without losing your natural, modern conversational tone. In Hinglish, use natural modern conversational phrasing that students actually use.
- Deliver pure, natural text responses. Do not wrap responses in artificial JSON blocks or metadata tags.`;

class CadberryAIService {
  private history: ChatTurn[] = [];

  public getHistory(): ChatTurn[] {
    return [...this.history];
  }

  public clearHistory(): void {
    this.history = [];
  }

  public setHistory(turns: ChatTurn[]): void {
    this.history = [...turns];
  }

  public async sendMessage(
    userText: string,
    language: Language = 'en'
  ): Promise<CadberryAIResult> {
    const trimmedInput = userText.trim();
    if (!trimmedInput) {
      return { text: '', isSafetyHalt: false };
    }

    // 1. SAFETY CHECK (Evaluated BEFORE sending message to Gemini)
    const safetyResult = evaluateCrisisSafety(trimmedInput);
    if (safetyResult.isAcuteCrisis) {
      return {
        text: safetyResult.guidanceText ||
          "I am pausing our conversation right now because your safety and wellbeing are what matter most. An AI companion cannot provide medical or crisis support. Please connect directly with a qualified doctor or counselor on the helpline.",
        isSafetyHalt: true,
        safetyDetails: safetyResult
      };
    }

    // 2. GEMINI API KEY DISCOVERY
    const effectiveKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;

    if (!effectiveKey || effectiveKey.trim().length < 5) {
      return {
        text: 'I am unable to reach the AI service right now.',
        isSafetyHalt: false,
        error: 'API_KEY_MISSING'
      };
    }

    // 3. SEND TO GEMINI CONVERSATION ENGINE
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const buildConversationContents = () => {
      const contents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];

      const recentHistory = this.history.slice(-12);
      for (const turn of recentHistory) {
        contents.push({
          role: turn.role,
          parts: [{ text: turn.text }]
        });
      }

      let turnInput = trimmedInput;
      if (language !== 'en') {
        turnInput = `[Preferred student language: ${language}]\n${trimmedInput}`;
      }

      contents.push({
        role: 'user',
        parts: [{ text: turnInput }]
      });

      return contents;
    };

    let lastError: any = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const ai = new GoogleGenAI({ apiKey: effectiveKey.trim() });
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL_NAME,
          contents: buildConversationContents(),
          config: {
            systemInstruction: CADBERRY_SYSTEM_INSTRUCTION,
            temperature: 0.7,
          }
        });

        const replyText = response.text ? response.text.trim() : '';

        if (!replyText) {
          throw new Error('Empty response received from Gemini API');
        }

        const modelSafetyCheck = evaluateCrisisSafety(replyText);
        if (modelSafetyCheck.isAcuteCrisis) {
          return {
            text: "I am pausing our conversation right now to prioritize your safety. Please connect with human professional help on the helpline.",
            isSafetyHalt: true,
            safetyDetails: modelSafetyCheck
          };
        }

        this.history.push({ role: 'user', text: trimmedInput });
        this.history.push({ role: 'model', text: replyText });

        return {
          text: replyText,
          isSafetyHalt: false
        };
      } catch (err: any) {
        lastError = err;

        const isTransientUnavailable =
          err?.status === 503 ||
          err?.message?.includes('503') ||
          err?.message?.includes('UNAVAILABLE') ||
          err?.message?.includes('high demand') ||
          err?.message?.includes('temporarily busy') ||
          err?.message?.includes('temporarily unavailable');

        console.error('GEMINI RUNTIME ERROR:', err);
        console.error('Gemini conversation error object:', {
          status: err?.status,
          message: err?.message,
          details: err?.details,
          attempt,
          raw: err
        });

        if (!isTransientUnavailable || attempt >= 3) {
          const fullOriginalMessage = err?.message || 'GEMINI_ERROR';
          let errorMessage = fullOriginalMessage;

          if (!fullOriginalMessage || fullOriginalMessage === 'GEMINI_ERROR') {
            errorMessage = 'I ran into a temporary issue connecting to the AI service. Please try again in a moment.';
          }

          return {
            text: errorMessage,
            isSafetyHalt: false,
            error: fullOriginalMessage
          };
        }

        if (attempt === 1) {
          await delay(1000);
        } else if (attempt === 2) {
          await delay(2000);
        }
      }
    }

    const finalMessage = 'Gemini is temporarily busy right now. Please try again in a moment.';
    return {
      text: finalMessage,
      isSafetyHalt: false,
      error: lastError?.message || 'GEMINI_ERROR'
    };
  }
}

export const cadberryAI = new CadberryAIService();
