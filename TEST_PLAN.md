# YJarvis Testing Plan

## Phase 1: Module Testing (Before Chrome Extension)

### 1. OpenAI Client Testing
Test the AI backend independently:

```javascript
// Create test file: test-openai.html
// Open in browser with API key to test:
// - Summary generation
// - Quiz generation  
// - TTS generation
// - Command processing
```

**Test Steps:**
1. Create `test/test-openai.html`
2. Load OpenAI client module
3. Test each function with sample transcript
4. Verify responses and measure latency

### 2. Player Controller Testing
Test video controls:

```javascript
// Create test file: test-player.html
// Embed a test video element
// Test all control functions:
// - Play/Pause
// - Seek/Skip
// - Speed control
// - Volume control
```

**Test Steps:**
1. Create `test/test-player.html` with embedded video
2. Load PlayerController module
3. Test each control function with buttons
4. Verify video responds correctly

### 3. Voice Controller Testing
Test speech recognition:

```javascript
// Create test file: test-voice.html
// Test Web Speech API:
// - Start/Stop recognition
// - Command capture
// - Error handling
```

**Test Steps:**
1. Create `test/test-voice.html`
2. Load VoiceController module
3. Click to start, speak commands
4. Verify commands are recognized

### 4. Command Processor Testing
Test command parsing:

```javascript
// Create test file: test-commands.html
// Test command matching:
// - Pattern matching
// - Parameter extraction
// - Action mapping
```

**Test Steps:**
1. Create `test/test-commands.html`
2. Input various commands
3. Verify correct actions are identified
4. Test edge cases

## Phase 2: Integration Testing

### 5. Message Passing Test
Test Chrome messaging:

```javascript
// Test communication between:
// - Content script ↔ Service worker
// - Popup ↔ Service worker
```

**Test Steps:**
1. Load extension in Chrome
2. Open YouTube page
3. Send test messages
4. Verify responses

## Phase 3: End-to-End Testing

### 6. Full Extension Test on YouTube

**Test Checklist:**
- [ ] Extension loads on YouTube
- [ ] YJarvis button appears
- [ ] Click button extracts transcript
- [ ] Voice recognition starts
- [ ] Commands control video
- [ ] AI commands generate responses
- [ ] TTS plays responses
- [ ] Low latency (<2s total)

## Performance Benchmarks

Target latencies:
- Transcript extraction: <1s
- Voice recognition: <500ms
- AI summary: <2s
- TTS generation: <1.5s
- Command execution: <100ms

## Known Issues to Test

1. Transcript extraction reliability
2. Voice recognition auto-restart
3. API error handling
4. Audio playback conflicts
5. Multi-tab behavior

## Test Data

Use these YouTube videos (with transcripts):
1. Short video (2-5 min)
2. Medium video (10-15 min)
3. Long video (30+ min)
4. Different content types

## Success Criteria

✅ All modules work independently
✅ Integration works smoothly
✅ Real-time performance achieved
✅ No console errors
✅ Graceful error handling
✅ User experience is seamless
