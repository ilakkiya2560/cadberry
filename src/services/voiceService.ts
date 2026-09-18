import { Language, PrimaryEmotion } from '../types';

class VoiceService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
      }
      this.synthesis = window.speechSynthesis || null;
    }
  }

  public isSpeechRecognitionSupported(): boolean {
    return !!this.recognition;
  }

  public isSpeechSynthesisSupported(): boolean {
    return !!this.synthesis;
  }

  public startListening(
    lang: Language,
    onResult: (text: string, isFinal: boolean) => void,
    onError?: (err: any) => void,
    onEnd?: () => void
  ): boolean {
    if (!this.recognition) return false;

    try {
      if (this.isListening) {
        this.recognition.abort();
      }

      // Map language code to BCP 47 tag
      let bcp47 = 'en-US';
      if (lang === 'hi' || lang === 'hinglish') bcp47 = 'hi-IN';
      else if (lang === 'ta') bcp47 = 'ta-IN';
      else if (lang === 'bn') bcp47 = 'bn-IN';
      else if (lang === 'te') bcp47 = 'te-IN';

      this.recognition.lang = bcp47;

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          onResult(finalTranscript, true);
        } else if (interimTranscript) {
          onResult(interimTranscript, false);
        }
      };

      this.recognition.onerror = (e: any) => {
        this.isListening = false;
        if (onError) onError(e);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (onEnd) onEnd();
      };

      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (e) {
      console.warn('Speech recognition start failed:', e);
      this.isListening = false;
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.isListening = false;
    }
  }

  /**
   * Speaks like Gemini Live with natural inflection, warm voice modulation,
   * pacing tuned to the student's emotional state, and sentence-by-sentence delivery.
   */
  public speak(
    text: string,
    lang: Language,
    emotion?: PrimaryEmotion,
    onStart?: () => void,
    onEnd?: () => void,
    onBoundary?: (charIndex: number) => void
  ): void {
    if (!this.synthesis) return;

    this.stopSpeaking();

    // Clean text of markdown formatting for speech
    const cleanText = text
      .replace(/[*_#`~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\n\n+/g, '. ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance = utterance;

    // Emotional voice modulation (like Gemini Live adaptive modulation)
    if (emotion === 'Overwhelmed' || emotion === 'Anxious' || emotion === 'Exhausted') {
      // Gentle, grounding, slower pace with comforting resonance
      utterance.rate = 0.92;
      utterance.pitch = 0.97;
    } else if (emotion === 'Calm' || emotion === 'Grounded' || emotion === 'Hopeful') {
      // Warm, conversational, uplifting rhythm
      utterance.rate = 1.0;
      utterance.pitch = 1.04;
    } else {
      // Default natural human conversational cadence
      utterance.rate = 0.98;
      utterance.pitch = 1.0;
    }

    // Voice selection
    const voices = this.synthesis.getVoices();
    let selectedVoice: SpeechSynthesisVoice | null = null;

    if (lang === 'hi' || lang === 'hinglish') {
      selectedVoice =
        voices.find(v => v.lang.includes('hi') || v.name.includes('Hindi')) ||
        voices.find(v => v.lang.includes('en-IN')) ||
        null;
    } else if (lang === 'ta') {
      selectedVoice = voices.find(v => v.lang.includes('ta')) || null;
    } else if (lang === 'bn') {
      selectedVoice = voices.find(v => v.lang.includes('bn')) || null;
    } else if (lang === 'te') {
      selectedVoice = voices.find(v => v.lang.includes('te')) || null;
    }

    // Default to natural high quality English voice if no specific regional voice or for English
    if (!selectedVoice) {
      selectedVoice =
        voices.find(v => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Karen')) ||
        voices.find(v => v.lang.startsWith('en')) ||
        voices[0] ||
        null;
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    if (onBoundary) {
      utterance.onboundary = (e) => onBoundary(e.charIndex);
    }

    this.synthesis.speak(utterance);
  }

  public stopSpeaking(): void {
    if (this.synthesis) {
      try {
        this.synthesis.cancel();
      } catch (e) {
        // ignore
      }
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return !!this.synthesis?.speaking;
  }
}

export const voiceService = new VoiceService();
