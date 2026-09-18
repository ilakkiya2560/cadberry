# Cadberry | Student Mental Health Companion

A proactive, voice-first, multilingual mental health web companion built for students, powered by Google Gemini (`gemini-3.8-flash`) and designed around the principles of proactive early intervention, emotional support, and human connection.

## Key Features

1. **Cadberry Live (Gemini Live Style)**:
   - Dynamic glowing live orb reflecting speaking, listening, and thinking states.
   - Natural conversational voice and emotional modulation (slower, softer pacing during high anxiety; warm, encouraging rhythm during recovery).
   - Voice-first interaction with real-time speech-to-text (Web Speech API) and speech synthesis.
   - Multilingual support: English, Hinglish, हिन्दी (Hindi), தமிழ் (Tamil), বাংলা (Bengali), and తెలుగు (Telugu).
   - Tailored specifically to general student life: coursework, deadlines, late nights, sleep exhaustion, feeling behind, and campus loneliness.

2. **Daily 60s Voice Check-in**:
   - 30–90 second voice check-in recorder with audio waveform animation.
   - Extraction of stress biomarkers (1–10), sleep debt, and primary emotions.
   - Quick one-click student voice note presets for instant testing.

3. **Longitudinal Distress Delta Tracking**:
   - Measures real week-over-week wellbeing outcomes ($\text{Distress Delta} = \frac{\text{Current Avg} - \text{Baseline}}{\text{Baseline}} \times 100\%$).
   - Longitudinal Stress vs. Sleep trajectory charts.
   - Habit tracking streak and history log.

4. **Two-Layer Crisis Safety Net**:
   - Immediate deterministic acute trigger filter with zero model latency.
   - Direct emergency modal with one-touch dialing to **Tele-MANAS (14416 / 1800 891 4416)**, **KIRAN (1800-599-0019)**, and campus support.

5. **Moderated Peer Support Circles**:
   - Anonymous, safe student communities organized by shared challenges (Semester Deadlines, Night Owls & Sleep Reset, First-Year Transition).
   - Real-time peer messages with volunteer guidance.

6. **Calm & Reset Toolkit**:
   - Visual 4-4-4-4 Box Breathing circle.
   - 5-4-3-2-1 Sensory Grounding exercise.
   - Student routine & sleep reset checklist.

## Getting Started

```bash
cd /Users/ilakkiya/.gemini/antigravity/scratch/student-mental-health-companion
npm install
npm run dev
```

Open `http://localhost:5174/` (or the port shown in terminal) in your browser.
