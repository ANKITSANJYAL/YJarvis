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
