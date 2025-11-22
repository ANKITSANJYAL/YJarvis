// Message Handler - Routes messages between components
export class MessageHandler {
  constructor(serviceWorker) {
    this.serviceWorker = serviceWorker;
  }

  async handle(message, sender, sendResponse) {
    console.log('[MessageHandler] Received:', message.type);

    try {
      switch (message.type) {
        case 'SET_API_KEY':
          await this.handleSetApiKey(message, sendResponse);
          break;

        case 'GENERATE_SUMMARY':
          await this.handleGenerateSummary(message, sendResponse);
          break;

        case 'GENERATE_QUIZ':
          await this.handleGenerateQuiz(message, sendResponse);
          break;

        case 'GENERATE_TTS':
          await this.handleGenerateTTS(message, sendResponse);
          break;

        case 'PROCESS_COMMAND':
          await this.handleProcessCommand(message, sendResponse);
          break;

        case 'GET_API_KEY_STATUS':
          await this.handleGetApiKeyStatus(message, sendResponse);
          break;

        default:
          sendResponse({ 
            success: false, 
            error: `Unknown message type: ${message.type}` 
          });
      }
    } catch (error) {
      console.error('[MessageHandler] Error:', error);
      sendResponse({ 
        success: false, 
        error: error.message 
      });
    }
  }

  async handleSetApiKey(message, sendResponse) {
    await this.serviceWorker.setApiKey(message.apiKey);
    sendResponse({ success: true });
  }

  async handleGenerateSummary(message, sendResponse) {
    const summary = await this.serviceWorker.generateSummary(message.transcript);
    sendResponse({ success: true, data: summary });
  }

  async handleGenerateQuiz(message, sendResponse) {
    const quiz = await this.serviceWorker.generateQuiz(message.transcript);
    sendResponse({ success: true, data: quiz });
  }

  async handleGenerateTTS(message, sendResponse) {
    const audioUrl = await this.serviceWorker.generateTTS(message.text);
    sendResponse({ success: true, data: audioUrl });
  }

  async handleProcessCommand(message, sendResponse) {
    const answer = await this.serviceWorker.processVoiceCommand(
      message.command, 
      message.transcript
    );
    sendResponse({ success: true, data: answer });
  }

  async handleGetApiKeyStatus(message, sendResponse) {
    const hasApiKey = this.serviceWorker.openAIClient !== null;
    sendResponse({ success: true, hasApiKey });
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MessageHandler };
}
