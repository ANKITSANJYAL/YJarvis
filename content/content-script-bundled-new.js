// Player Controller - Direct video control
export class PlayerController {
  constructor() {
    this.video = document.querySelector('video');
    if (!this.video) {
      throw new Error('Video element not found');
    }
    console.log('[PlayerController] Initialized');
  }

  // Playback controls
  play() {
    this.video.play();
    console.log('[PlayerController] Play');
    return true;
  }

  pause() {
    this.video.pause();
    console.log('[PlayerController] Pause');
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

  // Time controls
  getCurrentTime() {
    return this.video.currentTime;
  }

  getDuration() {
    return this.video.duration;
  }

  seek(seconds) {
    this.video.currentTime = Math.max(0, Math.min(seconds, this.video.duration));
    console.log('[PlayerController] Seek to', seconds);
    return true;
  }

  skip(seconds) {
    const newTime = this.video.currentTime + seconds;
    this.seek(newTime);
    console.log('[PlayerController] Skip', seconds);
    return true;
  }

  rewind(seconds) {
    this.skip(-seconds);
    console.log('[PlayerController] Rewind', seconds);
    return true;
  }

  // Speed controls
  getPlaybackRate() {
    return this.video.playbackRate;
  }

  setPlaybackRate(rate) {
    this.video.playbackRate = Math.max(0.25, Math.min(2.0, rate));
    console.log('[PlayerController] Speed set to', rate);
    return true;
  }

  increaseSpeed() {
    const newRate = Math.min(2.0, this.video.playbackRate + 0.25);
    this.setPlaybackRate(newRate);
    return newRate;
  }

  decreaseSpeed() {
    const newRate = Math.max(0.25, this.video.playbackRate - 0.25);
    this.setPlaybackRate(newRate);
    return newRate;
  }

  normalSpeed() {
    this.setPlaybackRate(1.0);
    return true;
  }

  // Volume controls
  getVolume() {
    return this.video.volume;
  }

  setVolume(volume) {
    this.video.volume = Math.max(0, Math.min(1, volume));
    console.log('[PlayerController] Volume set to', volume);
    return true;
  }

  mute() {
    this.video.muted = true;
    console.log('[PlayerController] Muted');
    return true;
  }

  unmute() {
    this.video.muted = false;
    console.log('[PlayerController] Unmuted');
    return true;
  }

  // Utility
  isPlaying() {
    return !this.video.paused;
  }

  isMuted() {
    return this.video.muted;
  }

  getStatus() {
    return {
      playing: this.isPlaying(),
      currentTime: this.getCurrentTime(),
      duration: this.getDuration(),
      playbackRate: this.getPlaybackRate(),
      volume: this.getVolume(),
      muted: this.isMuted()
    };
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PlayerController };
}
// Transcript Extractor - YouTube transcript extraction
export class TranscriptExtractor {
  constructor() {
    console.log('[TranscriptExtractor] Initialized');
  }

  async extract() {
    console.log('[TranscriptExtractor] Extracting transcript...');
    const startTime = performance.now();

    try {
      // Method 1: Try to open transcript panel and extract
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
    // Click the "Show transcript" button if not already open
    const transcriptButton = await this.findTranscriptButton();
    
    if (transcriptButton) {
      transcriptButton.click();
      console.log('[TranscriptExtractor] Opened transcript panel');
      
      // Wait for panel to load
      await this.waitForTranscriptPanel();
    }

    // Extract text from transcript panel
    const transcriptText = this.extractTextFromPanel();
    return transcriptText;
  }

  async findTranscriptButton() {
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Look for transcript button in various selectors
    const selectors = [
      'button[aria-label*="transcript" i]',
      'button[aria-label*="Show transcript" i]',
      'yt-formatted-string:contains("Transcript")',
      '#description button[aria-label*="transcript" i]'
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        if (element.textContent.toLowerCase().includes('transcript') || 
            element.getAttribute('aria-label')?.toLowerCase().includes('transcript')) {
          return element;
        }
      }
    }

    // Check if panel is already open
    const panel = document.querySelector('ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-transcript"]');
    if (panel) {
      console.log('[TranscriptExtractor] Transcript panel already open');
      return null;
    }

    throw new Error('Transcript button not found');
  }

