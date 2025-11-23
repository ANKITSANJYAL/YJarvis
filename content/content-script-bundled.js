// Content Script - YouTube Page Integration (Bundled)
console.log('🚀 [YJarvis] Content script file loaded!', window.location.href);

// ============= Player Controller =============
class PlayerController {
  constructor() {
    this.video = document.querySelector('video');
    if (!this.video) {
      throw new Error('Video element not found');
    }
    console.log('[PlayerController] Initialized');
  }

  play() {
    console.log('[PlayerController] ▶️ play() called, paused state:', this.video.paused);
    this.video.play();
    console.log('[PlayerController] ▶️ play() completed');
    return true;
  }

  pause() {
    console.log('[PlayerController] ⏸️ pause() called, paused state:', this.video.paused);
    this.video.pause();
    console.log('[PlayerController] ⏸️ pause() completed');
    return true;
  }

  togglePlayPause() {
    if (this.video.paused) {
      this.play();
    } else {
      this.pause();
    }
    return true;
  }

  getCurrentTime() {
    return this.video.currentTime;
  }

  getDuration() {
    return this.video.duration;
  }

  seek(seconds) {
    // Check if video is ready and duration is valid
    if (!this.video || isNaN(this.video.duration) || !isFinite(this.video.duration)) {
      console.warn('[PlayerController] Video not ready or invalid duration');
      return false;
    }
    
    const targetTime = Math.max(0, Math.min(seconds, this.video.duration));
    if (!isFinite(targetTime)) {
      console.error('[PlayerController] Invalid target time:', targetTime);
      return false;
    }
    
    this.video.currentTime = targetTime;
    return true;
  }

  skip(seconds) {
    if (!this.video || isNaN(this.video.currentTime)) {
      console.warn('[PlayerController] Video not ready for skip');
      return false;
    }
    
    const newTime = this.video.currentTime + seconds;
    return this.seek(newTime);
  }

  rewind(seconds) {
    return this.skip(-seconds);
  }

  getPlaybackRate() {
    return this.video.playbackRate;
  }

  setPlaybackRate(rate) {
    this.video.playbackRate = Math.max(0.25, Math.min(2.0, rate));
    return true;
  }

  setSpeed(percentage) {
    const current = this.video.playbackRate;
    
    if (percentage === null) {
      const newSpeed = Math.min(2.0, current + 0.25);
      console.log(`[PlayerController] ⚡ setSpeed() - incrementing from ${current}x to ${newSpeed}x`);
      this.video.playbackRate = newSpeed;
      return newSpeed;
    } else {
      const targetSpeed = 1 + (percentage / 100);
      const clampedSpeed = Math.min(2.0, Math.max(0.25, targetSpeed));
      console.log(`[PlayerController] ⚡ setSpeed(${percentage}%) - ${current}x → ${clampedSpeed}x`);
      this.video.playbackRate = clampedSpeed;
      return clampedSpeed;
    }
  }

  increaseSpeed(percentage = null) {
    return this.setSpeed(percentage);
  }

  decreaseSpeed(percentage = null) {
    const current = this.video.playbackRate;
    
    if (percentage === null) {
      const newSpeed = Math.max(0.25, current - 0.25);
      console.log(`[PlayerController] 🐌 decreaseSpeed() - decrementing from ${current}x to ${newSpeed}x`);
      this.video.playbackRate = newSpeed;
      return newSpeed;
    } else {
      const targetSpeed = current - (percentage / 100);
      const clampedSpeed = Math.min(2.0, Math.max(0.25, targetSpeed));
      console.log(`[PlayerController] 🐌 decreaseSpeed(${percentage}%) - ${current}x → ${clampedSpeed}x`);
      this.video.playbackRate = clampedSpeed;
      return clampedSpeed;
    }
  }

  normalSpeed() {
    console.log('[PlayerController] 🔄 normalSpeed()');
    this.setPlaybackRate(1.0);
    return true;
  }

  setVolume(level) {
    const current = Math.round(this.video.volume * 100);
    
    if (level === null) {
      const newVolume = Math.min(100, current + 10);
      console.log(`[PlayerController] 🔊 setVolume() - incrementing from ${current}% to ${newVolume}%`);
      this.video.volume = newVolume / 100;
      return newVolume;
    } else {
      const clampedLevel = Math.min(100, Math.max(0, level));
      console.log(`[PlayerController] 🔊 setVolume(${level}%) - ${current}% → ${clampedLevel}%`);
      this.video.volume = clampedLevel / 100;
      return clampedLevel;
    }
  }

  increaseVolume(amount = null) {
    const current = Math.round(this.video.volume * 100);
    const increment = amount || 10;
    const newVolume = Math.min(100, current + increment);
    console.log(`[PlayerController] 🔊 increaseVolume(${increment}) - ${current}% → ${newVolume}%`);
    this.video.volume = newVolume / 100;
    return newVolume;
  }

  decreaseVolume(amount = null) {
    const current = Math.round(this.video.volume * 100);
    const decrement = amount || 10;
    const newVolume = Math.max(0, current - decrement);
    console.log(`[PlayerController] 🔉 decreaseVolume(${decrement}) - ${current}% → ${newVolume}%`);
    this.video.volume = newVolume / 100;
    return newVolume;
  }

