# 🎤 YJarvis - AI Voice Assistant for YouTube

> Transform your YouTube experience with voice control and AI-powered insights

## 🚀 Features

- **Voice Control**: Hands-free YouTube navigation using natural speech
- **AI Summaries**: Instant video summarization using GPT-4o-mini
- **Interactive Quizzes**: Generate comprehension tests from video content
- **Natural Voice Responses**: TTS feedback for seamless interaction
- **Real-time Performance**: Optimized for <2s latency on all AI operations

## 📋 Project Structure

```
YJarvis/
├── manifest.json              # Chrome extension manifest
├── background/                # Service worker (AI engine)
│   ├── service-worker.js      # Main background script
│   ├── openai-client.js       # OpenAI API integration
│   └── message-handler.js     # Message routing
├── content/                   # Content scripts (YouTube integration)
│   ├── content-script.js      # Main content script
│   ├── player-controller.js   # Video player control
│   ├── transcript-extractor.js # Transcript extraction
│   ├── voice-controller.js    # Speech recognition
│   └── command-processor.js   # Command parsing & execution
├── popup/                     # Extension popup UI
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── test/                      # Modular test files
│   ├── test-openai.html       # Test AI features
│   ├── test-player.html       # Test video controls
│   ├── test-voice.html        # Test voice recognition
│   └── test-commands.html     # Test command parsing
└── icons/                     # Extension icons
```

## 🧪 Testing Instructions

### Phase 1: Module Testing (Before Chrome Extension)

You can test each component independently in your browser before loading as a Chrome extension.

#### 1️⃣ Test OpenAI Integration

```bash
# Open in browser
open test/test-openai.html
```

**What to test:**
- Enter your OpenAI API key (starts with `sk-proj-...`)
- Test summary generation with sample transcript
- Test quiz generation
- Test TTS (text-to-speech)
- Test command processing
- **Verify latency** is under 2 seconds for each operation

#### 2️⃣ Test Video Player Controls

```bash
# Open in browser
open test/test-player.html
```

**What to test:**
- Play/Pause controls
- Skip forward/backward (10s, 30s)
- Speed controls (0.25x - 2x)
- Volume and mute
- Seek to specific time
- Verify all controls work smoothly

#### 3️⃣ Test Voice Recognition

```bash
# Open in browser (Chrome/Edge/Safari recommended)
open test/test-voice.html
```

**What to test:**
- Click microphone button to start
- Speak various commands
- Verify commands are recognized accurately
- Test auto-restart after errors
- Check recognition speed

**Try saying:**
- "play"
- "pause"
- "skip 30 seconds"
- "speed up"
- "summarize"
- "what is machine learning?"

#### 4️⃣ Test Command Parsing

```bash
# Open in browser
open test/test-commands.html
```

**What to test:**
- Enter various commands
- Verify pattern matching works
- Test parameter extraction (e.g., numbers in "skip 30")
- Try example commands
- Test edge cases

### Phase 2: Chrome Extension Testing

Once module tests pass, load as a Chrome extension.

#### Step 1: Load Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `YJarvis` folder
5. Extension should now appear in your toolbar

#### Step 2: Configure API Key

1. Click the YJarvis extension icon
2. Enter your OpenAI API key
3. Click "Save"
4. You should see "API key saved successfully!"

#### Step 3: Test on YouTube

1. Go to any YouTube video **with captions/transcript**
   - Example: https://www.youtube.com/watch?v=aircAruvnKk
2. Look for the "🎤 YJarvis" button (bottom-right of page)
3. Click the button - it will extract the transcript
4. Button changes to "🔴 Listening..."
5. Start speaking commands!

#### Test Commands Checklist

**Basic Controls:**
- [ ] "play" - starts video
- [ ] "pause" - pauses video
- [ ] "skip 30 seconds" - skips forward
- [ ] "rewind 10" - goes backward
- [ ] "speed up" - increases playback speed
- [ ] "slow down" - decreases speed
- [ ] "normal speed" - resets to 1x
- [ ] "mute" - mutes audio
- [ ] "unmute" - unmutes audio

**AI Features:**
- [ ] "summarize" - generates and speaks summary
- [ ] "quiz" - generates quiz questions
- [ ] "what is [topic]?" - answers questions about video

**Expected Behavior:**
- Commands execute within 100ms (for controls)
- AI responses within 2 seconds
- TTS plays automatically
- Button shows status (Processing, Done, Error)

## 🎯 Performance Benchmarks

Target latencies (from button click to completion):

| Operation | Target | Measured |
|-----------|--------|----------|
| Transcript extraction | <1s | ___ |
| Voice recognition | <500ms | ___ |
| Summary generation | <2s | ___ |
| Quiz generation | <2s | ___ |
| TTS generation | <1.5s | ___ |
| Command execution | <100ms | ___ |

## 🔧 Troubleshooting

### Extension doesn't load
- Check `chrome://extensions/` for errors
- Verify all files are in place
- Check browser console for errors

### Voice recognition not working
- Only works in Chrome, Edge, Safari
- Must use HTTPS or localhost
- Check microphone permissions
- Verify Web Speech API support

### Transcript not found
- Video must have captions/transcript enabled
- Click the "Show transcript" button manually first
- Some videos don't have transcripts

### API errors
- Verify API key is correct (starts with `sk-proj-`)
- Check OpenAI account has credits
- Check console for specific error messages
- Verify network connection

### Performance issues
- Check network latency to OpenAI API
- Verify `gpt-4o-mini` model access
- Monitor Chrome DevTools performance tab
- Check for console errors

## 🛠️ Development

### Code Organization

**Modular design** for easy testing and maintenance:

- **`background/`**: All AI processing (runs in service worker)
- **`content/`**: YouTube page integration (runs on youtube.com)
- **`popup/`**: Settings UI (extension popup)
- **`test/`**: Standalone test files (for development)

### Key Design Decisions

1. **ES6 Modules**: Clean imports/exports for testability
2. **Exponential Backoff**: Robust API retry logic
3. **Performance First**: Optimized model selection (gpt-4o-mini, tts-1)
4. **Error Handling**: Graceful degradation on failures
5. **Real-time Feedback**: Status updates at every step

## 📝 API Requirements

You need an OpenAI API key with access to:
- `gpt-4o-mini` (Chat Completions)
- `tts-1` (Text-to-Speech)

Get your key at: https://platform.openai.com/api-keys

## 🎓 Next Steps

After testing:
1. [ ] Verify all modules work independently
2. [ ] Test as Chrome extension
3. [ ] Measure actual latencies
4. [ ] Optimize based on results
5. [ ] Add UI polish (later phase)
6. [ ] Add more command patterns
7. [ ] Implement quiz answer checking
8. [ ] Add history/favorites

## 📄 License

MIT License - See proposal.json for full project details

---

**Built for real-time performance and seamless user experience** 🚀