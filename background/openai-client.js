// OpenAI API Client - Optimized for low latency
export class OpenAIClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.openai.com/v1';
    this.model = 'gpt-4o-mini'; // Fast, cost-effective
    this.ttsModel = 'tts-1'; // Low latency TTS
    this.maxRetries = 3;
  }

  // Exponential backoff retry logic
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
        const delay = Math.pow(2, retries) * 1000; // Exponential backoff
        console.log(`[OpenAI] Retry ${retries + 1}/${this.maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, options, retries + 1);
      }
      throw error;
    }
  }

  // Generate summary from transcript
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
          temperature: 0.3, // Lower for more focused output
          max_tokens: 300 // Limit for speed
        })
      }
    );

    const data = await response.json();
    const summary = data.choices[0].message.content;
    
    const duration = performance.now() - startTime;
    console.log(`[OpenAI] Summary generated in ${duration.toFixed(0)}ms`);
    
    return summary;
  }

  // Generate quiz with structured output
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

  // Generate TTS audio
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
          voice: 'alloy', // Fast, neutral voice
          response_format: 'mp3', // Good balance of quality and size
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

  // Process natural language commands
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
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OpenAIClient };
}