  mute() {
    console.log('[PlayerController] 🔇 mute()');
    this.video.muted = true;
    return true;
  }

  unmute() {
    console.log('[PlayerController] 🔊 unmute()');
    this.video.muted = false;
    return true;
  }
}

// ============= Transcript Extractor =============
class TranscriptExtractor {
  async extract() {
    console.log('[TranscriptExtractor] Extracting transcript...');
    const startTime = performance.now();

    try {
      const transcript = await this.extractFromPanel();
      
      if (transcript && transcript.length > 0) {
        const duration = performance.now() - startTime;
        console.log(`[TranscriptExtractor] Extracted ${transcript.length} chars in ${duration.toFixed(0)}ms`);
        return transcript;
      }

      throw new Error('No transcript available for this video');
    } catch (error) {
      console.error('[TranscriptExtractor] Error:', error);
      throw error;
    }
  }

  async extractFromPanel() {
    const transcriptButton = await this.findTranscriptButton();
    
    if (transcriptButton && !transcriptButton.getAttribute('aria-expanded')) {
      transcriptButton.click();
      console.log('[TranscriptExtractor] Opened transcript panel');
      await this.waitForTranscriptPanel();
    }

    const transcriptText = this.extractTextFromPanel();
    return transcriptText;
  }

  async findTranscriptButton() {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Try multiple selectors
    const buttons = document.querySelectorAll('button, yt-button-shape button');
    for (const button of buttons) {
      const text = button.textContent || '';
      const ariaLabel = button.getAttribute('aria-label') || '';
      if (text.toLowerCase().includes('transcript') || 
          ariaLabel.toLowerCase().includes('transcript')) {
        return button;
      }
    }

    // Check if already open
    const panel = document.querySelector('ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-transcript"]');
    if (panel && panel.getAttribute('visibility') === 'ENGAGEMENT_PANEL_VISIBILITY_EXPANDED') {
      console.log('[TranscriptExtractor] Transcript panel already open');
      return null;
    }

    throw new Error('Transcript button not found');
  }

  async waitForTranscriptPanel() {
    const maxWait = 5000;
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      const segments = document.querySelectorAll('ytd-transcript-segment-renderer');
      if (segments.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    throw new Error('Transcript panel did not load');
  }

  extractTextFromPanel() {
    const segments = document.querySelectorAll('ytd-transcript-segment-renderer');
    
    if (segments.length === 0) {
      throw new Error('No transcript segments found');
    }

    const transcriptParts = [];
    segments.forEach(segment => {
      const textElement = segment.querySelector('yt-formatted-string.segment-text');
      if (textElement) {
        transcriptParts.push(textElement.textContent.trim());
      }
    });

    const fullTranscript = transcriptParts.join(' ');
    
    if (fullTranscript.length === 0) {
      throw new Error('Transcript is empty');
    }

    return fullTranscript;
  }
}

// ============= Voice Controller =============
class VoiceController {
  constructor(onCommandCallback) {
    this.onCommandCallback = onCommandCallback;
    this.recognition = null;
    this.isListening = false;
    
    this.initRecognition();
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('[VoiceController] Web Speech API not supported');
      throw new Error('Voice recognition not supported in this browser');
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true; // Continuous until second whistle
    this.recognition.interimResults = true; // Show interim results
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;
    
    this.lastTranscript = '';

    this.recognition.onstart = () => {
      console.log('[VoiceController] ⏺️ Listening... (whistle again to stop & execute)');
      this.isListening = true;
    };

    this.recognition.onresult = (event) => {
      // Get the latest transcript (interim or final)
      const lastResult = event.results[event.results.length - 1];
      const transcript = lastResult[0].transcript.trim();
      
      if (lastResult.isFinal) {
        console.log('[VoiceController] 📝 Final:', transcript);
        this.lastTranscript = transcript;
      } else {
        console.log('[VoiceController] 📝 Interim:', transcript);
        this.lastTranscript = transcript;
      }
      
      // Update UI with current transcript
      if (this.onInterimCallback) {
        this.onInterimCallback(transcript);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('[VoiceController] ❌ Error:', event.error);
      if (event.error !== 'no-speech') {
        this.isListening = false;
      }
    };

    this.recognition.onend = () => {
      console.log('[VoiceController] ⏹️ Recognition ended');
      this.isListening = false;
    };
  }
  
  setInterimCallback(callback) {
    this.onInterimCallback = callback;
  }
  
  getLastTranscript() {
    return this.lastTranscript;
  }
  
  clearTranscript() {
    this.lastTranscript = '';
  }

  start() {
    if (!this.isListening) {
      try {
        this.isListening = true;
        this.recognition.start();
      } catch (error) {
        console.error('[VoiceController] Failed to start:', error);
        this.isListening = false;
      }
    }
  }

  stop() {
    if (this.isListening) {
      try {
        this.isListening = false;
        this.recognition.stop();
      } catch (error) {
        console.error('[VoiceController] Failed to stop:', error);
      }
    }
  }
}

// ============= Command Processor =============
class CommandProcessor {
  constructor(playerController) {
    this.playerController = playerController;
    
    // Cache for AI responses to reduce latency
    this.commandCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    
    // Available actions with descriptions for AI understanding
    this.availableActions = {
      search: 'Search YouTube for videos (param: search query)',
      play: 'Start or resume video playback',
      pause: 'Pause the video',
      skip: 'Skip forward by X seconds (extract number from command)',
      rewind: 'Go backward by X seconds (extract number from command)',
      seek: 'Go to specific timestamp in seconds',
      speedUp: 'Increase playback speed (param: percentage increase or null for 25% increment)',
      slowDown: 'Decrease playback speed (param: percentage decrease or null for 25% decrement)',
      normalSpeed: 'Reset playback speed to 1x',
      setVolume: 'Set volume to specific level (param: 0-100)',
      increaseVolume: 'Increase volume (param: amount or null for 10% increment)',
      decreaseVolume: 'Decrease volume (param: amount or null for 10% decrement)',
      mute: 'Mute the audio',
      unmute: 'Unmute the audio',
      summarize: 'Generate AI summary of video transcript',
      quiz: 'Generate quiz questions from video content'
    };
  }

