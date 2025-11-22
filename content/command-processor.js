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
      { pattern: /^give me a quiz$/i, action: 'quiz' }
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

  async handleAIQuery(command, transcript) {
    console.log('[CommandProcessor] AI query:', command);
    
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
