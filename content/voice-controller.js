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