  async process(command, transcript) {
    console.log('[CommandProcessor] 🧠 Processing command with AI:', command);

    // Use AI to understand the intent
    const match = await this.semanticMatchCommand(command);

    if (match && match.action !== 'query') {
      console.log('[CommandProcessor] ✅ AI matched action:', match);
      return await this.executeAction(match, transcript);
    }

    console.log('[CommandProcessor] 💭 Treating as conversational query');
    return await this.handleAIQuery(command, transcript);
  }

  fastFallbackCheck(normalized) {
    // Ultra-fast exact matches for common commands
    const exactMatches = {
      'play': { action: 'play', param: null, confidence: 1.0 },
      'pause': { action: 'pause', param: null, confidence: 1.0 },
      'stop': { action: 'pause', param: null, confidence: 0.95 },
      'mute': { action: 'mute', param: null, confidence: 1.0 },
      'unmute': { action: 'unmute', param: null, confidence: 1.0 },
    };
    
    if (exactMatches[normalized]) {
      return exactMatches[normalized];
    }
    
    if (/^(play|resume|start)$/.test(normalized)) {
      return { action: 'play', param: null, confidence: 0.95 };
    }
    if (/^(pause|stop)$/.test(normalized)) {
      return { action: 'pause', param: null, confidence: 0.95 };
    }
    
    return null;
  }

  async semanticMatchCommand(command) {
    // Normalize command for cache lookup
    const normalizedCommand = command.toLowerCase().trim();
    
    // Check cache first for instant response
    if (this.commandCache.has(normalizedCommand)) {
      const cached = this.commandCache.get(normalizedCommand);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log(`[CommandProcessor] ⚡ Cache hit! Instant match: ${cached.match.action}`);
        return cached.match;
      } else {
        this.commandCache.delete(normalizedCommand);
      }
    }
    
    // Try fast fallback first for instant common commands
    const fastMatch = this.fastFallbackCheck(normalizedCommand);
    if (fastMatch && fastMatch.confidence > 0.85) {
      console.log('[CommandProcessor] ⚡ INSTANT match (no AI needed)!');
      return fastMatch;
    }
    
    // Try full fallback pattern matching BEFORE AI (much faster!)
    const patternMatch = this.fallbackPatternMatch(command);
    if (patternMatch && patternMatch.confidence > 0.85) {
      console.log('[CommandProcessor] ⚡ PATTERN matched (skipping AI)!');
      return patternMatch;
    }
    
    console.log('[CommandProcessor] 🤖 Using AI (slow path)...');
    
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'semanticMatch',
        command: command,
        availableActions: this.availableActions
      });

      if (response.error) {
        console.warn('[CommandProcessor] AI not available, using fallback:', response.error);
        return this.fallbackPatternMatch(normalizedCommand);
      }
      
      // Cache the result
      if (response.match) {
        this.commandCache.set(normalizedCommand, {
          match: response.match,
          timestamp: Date.now()
        });
      }

      console.log('[CommandProcessor] AI response:', response);
      
      // Only use AI match if confidence is high enough
      if (response.match && response.match.confidence > 0.7) {
        return response.match;
      }
      