  async waitForTranscriptPanel() {
    const maxWait = 5000; // 5 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      const panel = document.querySelector('ytd-transcript-segment-renderer');
      if (panel) {
        // Wait a bit more for all segments to load
        await new Promise(resolve => setTimeout(resolve, 500));
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    throw new Error('Transcript panel did not load');
  }

  extractTextFromPanel() {
    // Get all transcript segments
    const segments = document.querySelectorAll('ytd-transcript-segment-renderer');
    
    if (segments.length === 0) {
      throw new Error('No transcript segments found');
    }

    // Extract text from each segment
    const transcriptParts = [];
    segments.forEach(segment => {
      const textElement = segment.querySelector('yt-formatted-string.segment-text');
      if (textElement) {
        transcriptParts.push(textElement.textContent.trim());
      }
    });

    // Join all parts
    const fullTranscript = transcriptParts.join(' ');
    
    if (fullTranscript.length === 0) {
      throw new Error('Transcript is empty');
    }

    return fullTranscript;
  }

  // Helper: Close transcript panel
  closePanel() {
    const closeButton = document.querySelector('ytd-engagement-panel-title-header-renderer button[aria-label*="Close" i]');
    if (closeButton) {
      closeButton.click();
      console.log('[TranscriptExtractor] Closed transcript panel');
    }
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TranscriptExtractor };
}
// Voice Controller - Web Speech API integration
export class VoiceController {
  constructor(onCommandCallback) {
    this.onCommandCallback = onCommandCallback;
    this.recognition = null;
    this.isListening = false;
    
    this.initRecognition();
  }

  initRecognition() {
    // Check for Web Speech API support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('[VoiceController] Web Speech API not supported');
      throw new Error('Voice recognition not supported in this browser');
    }

    this.recognition = new SpeechRecognition();
    
    // Configuration for optimal performance
    this.recognition.continuous = true; // Keep listening
    this.recognition.interimResults = false; // Only final results for speed
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1; // Single best result for speed

    // Event handlers
    this.recognition.onstart = () => {
      console.log('[VoiceController] Started listening');
      this.isListening = true;
    };

    this.recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        const command = lastResult[0].transcript.trim();
        console.log('[VoiceController] Recognized:', command);
        
        // Call callback with command
        if (this.onCommandCallback) {
          this.onCommandCallback(command);
        }
      }
    };

    this.recognition.onerror = (event) => {
      console.error('[VoiceController] Error:', event.error);
      
      // Auto-restart on some errors
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        console.log('[VoiceController] Auto-restarting...');
        setTimeout(() => {
          if (this.isListening) {
            this.recognition.start();
          }
        }, 1000);
      }
    };

    this.recognition.onend = () => {
      console.log('[VoiceController] Stopped listening');
      
      // Auto-restart if still supposed to be listening
      if (this.isListening) {
        console.log('[VoiceController] Auto-restarting...');
        try {
          this.recognition.start();
        } catch (error) {
          console.error('[VoiceController] Restart failed:', error);
        }
      }
    };

    console.log('[VoiceController] Initialized');
  }

  start() {
    if (this.isListening) {
      console.log('[VoiceController] Already listening');
      return;
    }

    try {
      this.isListening = true;
      this.recognition.start();
      console.log('[VoiceController] Starting...');
    } catch (error) {
      console.error('[VoiceController] Start failed:', error);
      this.isListening = false;
    }
  }

  stop() {
    if (!this.isListening) {
      console.log('[VoiceController] Not listening');
      return;
    }

    try {
      this.isListening = false;
      this.recognition.stop();
      console.log('[VoiceController] Stopping...');
    } catch (error) {
      console.error('[VoiceController] Stop failed:', error);
    }
  }

  isActive() {
    return this.isListening;
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VoiceController };
}
// Command Processor - Maps voice commands to actions
export class CommandProcessor {
  constructor(playerController) {
    this.playerController = playerController;
    this.commandPatterns = this.initCommandPatterns();
    console.log('[CommandProcessor] Initialized');
  }

