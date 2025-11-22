// Service Worker - AI Processing Engine
import { OpenAIClient } from './openai-client.js';
import { MessageHandler } from './message-handler.js';

class ServiceWorker {
  constructor() {
    this.openAIClient = null;
    this.messageHandler = new MessageHandler(this);
    this.init();
  }

  async init() {
    console.log('[ServiceWorker] Initializing...');
    
    // Load API key from storage
    const { openaiApiKey } = await chrome.storage.local.get('openaiApiKey');
    if (openaiApiKey) {
      this.openAIClient = new OpenAIClient(openaiApiKey);
      console.log('[ServiceWorker] OpenAI client initialized');
    } else {
      console.warn('[ServiceWorker] No API key found. Please set it in the popup.');
    }

    // Set up message listeners
    this.setupMessageListeners();
  }

  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.messageHandler.handle(message, sender, sendResponse);
      return true; // Keep channel open for async response
    });
  }

  // API Key Management
  async setApiKey(apiKey) {
    await chrome.storage.local.set({ openaiApiKey: apiKey });
    this.openAIClient = new OpenAIClient(apiKey);
    console.log('[ServiceWorker] API key updated');
  }

  // AI Processing Methods
  async generateSummary(transcript) {
    if (!this.openAIClient) {
      throw new Error('OpenAI client not initialized. Please set API key.');
    }
    return await this.openAIClient.generateSummary(transcript);
  }

  async generateQuiz(transcript) {
    if (!this.openAIClient) {
      throw new Error('OpenAI client not initialized. Please set API key.');
    }
    return await this.openAIClient.generateQuiz(transcript);
  }

  async generateTTS(text) {
    if (!this.openAIClient) {
      throw new Error('OpenAI client not initialized. Please set API key.');
    }
    return await this.openAIClient.generateTTS(text);
  }

  async processVoiceCommand(command, transcript) {
    if (!this.openAIClient) {
      throw new Error('OpenAI client not initialized. Please set API key.');
    }
    return await this.openAIClient.processCommand(command, transcript);
  }
}

// Initialize service worker
const serviceWorker = new ServiceWorker();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ServiceWorker };
}
