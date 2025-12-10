import { router } from './messageRouter';
import type { Message } from '../types/messages';

// Initialize message routing for extension
chrome.runtime.onMessage.addListener((message: Message, sender: unknown, sendResponse: (response?: unknown) => void) => {
  router.handle(message).then(sendResponse).catch((e) => sendResponse({ error: String(e) }));
  return true; // use async sendResponse
});

// Clean up on service worker shutdown
self.addEventListener('install', () => {
  // noop setup hooks if needed
});

self.addEventListener('activate', () => {
  // keep service worker ready
});