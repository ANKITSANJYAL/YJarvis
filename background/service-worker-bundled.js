// Service Worker - Bundled (All in one file for Chrome Extension)

// ============= OpenAI Client =============
class OpenAIClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.openai.com/v1';
    this.model = 'gpt-4o-mini';
    this.ttsModel = 'tts-1';
    this.maxRetries = 3;
  }

  async fetchWithRetry(url, options, retries = 0) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`API Error: ${response.status} - ${JSON.stringify(error)}`);
      }
      
      return response;
    } catch (error) {
      if (retries < this.maxRetries) {
        const delay = Math.pow(2, retries) * 1000;
        console.log(`[OpenAI] Retry ${retries + 1}/${this.maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, options, retries + 1);
      }
      throw error;
    }
  }

  async generateSummary(transcript) {
    const startTime = performance.now();
    console.log('[OpenAI] Generating summary...');

    const response = await this.fetchWithRetry(
      `${this.baseURL}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a concise summarization assistant. Provide clear, structured summaries with key points. Keep it brief but informative.'
            },
            {
              role: 'user',
              content: `Summarize this video transcript in 3-5 key points:\n\n${transcript}`
            }
          ],
          temperature: 0.3,
          max_tokens: 300
        })
      }
    );

    const data = await response.json();
    const summary = data.choices[0].message.content;
    
    const duration = performance.now() - startTime;
    console.log(`[OpenAI] Summary generated in ${duration.toFixed(0)}ms`);
    
    return summary;
  }

  async generateQuiz(transcript) {
    const startTime = performance.now();
    console.log('[OpenAI] Generating quiz...');

    const response = await this.fetchWithRetry(
      `${this.baseURL}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a quiz generator. Create multiple-choice questions based on video content.'
            },
            {
              role: 'user',
              content: `Generate 3 multiple-choice questions from this transcript. Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0
    }
  ]
}

