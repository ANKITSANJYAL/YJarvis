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
    
    // Configuration for whistle-to-start, whistle-to-stop mode
    this.recognition.continuous = true; // Continuous until second whistle
    this.recognition.interimResults = true; // Show interim results
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;
    
    this.lastTranscript = '';

    // Event handlers
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
  
  setInterimCallback(callback) {
    this.onInterimCallback = callback;
  }
  
  getLastTranscript() {
    return this.lastTranscript;
  }
  
  clearTranscript() {
    this.lastTranscript = '';
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VoiceController };
}