  initCommandPatterns() {
    return [
      // Playback controls
      { pattern: /^(play|resume|start)$/i, action: 'play' },
      { pattern: /^(pause|stop|wait)$/i, action: 'pause' },
      { pattern: /^(play|pause|toggle)$/i, action: 'toggle' },

      // Time navigation
      { pattern: /^skip (\d+) seconds?$/i, action: 'skip', param: 1 },
      { pattern: /^skip (\d+)$/i, action: 'skip', param: 1 },
      { pattern: /^forward (\d+)$/i, action: 'skip', param: 1 },
      { pattern: /^rewind (\d+) seconds?$/i, action: 'rewind', param: 1 },
      { pattern: /^rewind (\d+)$/i, action: 'rewind', param: 1 },
      { pattern: /^back (\d+)$/i, action: 'rewind', param: 1 },
      { pattern: /^go to (\d+)$/i, action: 'seek', param: 1 },

      // Speed controls
      { pattern: /^speed up$/i, action: 'speedUp' },
      { pattern: /^slow down$/i, action: 'slowDown' },
      { pattern: /^normal speed$/i, action: 'normalSpeed' },
      { pattern: /^set speed to ([\d.]+)$/i, action: 'setSpeed', param: 1 },

      // Volume controls
      { pattern: /^mute$/i, action: 'mute' },
      { pattern: /^unmute$/i, action: 'unmute' },
      { pattern: /^volume (\d+)$/i, action: 'setVolume', param: 1 },

      // AI features
      { pattern: /^summarize$/i, action: 'summarize' },
      { pattern: /^summary$/i, action: 'summarize' },
      { pattern: /^give me a summary$/i, action: 'summarize' },
      { pattern: /^quiz$/i, action: 'quiz' },
      { pattern: /^test me$/i, action: 'quiz' },
      { pattern: /^give me a quiz$/i, action: 'quiz' },
      
      // Search/Play patterns - intelligent agent behavior
      { pattern: /^play\s+(?:a\s+)?video\s+(?:on|about)\s+(.+)$/i, action: 'searchAndPlay', param: 1 },
      { pattern: /^show\s+me\s+(?:a\s+)?video\s+(?:on|about)\s+(.+)$/i, action: 'searchAndPlay', param: 1 },
      { pattern: /^find\s+(?:a\s+)?video\s+(?:on|about)\s+(.+)$/i, action: 'searchAndPlay', param: 1 },
      { pattern: /^search\s+(?:for\s+)?(.+)$/i, action: 'searchAndPlay', param: 1 }
    ];
  }

  async process(command, transcript) {
    const startTime = performance.now();
    console.log('[CommandProcessor] Processing:', command);

    try {
      // Try to match command to pattern
      const match = this.matchCommand(command);

      if (match) {
        const result = await this.executeAction(match, transcript);
        const duration = performance.now() - startTime;
        console.log(`[CommandProcessor] Executed in ${duration.toFixed(0)}ms`);
        return result;
      }

      // If no pattern match, treat as AI query
      return await this.handleAIQuery(command, transcript);

    } catch (error) {
      console.error('[CommandProcessor] Error:', error);
      return { success: false, error: error.message };
    }
  }

  matchCommand(command) {
    const normalizedCommand = command.toLowerCase().trim();

    for (const pattern of this.commandPatterns) {
      const match = normalizedCommand.match(pattern.pattern);
      if (match) {
        return {
          action: pattern.action,
          param: pattern.param ? match[pattern.param] : null,
          original: command
        };
      }
    }

    return null;
  }

  async executeAction(match, transcript) {
    const { action, param } = match;

    switch (action) {
      // Playback
      case 'play':
        this.playerController.play();
        return { success: true, message: 'Playing' };

      case 'pause':
        this.playerController.pause();
        return { success: true, message: 'Paused' };

      case 'toggle':
        this.playerController.togglePlayPause();
        return { success: true, message: 'Toggled playback' };

      // Time
      case 'skip':
        this.playerController.skip(parseInt(param));
        return { success: true, message: `Skipped ${param} seconds` };

      case 'rewind':
        this.playerController.rewind(parseInt(param));
        return { success: true, message: `Rewound ${param} seconds` };

      case 'seek':
        this.playerController.seek(parseInt(param));
        return { success: true, message: `Jumped to ${param} seconds` };

      // Speed
      case 'speedUp':
        const newSpeed = this.playerController.increaseSpeed();
        return { success: true, message: `Speed: ${newSpeed}x` };

      case 'slowDown':
        const slowSpeed = this.playerController.decreaseSpeed();
        return { success: true, message: `Speed: ${slowSpeed}x` };

      case 'normalSpeed':
        this.playerController.normalSpeed();
        return { success: true, message: 'Normal speed' };

      case 'setSpeed':
        this.playerController.setPlaybackRate(parseFloat(param));
        return { success: true, message: `Speed: ${param}x` };

      // Volume
      case 'mute':
        this.playerController.mute();
        return { success: true, message: 'Muted' };

      case 'unmute':
        this.playerController.unmute();
        return { success: true, message: 'Unmuted' };

      case 'setVolume':
        this.playerController.setVolume(parseInt(param) / 100);
        return { success: true, message: `Volume: ${param}%` };

      // AI features
      case 'summarize':
        return await this.handleSummarize(transcript);

      case 'quiz':
        return await this.handleQuiz(transcript);
      
      // Intelligent search and play
      case 'searchAndPlay':
        return await this.handleSearchAndPlay(param);

      default:
        return { success: false, error: 'Unknown action' };
    }
  }