      console.log('[CommandProcessor] Low confidence, trying fallback');
      return this.fallbackPatternMatch(command);
    } catch (error) {
      console.error('[CommandProcessor] Error in semantic matching:', error);
      
      // Check if extension context was invalidated
      if (error.message && error.message.includes('Extension context invalidated')) {
        console.warn('[CommandProcessor] ⚠️ Extension reloaded - using fallback patterns');
      }
      
      return this.fallbackPatternMatch(command);
    }
  }

  fallbackPatternMatch(command) {
    console.log('[CommandProcessor] ⚡ Fast pattern matching...');
    const normalized = command.toLowerCase().trim();
    
    // Extract numbers for skip/rewind/seek commands
    const numberMatch = normalized.match(/(\d+)/);
    const number = numberMatch ? parseInt(numberMatch[1]) : null;
    
    // Enhanced search patterns - catch more variations
    if (/\b(search|find|play|show|watch|video|look for)\b.*(video|on|about|for|tutorial|guide)\b/i.test(normalized) ||
        /\b(play|show)\s+(a|an|the)?\s*video/i.test(normalized) ||
        /video\s+(on|about|for)/i.test(normalized)) {
      // Extract search query - remove command words
      let query = normalized
        .replace(/^(search|find|play|show me|watch|look for)\s+(for\s+)?/i, '')
        .replace(/^(a|an|the)\s+video\s+(on|about|for)\s+/i, '')
        .replace(/\s+(video|videos)$/i, '')
        .trim();
      
      // If still has "video" in the middle, extract the part after it
      const videoMatch = query.match(/video\s+(on|about|for)\s+(.+)/i);
      if (videoMatch) {
        query = videoMatch[2].trim();
      }
      
      if (query && query.length > 2) {
        console.log('[CommandProcessor] ⚡ FAST SEARCH detected:', query);
        return { action: 'search', param: query, confidence: 0.95 };
      }
    }
    
    // Play/Resume patterns (only for current video)
    if (/^(play|resume|start|continue)$/i.test(normalized)) {
      return { action: 'play', param: null, confidence: 0.9 };
    }
    
    // Pause patterns
    if (/\b(pause|stop|wait|hold)\b/.test(normalized)) {
      return { action: 'pause', param: null, confidence: 0.9 };
    }
    
    // Skip/Forward patterns
    if (/\b(skip|forward|ahead)\b/.test(normalized) && number) {
      return { action: 'skip', param: number, confidence: 0.85 };
    }
    
    // Rewind/Back patterns
    if (/\b(rewind|back|backward|previous)\b/.test(normalized) && number) {
      return { action: 'rewind', param: number, confidence: 0.85 };
    }
    
    // Speed patterns
    if (/\b(speed up|faster|increase speed)\b/.test(normalized)) {
      return { action: 'speedUp', param: null, confidence: 0.85 };
    }
    
    if (/\b(slow down|slower|decrease speed)\b/.test(normalized)) {
      return { action: 'slowDown', param: null, confidence: 0.85 };
    }
    
    if (/\b(normal speed|reset speed|1x)\b/.test(normalized)) {
      return { action: 'normalSpeed', param: null, confidence: 0.9 };
    }
    
    // Mute patterns
    if (/\b(mute|silence|quiet)\b/.test(normalized) && !/unmute/.test(normalized)) {
      return { action: 'mute', param: null, confidence: 0.9 };
    }
    
    if (/\b(unmute|sound on|audio on)\b/.test(normalized)) {
      return { action: 'unmute', param: null, confidence: 0.9 };
    }
    
    // AI features
    if (/\b(summarize|summary|tldr)\b/.test(normalized)) {
      return { action: 'summarize', param: null, confidence: 0.9 };
    }
    
    if (/\b(quiz|test|questions)\b/.test(normalized)) {
      return { action: 'quiz', param: null, confidence: 0.9 };
    }
    
    // Treat as query if no match
    return { action: 'query', param: null, confidence: 0.5 };
  }

  async executeAction(match, transcript) {
    const { action, param } = match;
    console.log('[CommandProcessor] Executing action:', action, param ? `(param: ${param})` : '');

    try {
      switch (action) {
        case 'search':
          console.log('[CommandProcessor] → Searching YouTube and auto-playing:', param);
          await this.searchYouTube(param);
          return { success: true, message: `Playing top result for: ${param}` };
        case 'play':
          console.log('[CommandProcessor] → Calling playerController.play()');
          this.playerController.play();
          console.log('[CommandProcessor] ✅ Play executed');
          return { success: true, message: 'Playing' };
        case 'pause':
          console.log('[CommandProcessor] → Calling playerController.pause()');
          this.playerController.pause();
          console.log('[CommandProcessor] ✅ Pause executed');
          return { success: true, message: 'Paused' };
        case 'skip':
          console.log('[CommandProcessor] → Calling playerController.skip(' + param + ')');
          const skipResult = this.playerController.skip(parseInt(param));
          if (!skipResult) {
            return { success: false, error: 'Video not ready. Please wait a moment.' };
          }
          console.log('[CommandProcessor] ✅ Skip executed');
          return { success: true, message: `Skipped ${param}s` };
        case 'rewind':
          console.log('[CommandProcessor] → Calling playerController.rewind(' + param + ')');
          const rewindResult = this.playerController.rewind(parseInt(param));
          if (!rewindResult) {
            return { success: false, error: 'Video not ready. Please wait a moment.' };
          }
          console.log('[CommandProcessor] ✅ Rewind executed');
          return { success: true, message: `Rewound ${param}s` };
        case 'seek':
          const seekResult = this.playerController.seek(parseInt(param));
          if (!seekResult) {
            return { success: false, error: 'Video not ready. Please wait a moment.' };
          }
          return { success: true, message: `Seeked to ${param}s` };
        case 'speedUp':
          this.playerController.increaseSpeed(param ? parseInt(param) : null);
          return { success: true, message: 'Speed increased' };
        case 'slowDown':
          this.playerController.decreaseSpeed(param ? parseInt(param) : null);
          return { success: true, message: 'Speed decreased' };
        case 'normalSpeed':
          this.playerController.normalSpeed();
          return { success: true, message: 'Normal speed' };
        case 'setVolume':
          this.playerController.setVolume(parseInt(param));
          return { success: true, message: `Volume set to ${param}%` };
        case 'increaseVolume':
          this.playerController.increaseVolume(param ? parseInt(param) : null);
          return { success: true, message: 'Volume increased' };
        case 'decreaseVolume':
          this.playerController.decreaseVolume(param ? parseInt(param) : null);
          return { success: true, message: 'Volume decreased' };
        case 'mute':
          this.playerController.mute();
          return { success: true, message: 'Muted' };
        case 'unmute':
          this.playerController.unmute();
          return { success: true, message: 'Unmuted' };
        case 'summarize':
          return await this.handleSummarize(transcript);
        case 'quiz':
          return await this.handleQuiz(transcript);
        default:
          console.error('[CommandProcessor] ❌ Unknown action:', action);
          return { success: false, error: 'Unknown action' };
      }
    } catch (error) {
      console.error('[CommandProcessor] ❌ Error executing action:', error);
      return { success: false, error: error.message };
    }
  }

  async searchYouTube(query) {
    if (!query) {
      console.error('[CommandProcessor] No search query provided');
      return;
    }
    
    // Store the search intent in sessionStorage to survive page navigation
    sessionStorage.setItem('yjarvis_auto_play', 'true');
    sessionStorage.setItem('yjarvis_search_query', query);
    
    // Navigate to YouTube search
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    console.log('[CommandProcessor] 🔍 Navigating to search, will auto-play on load:', query);
    window.location.href = searchUrl;
  }
  
  checkAndAutoPlaySearch() {
    // Check if we should auto-play from a previous search command
    const shouldAutoPlay = sessionStorage.getItem('yjarvis_auto_play');
    const searchQuery = sessionStorage.getItem('yjarvis_search_query');
    
    if (shouldAutoPlay === 'true' && window.location.pathname === '/results') {
      console.log('[CommandProcessor] 🎯 Auto-play triggered for search:', searchQuery);
      
      // Clear the flags
      sessionStorage.removeItem('yjarvis_auto_play');
      sessionStorage.removeItem('yjarvis_search_query');
      
      // Wait a bit for page to fully load, then click first video
      setTimeout(() => {
        this.clickFirstVideo();
      }, 1500);
    }
  }
  
  async clickFirstVideo() {
    console.log('[CommandProcessor] 🎯 Looking for first video to auto-play...');
    
    return new Promise((resolve, reject) => {
      const maxAttempts = 15;
      let attempts = 0;
      
      const findAndClick = () => {
        attempts++;
        console.log(`[CommandProcessor] Attempt ${attempts}/${maxAttempts} to find video...`);
        
        // Try multiple selectors for video results
        const selectors = [
          'ytd-video-renderer:first-of-type a#video-title',
          'ytd-video-renderer:first-child a#video-title',
          'ytd-video-renderer a#video-title',
          'ytd-video-renderer h3 a',
          'a#video-title'
        ];
        
        for (const selector of selectors) {
          const videoLink = document.querySelector(selector);
          if (videoLink && videoLink.href && videoLink.href.includes('/watch?v=')) {
            console.log('[CommandProcessor] ✅ Found first video, auto-playing:', videoLink.href);
            videoLink.click();
            resolve();
            return;
          }
        }
        
        if (attempts >= maxAttempts) {
          console.warn('[CommandProcessor] ⚠️ Could not auto-play after ' + maxAttempts + ' attempts');
          reject(new Error('Could not find video after ' + maxAttempts + ' attempts'));
          return;
        }
        
        // Try again after a short delay
        setTimeout(findAndClick, 200);
      };
      
      findAndClick();
    });
  }

  async handleSummarize(transcript) {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GENERATE_SUMMARY',
        transcript: transcript
      });

      if (response && response.success) {
        const ttsResponse = await chrome.runtime.sendMessage({
          type: 'GENERATE_TTS',
          text: response.data
        });

        return {
          success: true,
          audioUrl: ttsResponse && ttsResponse.success ? ttsResponse.data : null
        };
      }

      return response || { success: false, error: 'No response from service worker' };
    } catch (error) {
      console.error('[CommandProcessor] Error in handleSummarize:', error);
      return { success: false, error: error.message };
    }
  }

  async handleQuiz(transcript) {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GENERATE_QUIZ',
        transcript: transcript
      });

      if (response && response.success) {
        const quiz = response.data;
        const firstQuestion = quiz.questions[0];
        const questionText = `Here's your first question: ${firstQuestion.question}`;
        
        const ttsResponse = await chrome.runtime.sendMessage({
          type: 'GENERATE_TTS',
          text: questionText
        });

        return {
          success: true,
          audioUrl: ttsResponse && ttsResponse.success ? ttsResponse.data : null
        };
      }

      return response || { success: false, error: 'No response from service worker' };
    } catch (error) {
      console.error('[CommandProcessor] Error in handleQuiz:', error);
      return { success: false, error: error.message };
    }
  }

  async handleAIQuery(command, transcript) {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'PROCESS_COMMAND',
        command: command,
        transcript: transcript
      });

      if (response && response.success) {
        const ttsResponse = await chrome.runtime.sendMessage({
          type: 'GENERATE_TTS',
          text: response.data
        });

        return {
          success: true,
          audioUrl: ttsResponse && ttsResponse.success ? ttsResponse.data : null
        };
      }

      return response || { success: false, error: 'No response from service worker' };
    } catch (error) {
      console.error('[CommandProcessor] Error in handleAIQuery:', error);
      
      // Check if it's a context invalidation error
      if (error.message && error.message.includes('Extension context invalidated')) {
        return { success: false, error: 'Extension reloaded. Please refresh the page.' };
      }
      
      return { success: false, error: error.message };
    }
  }
}