Transcript: ${transcript}`
            }
          ],
          temperature: 0.5,
          max_tokens: 500,
          response_format: { type: "json_object" }
        })
      }
    );

    const data = await response.json();
    const quiz = JSON.parse(data.choices[0].message.content);
    
    const duration = performance.now() - startTime;
    console.log(`[OpenAI] Quiz generated in ${duration.toFixed(0)}ms`);
    
    return quiz;
  }

  async generateTTS(text) {
    const startTime = performance.now();
    console.log('[OpenAI] Generating TTS audio...');

    const response = await this.fetchWithRetry(
      `${this.baseURL}/audio/speech`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.ttsModel,
          input: text,
          voice: 'alloy',
          response_format: 'mp3',
          speed: 1.0
        })
      }
    );

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    const duration = performance.now() - startTime;
    console.log(`[OpenAI] TTS generated in ${duration.toFixed(0)}ms`);
    
    return audioUrl;
  }

  async processCommand(command, transcript) {
    const startTime = performance.now();
    console.log('[OpenAI] Processing command:', command);

    const response = await this.fetchWithRetry(
      `${this.baseURL}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful video assistant. Answer questions about the video concisely based on the transcript.'
            },
            {
              role: 'user',
              content: `Video transcript: ${transcript}\n\nUser question: ${command}\n\nProvide a brief, helpful answer.`
            }
          ],
          temperature: 0.7,
          max_tokens: 150
        })
      }
    );

    const data = await response.json();
    const answer = data.choices[0].message.content;
    
    const duration = performance.now() - startTime;
    console.log(`[OpenAI] Command processed in ${duration.toFixed(0)}ms`);
    
    return answer;
  }

  async semanticMatchCommand(command, availableActions) {
    const startTime = performance.now();
    console.log('[OpenAI] 🧠 Semantic command matching:', command);

    const actionsDescription = Object.entries(availableActions)
      .map(([action, description]) => `- ${action}: ${description}`)
      .join('\n');

    const response = await this.fetchWithRetry(
      `${this.baseURL}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: `You are a command interpreter for a YouTube video player. Your job is to understand natural language commands and map them to specific actions.

Available actions:
${actionsDescription}

Analyze the user's command and return a JSON object with:
- "action": the matching action name (or "query" if it's a question/conversation)
- "param": extracted number if the action needs it. For time-based: seconds. For speed/volume: percentage or null for increment.
- "confidence": how confident you are (0-1)

Examples:
"pause the video" → {"action": "pause", "param": null, "confidence": 0.95}
"take me back 30 seconds" → {"action": "rewind", "param": 30, "confidence": 0.9}
"skip ahead 10 seconds" → {"action": "skip", "param": 10, "confidence": 0.9}
"increase speed by 50%" → {"action": "speedUp", "param": 50, "confidence": 0.9}
"increase speed by 100%" → {"action": "speedUp", "param": 100, "confidence": 0.95}
"speed up" → {"action": "speedUp", "param": null, "confidence": 0.9}
"make it 2x faster" → {"action": "speedUp", "param": 100, "confidence": 0.9}
"make it louder" → {"action": "increaseVolume", "param": null, "confidence": 0.85}
"increase volume by 20" → {"action": "increaseVolume", "param": 20, "confidence": 0.9}
"set volume to 50" → {"action": "setVolume", "param": 50, "confidence": 0.95}
"decrease volume" → {"action": "decreaseVolume", "param": null, "confidence": 0.85}
"what is this video about?" → {"action": "query", "param": null, "confidence": 0.95}

Be flexible with phrasing but confident in your interpretation. Return ONLY valid JSON.`
            },
            {
              role: 'user',
              content: command
            }
          ],
          temperature: 0.1,
          max_tokens: 50,
          response_format: { type: "json_object" }
        })
      }
    );

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    const duration = performance.now() - startTime;
    console.log(`[OpenAI] Semantic match completed in ${duration.toFixed(0)}ms:`, result);
    
    return result;
  }
}

// ============= Service Worker =============
class YJarvisServiceWorker {
  constructor() {
    this.openAIClient = null;
    this.init();
  }

  async init() {
    console.log('[ServiceWorker] Initializing...');
    
    const { openaiApiKey } = await chrome.storage.local.get('openaiApiKey');
    if (openaiApiKey) {
      this.openAIClient = new OpenAIClient(openaiApiKey);
      console.log('[ServiceWorker] OpenAI client initialized');
    } else {
      console.warn('[ServiceWorker] No API key found');
    }

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true;
    });
  }

  async handleMessage(message, sender, sendResponse) {
    console.log('[ServiceWorker] Received:', message.type);

    // Wrap in promise to handle async properly
    (async () => {
      try {
        switch (message.type) {
          case 'SET_API_KEY':
            await chrome.storage.local.set({ openaiApiKey: message.apiKey });
            this.openAIClient = new OpenAIClient(message.apiKey);
            sendResponse({ success: true });
            break;

          case 'GENERATE_SUMMARY':
            if (!this.openAIClient) {
              sendResponse({ success: false, error: 'API key not set' });
              break;
            }
            const summary = await this.openAIClient.generateSummary(message.transcript);
            sendResponse({ success: true, data: summary });
            break;

          case 'GENERATE_QUIZ':
            if (!this.openAIClient) {
              sendResponse({ success: false, error: 'API key not set' });
              break;
            }
            const quiz = await this.openAIClient.generateQuiz(message.transcript);
            sendResponse({ success: true, data: quiz });
            break;

          case 'GENERATE_TTS':
            if (!this.openAIClient) {
              sendResponse({ success: false, error: 'API key not set' });
              break;
            }
            const audioUrl = await this.openAIClient.generateTTS(message.text);
            sendResponse({ success: true, data: audioUrl });
            break;

          case 'PROCESS_COMMAND':
            if (!this.openAIClient) {
              sendResponse({ success: false, error: 'API key not set' });
              break;
            }
            const answer = await this.openAIClient.processCommand(message.command, message.transcript);
            sendResponse({ success: true, data: answer });
            break;

          case 'semanticMatch':
            if (!this.openAIClient) {
              sendResponse({ error: 'API key not set', match: null });
              break;
            }
            const matchResult = await this.openAIClient.semanticMatchCommand(
              message.command, 
              message.availableActions
            );
            sendResponse({ match: matchResult });
            break;

          case 'GET_API_KEY_STATUS':
            sendResponse({ success: true, hasApiKey: this.openAIClient !== null });
            break;

          default:
            sendResponse({ success: false, error: `Unknown message type: ${message.type}` });
        }
      } catch (error) {
        console.error('[ServiceWorker] Error:', error);
        sendResponse({ success: false, error: error.message });
      }
    })();
  }
}

// Initialize
new YJarvisServiceWorker();