  async handleSummarize(transcript) {
    console.log('[CommandProcessor] Generating summary...');
    
    const response = await chrome.runtime.sendMessage({
      type: 'GENERATE_SUMMARY',
      transcript: transcript
    });

    if (response.success) {
      // Generate TTS for summary
      const ttsResponse = await chrome.runtime.sendMessage({
        type: 'GENERATE_TTS',
        text: response.data
      });

      return {
        success: true,
        message: response.data,
        audioUrl: ttsResponse.success ? ttsResponse.data : null
      };
    }

    return response;
  }

  async handleQuiz(transcript) {
    console.log('[CommandProcessor] Generating quiz...');
    
    const response = await chrome.runtime.sendMessage({
      type: 'GENERATE_QUIZ',
      transcript: transcript
    });

    if (response.success) {
      const quiz = response.data;
      const firstQuestion = quiz.questions[0];
      
      // Read first question
      const questionText = `Here's your first question: ${firstQuestion.question}. ${firstQuestion.options.join(', ')}`;
      
      const ttsResponse = await chrome.runtime.sendMessage({
        type: 'GENERATE_TTS',
        text: questionText
      });

      return {
        success: true,
        message: quiz,
        audioUrl: ttsResponse.success ? ttsResponse.data : null
      };
    }

    return response;
  }

  async handleSearchAndPlay(searchQuery) {
    console.log('[CommandProcessor] Intelligent search and play:', searchQuery);
    
    try {
      // Navigate to YouTube search
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
      window.location.href = searchUrl;
      
      // Wait for search results to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Find and click the first video result
      await this.clickFirstVideo();
      
      return { 
        success: true, 
        message: `Playing top result for: ${searchQuery}` 
      };
    } catch (error) {
      console.error('[CommandProcessor] Search and play failed:', error);
      return { 
        success: false, 
        error: `Could not find video for: ${searchQuery}` 
      };
    }
  }
  
  async clickFirstVideo() {
    return new Promise((resolve, reject) => {
      const maxAttempts = 10;
      let attempts = 0;
      
      const findAndClick = () => {
        attempts++;
        
        // Try multiple selectors for video results
        const selectors = [
          'ytd-video-renderer a#video-title',
          'ytd-video-renderer h3 a',
          'a#video-title',
          '.ytd-video-renderer a'
        ];
        
        for (const selector of selectors) {
          const videoLink = document.querySelector(selector);
          if (videoLink && videoLink.href && videoLink.href.includes('/watch?v=')) {
            console.log('[CommandProcessor] Found first video, navigating...');
            videoLink.click();
            resolve();
            return;
          }
        }
        
        if (attempts >= maxAttempts) {
          reject(new Error('Could not find video after ' + maxAttempts + ' attempts'));
          return;
        }
        
        // Try again after a short delay
        setTimeout(findAndClick, 300);
      };
      
      findAndClick();
    });
  }

