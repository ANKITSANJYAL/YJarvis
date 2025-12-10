import { apiKeyManager } from './apiKeyManager';
import { quotaManager } from './quotaManager';
import { JARVIS_PERSONALITY, CONVERSATION_PROMPT } from '../constants/prompts';
import { CONFIG } from '../constants/config';
import { logger } from '../utils/logger';

export interface AIOptions {
  system?: string;
  temperature?: number;
  maxTokens?: number;
}

const conversationContext: string[] = [];
const MAX_CONTEXT = 5;

export const aiService = {
  async prompt(text: string, options: AIOptions = {}): Promise<string> {
    if (!quotaManager.canConsume(1)) {
      logger.warn('Rate limit exceeded');
      throw new Error('Rate limit exceeded');
    }
    
    const key = await apiKeyManager.getKey();
    if (!key) {
      logger.error('Missing OpenAI API key');
      throw new Error('Missing OpenAI API key');
    }
    
    // Use personality if no custom system prompt
    const system = options.system ?? JARVIS_PERSONALITY;
    const temperature = options.temperature ?? CONFIG.OPENAI_TEMPERATURE;
    const maxTokens = options.maxTokens ?? CONFIG.OPENAI_MAX_TOKENS;
    
    quotaManager.consume(1);
    
    const attempt = async (): Promise<Response> => {
      logger.debug('Making OpenAI API request', { model: CONFIG.OPENAI_MODEL });
      
      return fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: CONFIG.OPENAI_MODEL,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: text },
          ],
          temperature,
          max_tokens: maxTokens,
        }),
      });
    };
    
    // Retry with exponential backoff up to 3 attempts
    let resp: Response | null = null;
    for (let i = 0; i < CONFIG.MAX_RETRY_ATTEMPTS; i++) {
      try {
        resp = await attempt();
        if (resp.ok) break;
        
        logger.warn(`API attempt ${i + 1} failed`, { status: resp.status });
      } catch (error) {
        logger.warn(`API attempt ${i + 1} network error`, { error });
      }
      
      if (i < CONFIG.MAX_RETRY_ATTEMPTS - 1) {
        await new Promise((r) => setTimeout(r, CONFIG.RETRY_BACKOFF_MS * Math.pow(CONFIG.RETRY_BACKOFF_MULTIPLIER, i)));
      }
    }
    
    if (!resp || !resp.ok) {
      // Offline queue: store last request to retry later
      const queue = (await chrome.storage.local.get(['AI_QUEUE'])).AI_QUEUE as string[] | undefined;
      const nextQueue = [...(queue ?? []), text].slice(-50);
      await chrome.storage.local.set({ AI_QUEUE: nextQueue });
      
      const body = resp ? await resp.text() : 'offline/failed';
      logger.error('OpenAI API error', { body });
      throw new Error(`OpenAI error: ${body}`);
    }
    
    const data = (await resp.json()) as { 
      choices: Array<{ message: { content: string } }>;
      usage?: { total_tokens: number };
    };
    
    const content = data.choices?.[0]?.message?.content?.trim() ?? '';
    
    if (data.usage) {
      logger.info('API request completed', { tokens: data.usage.total_tokens });
    }
    
    // Maintain conversation context
    conversationContext.push(`User: ${text}`);
    conversationContext.push(`Jarvis: ${content}`);
    if (conversationContext.length > MAX_CONTEXT * 2) {
      conversationContext.splice(0, 2);
    }
    
    return content;
  },
  
  /**
   * Prompt with conversation context
   */
  async promptWithContext(text: string, options: AIOptions = {}): Promise<string> {
    const contextualPrompt = CONVERSATION_PROMPT(text, conversationContext);
    return this.prompt(contextualPrompt, options);
  },
  
  /**
   * Clear conversation context
   */
  clearContext(): void {
    conversationContext.length = 0;
    logger.debug('Conversation context cleared');
  },
};