// ============= Whistle Detector =============
class WhistleDetector {
  constructor(onWhistleDetected) {
    this.onWhistleDetected = onWhistleDetected;
    this.isListening = false;
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.rafId = null;
    
    // Whistle detection parameters - MORE SENSITIVE
    this.whistleFrequencyMin = 1200;  // Even lower to catch more whistles
    this.whistleFrequencyMax = 4500;  // Higher range
    this.whistleThreshold = 0.35;     // Much more sensitive (35% instead of 50%)
    this.whistleDuration = 100;       // Shorter duration required (100ms)
    this.whistleStartTime = null;
    this.lastLogTime = 0;
    this.cooldownUntil = 0;           // Prevent multiple triggers
  }

  async start() {
    if (this.isListening) {
      console.log('[WhistleDetector] Already listening');
      return;
    }
    
    console.log('[WhistleDetector] 🎤 Requesting microphone access...');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false
        } 
      });
      
      console.log('[WhistleDetector] ✅ Microphone access granted!');
      
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;
      
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.microphone.connect(this.analyser);
      
      this.isListening = true;
      this.detectWhistle();
      
      console.log('[WhistleDetector] 👂 Whistle detection ACTIVE! Range: 1200-4500Hz, Threshold: 35%');
      console.log('[WhistleDetector] 🎵 Just whistle briefly (100ms) to activate voice control!');
      
      // Update UI label
      const label = document.getElementById('yjarvis-label');
      if (label) {
        label.textContent = '🎵 Whistle mode active!';
        label.style.background = 'rgba(16, 185, 129, 0.9)';
      }
    } catch (error) {
      console.error('[WhistleDetector] ❌ Microphone access DENIED:', error);
      console.error('[WhistleDetector] Please allow microphone access in browser settings!');
      
      // Update UI to show error
      const label = document.getElementById('yjarvis-label');
      if (label) {
        label.textContent = '❌ Mic access denied - check permissions';
        label.style.background = 'rgba(234, 67, 53, 0.9)';
      }
    }
  }

  stop() {
    if (!this.isListening) return;
    
    this.isListening = false;
    
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    
    if (this.microphone) {
      this.microphone.disconnect();
    }
    
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    console.log('[WhistleDetector] 👂 Whistle detection stopped');
  }

  detectWhistle() {
    if (!this.isListening) return;
    
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    
    const sampleRate = this.audioContext.sampleRate;
    const binSize = sampleRate / this.analyser.fftSize;
    
    let maxAmplitude = 0;
    let peakFrequency = 0;
    
    const minBin = Math.floor(this.whistleFrequencyMin / binSize);
    const maxBin = Math.floor(this.whistleFrequencyMax / binSize);
    
    for (let i = minBin; i < maxBin && i < bufferLength; i++) {
      if (dataArray[i] > maxAmplitude) {
        maxAmplitude = dataArray[i];
        peakFrequency = i * binSize;
      }
    }
    
    const normalizedAmplitude = maxAmplitude / 255;
    
    // Update visual feedback in real-time
    const now = Date.now();
    if (normalizedAmplitude > 0.15 && now - this.lastLogTime > 500) {
      console.log(`[WhistleDetector] 🔊 ${Math.round(peakFrequency)}Hz @ ${(normalizedAmplitude * 100).toFixed(0)}% (need: 35%)`);
      this.lastLogTime = now;
      
      // Visual feedback on indicator
      const indicator = document.getElementById('yjarvis-indicator');
      if (indicator && normalizedAmplitude > 0.25) {
        indicator.style.transform = `scale(${1 + normalizedAmplitude * 0.3})`;
        setTimeout(() => { indicator.style.transform = 'scale(1)'; }, 200);
      }
    }
    
    // Check if we're in cooldown period
    if (now < this.cooldownUntil) {
      this.rafId = requestAnimationFrame(() => this.detectWhistle());
      return;
    }
    
    if (normalizedAmplitude > this.whistleThreshold && 
        peakFrequency >= this.whistleFrequencyMin && 
        peakFrequency <= this.whistleFrequencyMax) {
      
      if (!this.whistleStartTime) {
        this.whistleStartTime = Date.now();
        console.log(`[WhistleDetector] 🎵 Whistle START detected at ${Math.round(peakFrequency)}Hz`);
      } else {
        const duration = Date.now() - this.whistleStartTime;
        if (duration >= this.whistleDuration) {
          console.log(`[WhistleDetector] ✅ WHISTLE CONFIRMED! (${Math.round(peakFrequency)}Hz, ${duration}ms)`);
          this.whistleStartTime = null;
          this.cooldownUntil = now + 3000; // 3 second cooldown
          
          // Trigger the callback
          if (this.onWhistleDetected) {
            this.onWhistleDetected();
          }
        }
      }
    } else {
      if (this.whistleStartTime) {
        console.log(`[WhistleDetector] ⚠️ Whistle lost (was at ${Math.round(peakFrequency)}Hz)`);
      }
      this.whistleStartTime = null;
    }
    
    this.rafId = requestAnimationFrame(() => this.detectWhistle());
  }
}

