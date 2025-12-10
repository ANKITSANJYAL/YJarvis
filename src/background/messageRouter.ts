import { apiKeyManager } from './apiKeyManager';
import { quotaManager } from './quotaManager';
import { aiService } from './aiService';
import { youtubeService } from './youtubeService';
import { transcriptService } from './transcriptService';
import { summarizeTranscript } from './summarizer';
import { generateFromTranscript } from '../utils/quizGenerator';
import { createCard } from '../utils/flashcardGenerator';
import { FLASHCARD_PROMPT, GRADING_PROMPT } from '../constants/prompts';
import { CONFIG } from '../constants/config';
import type { Message } from '../types/messages';

// YouTube API key manager (similar to OpenAI)
const STORAGE_KEY_YT = CONFIG.STORAGE_KEY_YOUTUBE_API_KEY;
const IV_KEY_YT = CONFIG.STORAGE_KEY_YOUTUBE_API_KEY_IV;

async function getCryptoKey(): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode('jarvis-yt-assistant-fixed-salt'),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: new TextEncoder().encode('jarvis-salt'), iterations: 100000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptYT(text: string): Promise<{ cipher: ArrayBuffer; iv: Uint8Array }> {
  const key = await getCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(text));
  return { cipher, iv };
}

async function decryptYT(cipher: ArrayBuffer, iv: Uint8Array): Promise<string> {
  const key = await getCryptoKey();
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv.buffer as ArrayBuffer }, key, cipher);
  return new TextDecoder().decode(plain);
}

const youtubeKeyManager = {
  async setKey(key: string): Promise<void> {
    const { cipher, iv } = await encryptYT(key);
    await chrome.storage.local.set({ [STORAGE_KEY_YT]: Array.from(new Uint8Array(cipher)), [IV_KEY_YT]: Array.from(iv) });
  },
  async getKey(): Promise<string | null> {
    const data = await chrome.storage.local.get([STORAGE_KEY_YT, IV_KEY_YT]);
    const cipherArr = data[STORAGE_KEY_YT] as number[] | undefined;
    const ivArr = data[IV_KEY_YT] as number[] | undefined;
    if (!cipherArr || !ivArr) return null;
    const cipher = new Uint8Array(cipherArr).buffer;
    const iv = new Uint8Array(ivArr);
    try {
      return await decryptYT(cipher, iv);
    } catch {
      return null;
    }
  },
};

export const router = {
  async handle(message: Message): Promise<unknown> {
    switch (message.type) {
      case 'GET_API_KEY':
        return apiKeyManager.getKey();
      case 'SET_API_KEY':
        return apiKeyManager.setKey(message.payload.key).then(() => ({ ok: true }));
      case 'CLEAR_API_KEY':
        return apiKeyManager.clearKey().then(() => ({ ok: true }));
      case 'GET_YOUTUBE_API_KEY':
        return youtubeKeyManager.getKey();
      case 'SET_YOUTUBE_API_KEY':
        return youtubeKeyManager.setKey(message.payload.key).then(() => ({ ok: true }));
      case 'GET_QUOTA':
        return quotaManager.getStatus();
      case 'AI_PROMPT':
        return aiService.prompt(message.payload.text);
      case 'YT_SEARCH_BEST':
        return youtubeService.searchBest(message.payload.query);
      case 'YT_GET_TRANSCRIPT':
        return transcriptService.getTranscript(message.payload.videoId);
      case 'YT_SUMMARIZE': {
        const segs = await transcriptService.getTranscript(message.payload.videoId);
        if (!segs) return null;
        return summarizeTranscript(segs, message.payload.level);
      }
      case 'QUIZ_GENERATE': {
        const segs = await transcriptService.getTranscript(message.payload.videoId);
        if (!segs) return null;
        const transcript = segs.map((s) => s.text).join('\n');
        const last = segs[segs.length - 1];
        const lengthSec = Math.round((last?.start ?? 0) + (last?.dur ?? 0));
        return generateFromTranscript(transcript, lengthSec);
      }
      case 'QUIZ_GRADE': {
        const prompt = GRADING_PROMPT(message.payload.prompt, message.payload.answer, message.payload.answer);
        const resp = await aiService.prompt(prompt, { temperature: 0.2 });
        return resp;
      }
      case 'FLASHCARD_GENERATE': {
        const segs = await transcriptService.getTranscript(message.payload.videoId);
        if (!segs) return null;
        const transcript = segs.map((s) => s.text).join('\n');
        const last = segs[segs.length - 1];
        const lengthSec = Math.round((last?.start ?? 0) + (last?.dur ?? 0));
        const count = Math.min(
          CONFIG.FLASHCARDS_MAX,
          Math.max(CONFIG.FLASHCARDS_MIN, Math.round(lengthSec / 600 * CONFIG.FLASHCARDS_PER_10_MIN))
        );
        const prompt = FLASHCARD_PROMPT(transcript.slice(0, 5000), count);
        const resp = await aiService.prompt(prompt, { temperature: 0.5 });
        
        try {
          const parsed = JSON.parse(resp) as Array<{
            front: string;
            back: string;
            difficulty: string;
            tags: string[];
          }>;
          return parsed.map((fc) => createCard(fc.front, fc.back, fc.tags));
        } catch {
          return [];
        }
      }
      default:
        return { error: 'Unknown message type' };
    }
  },
};