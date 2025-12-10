import { youtubeController } from './youtubeController';
import './content.css';
import { ttsService } from '../services/ttsService';
import type { Message } from '../types/messages';
import { parseCommand, isYouTubeControl, requiresSearch } from '../utils/commandParser';
import { voiceService } from '../services/voiceService';
import { JARVIS_RESPONSES } from '../constants/commands';
import { logger } from '../utils/logger';

function getRandomResponse(responses: readonly string[]): string {
  return responses[Math.floor(Math.random() * responses.length)] ?? responses[0] ?? 'Ready.';
}

function init(): void {
  logger.info('Jarvis content script initialized');
  youtubeController.init();
  
  voiceService.startWakeWord((command) => {
    logger.debug('Command received', { command });
    
    // First try YouTube controls
    if (youtubeController.handleCommand(command)) {
      ttsService.speak(getRandomResponse(JARVIS_RESPONSES.acknowledgment));
      return;
    }
    
    // Parse high-level command
    const parsed = parseCommand(command);
    logger.debug('Command parsed', { parsed });
    
    // Handle YouTube control commands
    if (isYouTubeControl(parsed) && parsed.kind === 'youtube_control') {
      if (youtubeController.handleCommand(parsed.command)) {
        ttsService.speak(getRandomResponse(JARVIS_RESPONSES.acknowledgment));
      } else {
        ttsService.speak("I couldn't execute that command.");
      }
      return;
    }
    
    // Handle search commands
    if (requiresSearch(parsed)) {
      const query = 'query' in parsed ? parsed.query : 'channel' in parsed ? parsed.channel : '';
      if (!query) {
        ttsService.speak("What would you like me to search for?");
        return;
      }
      
      chrome.runtime.sendMessage(
        { type: 'YT_SEARCH_BEST', payload: { query } } as Message,
        (resp: unknown) => {
          if (resp && typeof resp === 'object' && resp !== null && 'videoId' in resp) {
            const videoId = (resp as { videoId: string }).videoId;
            ttsService.speak('Playing your selection, sir.');
            window.location.href = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
          } else {
            ttsService.speak(getRandomResponse(JARVIS_RESPONSES.notFound));
          }
        }
      );
      return;
    }
    
    // Handle learning tool commands
    if (parsed.kind === 'summarize' || parsed.kind === 'flashcards' || parsed.kind === 'quiz') {
      ttsService.speak('Please check the extension popup for that feature.');
      return;
    }
    
    // Handle conversation/unknown commands with AI
    if (parsed.kind === 'conversation' || parsed.kind === 'unknown') {
      chrome.runtime.sendMessage(
        { type: 'AI_PROMPT', payload: { text: command } } as Message,
        (resp: unknown) => {
          if (typeof resp === 'string' && resp) {
            ttsService.speak(resp);
          } else {
            ttsService.speak(getRandomResponse(JARVIS_RESPONSES.error));
          }
        }
      );
      return;
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}