// ============= Main Content Script =============
console.log('[YJarvis] Loading...');

class YJarvisContent {
  constructor() {
    this.playerController = null;
    this.transcriptExtractor = null;
    this.voiceController = null;
    this.commandProcessor = null;
    this.whistleDetector = null;
    this.currentTranscript = null;
    this.isListening = false;
    this.whistleMode = false;
    
    this.init();
  }

  async init() {
    console.log('[YJarvis] Initializing...');
    
    await this.waitForPlayer();
    
    this.playerController = new PlayerController();
    this.transcriptExtractor = new TranscriptExtractor();
    this.commandProcessor = new CommandProcessor(this.playerController);
    this.voiceController = new VoiceController((command) => this.handleVoiceCommand(command));
    
    // Check if we should auto-play search results
    this.commandProcessor.checkAndAutoPlaySearch();
    
    // Initialize whistle detector with start/stop toggle
    this.whistleDetector = new WhistleDetector(() => {
      if (!this.isListening) {
        // First whistle - START listening
        console.log('[YJarvis] 🎵 Whistle detected! Starting to listen...');
        this.startListening();
      } else {
        // Second whistle - STOP and process command
        console.log('[YJarvis] 🎵 Whistle detected! Processing command...');
        this.stopAndProcessCommand();
      }
    });
    
    this.addControls();
    
    console.log('[YJarvis] ✅ Ready! Click 🎤 to start voice control or 🎵 for whistle mode');
  }

