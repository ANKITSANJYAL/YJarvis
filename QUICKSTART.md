# 🚀 Quick Start Guide

## Ready to Test? Follow These Steps:

### ⚡ Quick Module Testing (5 minutes)

Test each component independently before loading the extension:

#### Test 1: Voice Recognition (Most Important!)
```bash
open test/test-voice.html
```
1. Click the microphone 🎤
2. Say "play", "pause", "skip 30 seconds"
3. Verify commands appear in the list
4. ✅ **Pass criteria:** Commands recognized within 1 second

#### Test 2: Command Parser
```bash
open test/test-commands.html
```
1. Type "skip 30 seconds" and click Test
2. Try example buttons
3. ✅ **Pass criteria:** Correct action detected for each command

#### Test 3: Player Controls
```bash
open test/test-player.html
```
1. Video should load and play
2. Click Play, Pause, Skip buttons
3. ✅ **Pass criteria:** Video responds to all controls

#### Test 4: OpenAI Integration
```bash
open test/test-openai.html
```
1. Enter your OpenAI API key (get from https://platform.openai.com/api-keys)
2. Click "Generate Summary"
3. Click "Generate & Play TTS"
4. ✅ **Pass criteria:** Summary appears + TTS plays in <2 seconds

---

### 🎯 Chrome Extension Testing (10 minutes)

Once module tests pass:

#### Load Extension
1. Open Chrome
2. Go to `chrome://extensions/`
3. Toggle "Developer mode" ON (top-right)
4. Click "Load unpacked"
5. Select this folder: `/Users/ankitsanjyal/Hackathon/YJarvis`
6. ✅ Extension icon should appear in toolbar

#### Configure
1. Click YJarvis extension icon
2. Paste your OpenAI API key
3. Click Save
4. ✅ Should see "API key saved successfully!"

#### Test on YouTube
1. Open this video (has transcript): https://www.youtube.com/watch?v=aircAruvnKk
2. Look for "🎤 YJarvis" button (bottom-right corner)
3. Click it → Wait for "🔴 Listening..."
4. Say: **"summarize"**
5. ✅ Should generate summary + speak it (takes ~2-3 seconds)

#### More Commands to Try
- "pause" → pauses video
- "skip 30 seconds" → jumps ahead
- "speed up" → increases playback speed
- "quiz" → generates quiz questions
- "what is this about?" → AI answers

---

## 🐛 If Something Breaks

### Voice not working?
- **Solution:** Only works in Chrome/Edge. Check microphone permission.

### Transcript not found?
- **Solution:** Video must have captions. Try this one: https://www.youtube.com/watch?v=aircAruvnKk

### API errors?
- **Solution:** Check console (F12) for error details. Verify API key is valid.

### Button not appearing?
- **Solution:** Refresh YouTube page. Check console for errors.

---

## 📊 Performance Checklist

As you test, measure these:

- [ ] Voice recognition: <500ms
- [ ] Transcript load: <1s
- [ ] Summary generation: <2s
- [ ] TTS generation: <1.5s
- [ ] Total "summarize" command: <3s

**Target:** User says "summarize" → Hears response in under 3 seconds total.

---

## 🎉 Success Criteria

You know it's working when:

1. ✅ Voice commands are recognized instantly
2. ✅ Video controls work (play/pause/skip)
3. ✅ "summarize" generates text + speaks it
4. ✅ No console errors
5. ✅ Everything feels **real-time**

---

## 📝 Notes for Testing

### Best Test Videos (all have transcripts):
1. https://www.youtube.com/watch?v=aircAruvnKk (Neural Networks)
2. https://www.youtube.com/watch?v=R9OHn5ZF4Uo (Web Development)
3. https://www.youtube.com/watch?v=8jLOx1hD3_o (Programming)

### Common Commands:
- **Controls:** play, pause, skip 30, rewind 10, speed up, slow down, mute
- **AI:** summarize, quiz, "what is [topic]?", "explain [concept]"

### Console Commands (for debugging):
Open DevTools (F12) and try:
```javascript
// Check if extension loaded
console.log('YJarvis loaded:', !!document.getElementById('yjarvis-control'));

// Check transcript
// (After clicking YJarvis button)
```

---

## 🆘 Need Help?

1. Check browser console (F12) for errors
2. Check `chrome://extensions/` for extension errors
3. Verify API key has credits: https://platform.openai.com/usage
4. Make sure video has transcript (look for "Show transcript" button)

---

## ✨ What Makes This Special

- **Real-time:** Everything happens in <2 seconds
- **Modular:** Each component tested independently
- **Smart:** Uses fast models (gpt-4o-mini, tts-1)
- **Reliable:** Exponential backoff, auto-retry, error handling
- **Clean:** ES6 modules, no redundant code

---

**Now go test it! Start with the module tests, then try the full extension on YouTube.** 🚀
