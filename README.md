# Jarvis YouTube Assistant

Production-grade MV3 Chrome extension that brings AI-powered voice control to YouTube, inspired by Tony Stark's JARVIS. Control YouTube hands-free, search for videos naturally, and generate learning tools like summaries, flashcards, and quizzes.

## 🎯 Key Features

✅ **Voice Control**: "Jarvis, pause" - hands-free YouTube control with wake word detection  
✅ **Smart Search**: Natural language video search with intelligent ranking  
✅ **AI Summaries**: Brief, standard, or detailed summaries of any video  
✅ **Flashcards**: Auto-generated with spaced repetition (SM-2 algorithm)  
✅ **Quizzes**: AI-generated questions with auto-grading  
✅ **Complete Playback Control**: Speed, volume, seeking, captions, fullscreen  
✅ **Secure**: Encrypted API keys, no telemetry, privacy-first  

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Chrome/Chromium browser
- OpenAI API key (get one at https://platform.openai.com/)

### Installation

1. **Clone and install**
   ```bash
   git clone https://github.com/ANKITSANJYAL/YJarvis.git
   cd YJarvis
   npm install
   ```

2. **Build the extension**
   ```bash
   npm run build
   ```

3. **Load in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

4. **Setup API Key**
   - Click the extension icon
   - Go to Settings tab
   - Enter your OpenAI API key
   - Save and you're ready!

## 📖 Usage

### Voice Commands

Activate with "Jarvis" or "Dummy" followed by your command:

```
"Jarvis, pause the video"
"Jarvis, skip forward 30 seconds"
"Jarvis, set volume to 50 percent"
"Jarvis, search for React tutorials"
"Jarvis, play at 1.5x speed"
"Jarvis, go to 2 minutes"
"Jarvis, turn on captions"
"Jarvis, fullscreen"
```

### Extension Features

- **Dashboard**: Voice visualizer, quota monitoring, quick actions
- **Summary**: Generate video summaries at different detail levels
- **Flashcards**: Create and review flashcards with spaced repetition
- **Quiz**: Test your understanding with AI-generated questions
- **Settings**: Configure API keys, voice settings, privacy controls

## 🛠️ Development

### Build & Quality Gates

```bash
npm install                                    # Install dependencies
npm run lint && npm run type-check            # Quality checks
npm run test                                  # Run tests
npm run build                                 # Production build
```

### Development Mode

```bash
npm run dev          # Development build with watch mode
npm run build:dev    # Development build with source maps
```

## Features (Phase 1–4)

- Wake word voice control (Jarvis/Dummy), play/pause/seek/volume
- Intelligent search + ranking + 1-hour cache
- Transcript fetch + summarization (brief/standard/detailed)
- Flashcards (SM-2) + export; Quiz generator + grading

## Security & Privacy

- API key encrypted (Web Crypto AES-GCM) in `chrome.storage.local`
- Minimal host permissions; CSP-friendly build
- No telemetry by default; optional analytics can be added

## Testing

- Unit: Jest + jsdom; E2E: Playwright (to be expanded)

## Next

- Accessibility polish, performance optimization, integration/E2E coverage, docs