  async handleAIQuery(command, transcript) {
    console.log('[CommandProcessor] AI query:', command);
    
    // Check if this might be a search request
    const searchIndicators = ['video', 'play', 'show', 'find', 'watch'];
    const lowerCommand = command.toLowerCase();
    const mightBeSearch = searchIndicators.some(indicator => lowerCommand.includes(indicator));
    
    if (mightBeSearch && !window.location.pathname.includes('/watch')) {
      // This looks like a search request, route to searchAndPlay
      return await this.handleSearchAndPlay(command);
    }
    
    const response = await chrome.runtime.sendMessage({
      type: 'PROCESS_COMMAND',
      command: command,
      transcript: transcript
    });

    if (response.success) {
      // Generate TTS for answer
      const ttsResponse = await chrome.runtime.sendMessage({
        type: 'GENERATE_TTS',
        text: response.data
      });

      return {
        success: true,
        message: response.data,
        audioUrl: ttsResponse.success ? ttsResponse.data : null
      };
    }

    return response;
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CommandProcessor };
}
// Content Script - YouTube Page Integration
import { PlayerController } from './player-controller.js';
import { TranscriptExtractor } from './transcript-extractor.js';
import { VoiceController } from './voice-controller.js';
import { CommandProcessor } from './command-processor.js';

class ContentScript {
  constructor() {
    this.playerController = null;
    this.transcriptExtractor = null;
    this.voiceController = null;
    this.commandProcessor = null;
    this.currentTranscript = null;
    this.isListening = false;
    
    this.init();
  }

  async init() {
    console.log('[ContentScript] Initializing on YouTube...');
    
    // Wait for YouTube player to be ready
    await this.waitForPlayer();
    
    // Initialize components
    this.playerController = new PlayerController();
    this.transcriptExtractor = new TranscriptExtractor();
    this.commandProcessor = new CommandProcessor(this.playerController);
    this.voiceController = new VoiceController((command) => this.handleVoiceCommand(command));
    
    // Add UI controls
    this.addControls();
    
    console.log('[ContentScript] Ready!');
  }

  async waitForPlayer() {
    return new Promise((resolve) => {
      const checkPlayer = () => {
        const video = document.querySelector('video');
        if (video) {
          console.log('[ContentScript] Player found');
          resolve();
        } else {
          setTimeout(checkPlayer, 500);
        }
      };
      checkPlayer();
    });
  }

  addControls() {
    // Create floating control button
    const controlBtn = document.createElement('button');
    controlBtn.id = 'yjarvis-control';
    controlBtn.innerHTML = '🎤 YJarvis';
    controlBtn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      padding: 12px 20px;
      background: #1a73e8;
      color: white;
      border: none;
      border-radius: 24px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      transition: all 0.2s;
    `;
    
    controlBtn.addEventListener('click', () => this.toggleVoiceControl());
    controlBtn.addEventListener('mouseenter', () => {
      controlBtn.style.transform = 'scale(1.05)';
    });
    controlBtn.addEventListener('mouseleave', () => {
      controlBtn.style.transform = 'scale(1)';
    });
    
    document.body.appendChild(controlBtn);
  }

  async toggleVoiceControl() {
    const btn = document.getElementById('yjarvis-control');
    
    if (this.isListening) {
      this.voiceController.stop();
      btn.innerHTML = '🎤 YJarvis';
      btn.style.background = '#1a73e8';
      this.isListening = false;
    } else {
      // Extract transcript if not already done
      if (!this.currentTranscript) {
        btn.innerHTML = '⏳ Loading transcript...';
        try {
          this.currentTranscript = await this.transcriptExtractor.extract();
          console.log('[ContentScript] Transcript loaded:', this.currentTranscript.substring(0, 100) + '...');
        } catch (error) {
          console.error('[ContentScript] Failed to load transcript:', error);
          btn.innerHTML = '❌ No transcript';
          setTimeout(() => {
            btn.innerHTML = '🎤 YJarvis';
          }, 2000);
          return;
        }
      }
      
      this.voiceController.start();
      btn.innerHTML = '🔴 Listening...';
      btn.style.background = '#ea4335';
      this.isListening = true;
    }
  }

  async handleVoiceCommand(command) {
    console.log('[ContentScript] Voice command:', command);
    const btn = document.getElementById('yjarvis-control');
    btn.innerHTML = '⚙️ Processing...';
    
    const result = await this.commandProcessor.process(command, this.currentTranscript);
    
    if (result.success) {
      if (result.audioUrl) {
        // Play TTS response
        const audio = new Audio(result.audioUrl);
        audio.play();
      }
      btn.innerHTML = '✓ Done!';
      setTimeout(() => {
        btn.innerHTML = '🔴 Listening...';
      }, 1500);
    } else {
      btn.innerHTML = '❌ Error';
      setTimeout(() => {
        btn.innerHTML = '🔴 Listening...';
      }, 1500);
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ContentScript());
} else {
  new ContentScript();
}