  async waitForPlayer() {
    return new Promise((resolve) => {
      const checkPlayer = () => {
        const video = document.querySelector('video');
        if (video) {
          resolve();
        } else {
          setTimeout(checkPlayer, 500);
        }
      };
      checkPlayer();
    });
  }

  addControls() {
    // Remove existing indicator if any
    const existing = document.getElementById('yjarvis-indicator');
    if (existing) {
      existing.remove();
    }

    // Single status indicator (shows whistle/listening status)
    const indicator = document.createElement('div');
    indicator.id = 'yjarvis-indicator';
    indicator.textContent = '🎵';
    indicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      width: 60px;
      height: 60px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 50%;
      font-size: 28px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 2s infinite;
      pointer-events: auto;
      cursor: pointer;
      transition: transform 0.2s;
    `;
    
    // Make indicator clickable as backup
    indicator.addEventListener('click', () => {
      console.log('[YJarvis] 👆 Indicator clicked - activating voice!');
      this.startListening();
    });
    
    document.body.appendChild(indicator);
    
    // Text label below indicator
    const label = document.createElement('div');
    label.id = 'yjarvis-label';
    label.textContent = 'Whistle to start → Speak → Whistle to execute';
    label.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 20px;
      z-index: 10000;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      pointer-events: none;
      white-space: nowrap;
    `;
    document.body.appendChild(label);
    
    // Add pulse animation CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 0 rgba(102, 126, 234, 0.7); }
        50% { box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 10px rgba(102, 126, 234, 0); }
      }
      @keyframes pulse-listening {
        0%, 100% { box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 0 rgba(234, 67, 53, 0.7); }
        50% { box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 10px rgba(234, 67, 53, 0); }
      }
    `;
    document.head.appendChild(style);
    
    console.log('[YJarvis] ✅ Whistle indicator added!');
    
    // Auto-start whistle detection
    this.whistleDetector.start();
    console.log('[YJarvis] 🎵 Whistle mode AUTO-ENABLED! Just whistle to activate!');
  }

  async startListening() {
    const indicator = document.getElementById('yjarvis-indicator');
    const label = document.getElementById('yjarvis-label');
    
    if (this.isListening) {
      return; // Already listening
    }
    
    // Update label
    if (label) {
      label.textContent = '🎤 Listening... Speak now!';
      label.style.background = 'rgba(234, 67, 53, 0.9)';
    }
    
    // Load transcript if needed (only for video-specific commands)
    if (!this.currentTranscript && window.location.pathname.includes('/watch')) {
      indicator.textContent = '⏳';
      if (label) label.textContent = 'Loading transcript...';
      try {
        this.currentTranscript = await this.transcriptExtractor.extract();
        console.log('[YJarvis] Transcript loaded');
      } catch (error) {
        console.warn('[YJarvis] No transcript available:', error);
        // Continue without transcript - many commands don't need it
      }
    }
    
    // Set up interim result callback to update UI
    this.voiceController.setInterimCallback((transcript) => {
      if (label) {
        label.textContent = `🎤 "${transcript}"`;
        label.style.background = 'rgba(234, 67, 53, 0.9)';
      }
    });
    
    this.voiceController.clearTranscript();
    this.voiceController.start();
    indicator.textContent = '🔴';
    indicator.style.background = '#ea4335';
    indicator.style.animation = 'pulse-listening 1.5s infinite';
    this.isListening = true;
    
    console.log('[YJarvis] 🎤 Listening... (Whistle again to stop & execute)');
  }
  
  async stopAndProcessCommand() {
    const indicator = document.getElementById('yjarvis-indicator');
    const label = document.getElementById('yjarvis-label');
    
    if (!this.isListening) {
      return; // Not listening
    }
    
    // Stop voice recognition
    this.voiceController.stop();
    
    // Get the captured command
    const command = this.voiceController.getLastTranscript();
    
    if (!command || command.trim() === '') {
      console.warn('[YJarvis] No command captured');
      indicator.textContent = '❌';
      indicator.style.background = '#ea4335';
      if (label) {
        label.textContent = '❌ No command heard';
        label.style.background = 'rgba(234, 67, 53, 0.9)';
      }
      
      // Reset after 2 seconds
      setTimeout(() => {
        indicator.textContent = '🎵';
        indicator.style.background = '#667eea';
        indicator.style.animation = 'pulse 2s infinite';
        if (label) {
          label.textContent = 'Whistle to activate';
          label.style.background = 'rgba(0,0,0,0.8)';
        }
      }, 2000);
      
      this.isListening = false;
      return;
    }
    
    console.log('[YJarvis] 🎤 Processing captured command:', command);
    
    indicator.textContent = '⚙️';
    indicator.style.animation = 'none';
    
    if (label) {
      label.textContent = `Processing: "${command}"`;
      label.style.background = 'rgba(255, 165, 0, 0.9)';
    }
    
    this.isListening = false;
    
    // Process the command
    await this.handleVoiceCommand(command);
  }
  
  stopListening() {
    const indicator = document.getElementById('yjarvis-indicator');
    const label = document.getElementById('yjarvis-label');
    
    if (!this.isListening) {
      return; // Not listening
    }
    
    this.voiceController.stop();
    indicator.textContent = '🎵';
    indicator.style.background = '#667eea';
    indicator.style.animation = 'pulse 2s infinite';
    this.isListening = false;
    
    // Update label
    if (label) {
      label.textContent = 'Whistle to activate';
      label.style.background = 'rgba(0,0,0,0.8)';
    }
    
    console.log('[YJarvis] 🎵 Back to whistle mode');
  }

  async handleVoiceCommand(command) {
    console.log('[YJarvis] 🎤 Executing command:', command);
    const indicator = document.getElementById('yjarvis-indicator');
    const label = document.getElementById('yjarvis-label');
    
    try {
      const result = await this.commandProcessor.process(command, this.currentTranscript);
      
      if (result.success) {
        if (result.audioUrl) {
          const audio = new Audio(result.audioUrl);
          audio.play();
        }
        indicator.textContent = '✓';
        indicator.style.background = '#10b981';
        if (label) {
          label.textContent = `✓ ${result.message || 'Success!'}`;
          label.style.background = 'rgba(16, 185, 129, 0.9)';
        }
        setTimeout(() => {
          indicator.textContent = '🎵';
          indicator.style.background = '#667eea';
          indicator.style.animation = 'pulse 2s infinite';
          if (label) {
            label.textContent = 'Whistle to activate';
            label.style.background = 'rgba(0,0,0,0.8)';
          }
        }, 2000);
      } else {
        console.error('[YJarvis] Command failed:', result.error);
        indicator.textContent = '❌';
        indicator.style.background = '#ea4335';
        if (label) {
          label.textContent = `❌ ${result.error || 'Failed'}`;
          label.style.background = 'rgba(234, 67, 53, 0.9)';
        }
        setTimeout(() => {
          indicator.textContent = '🎵';
          indicator.style.background = '#667eea';
          indicator.style.animation = 'pulse 2s infinite';
          if (label) {
            label.textContent = 'Whistle to activate';
            label.style.background = 'rgba(0,0,0,0.8)';
          }
        }, 2000);
      }
    } catch (error) {
      console.error('[YJarvis] Error:', error);
      
      // Check if extension needs reload
      if (error.message && error.message.includes('Extension context invalidated')) {
        indicator.textContent = '🔄';
        if (label) label.textContent = 'Refresh page (F5)';
        console.warn('[YJarvis] ⚠️ Extension was reloaded. Please refresh this page to reconnect.');
      } else {
        indicator.textContent = '❌';
        if (label) label.textContent = '❌ Error occurred';
      }
      
      indicator.style.background = '#ea4335';
      if (label) label.style.background = 'rgba(234, 67, 53, 0.9)';
      
      setTimeout(() => {
        indicator.textContent = '🎵';
        indicator.style.background = '#667eea';
        indicator.style.animation = 'pulse 2s infinite';
        if (label) {
          label.textContent = 'Whistle to activate';
          label.style.background = 'rgba(0,0,0,0.8)';
        }
      }, 3000);
    }
  }
}

// Add pulse animation CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(234, 67, 53, 0.7);
    }
    50% {
      box-shadow: 0 0 0 15px rgba(234, 67, 53, 0);
    }
  }
`;
document.head.appendChild(style);

// Initialize when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new YJarvisContent());
} else {
  new YJarvisContent();
}
