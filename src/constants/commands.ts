/**
 * Command patterns and mappings for natural language processing
 */

export const WAKE_WORDS = ['jarvis', 'dummy'] as const;

export const JARVIS_RESPONSES = {
  activation: [
    'At your service, sir.',
    "I've been expecting you.",
    'Jarvis online and ready to assist.',
    'All systems operational, awaiting your command.',
    'Ready when you are, sir.',
  ],
  acknowledgment: [
    'Right away, sir.',
    'Consider it done.',
    'On it.',
    'Understood.',
  ],
  error: [
    "I'm afraid I can't do that right now.",
    'Experiencing technical difficulties.',
    'Something went wrong, sir.',
  ],
  notFound: [
    "I couldn't find what you're looking for.",
    'No results match that query.',
    'Perhaps try rephrasing that?',
  ],
} as const;

export const COMMAND_PATTERNS = {
  // Playback control
  PLAY: [/\b(play|start|resume)\b/i],
  PAUSE: [/\b(pause|stop it|hold)\b/i],
  STOP: [/\b(stop|end)\b/i],
  RESTART: [/\b(restart|replay|start over|from the beginning)\b/i],
  
  // Navigation
  SKIP_FORWARD: [
    /\b(skip|jump|go|forward|ahead)\s*(forward)?\s*(?:by\s*)?(\d+)\s*(second|sec|minute|min)s?\b/i,
    /\b(fast\s*forward)\s*(?:by\s*)?(\d+)\s*(second|sec|minute|min)s?\b/i,
  ],
  SKIP_BACKWARD: [
    /\b(skip|jump|go|rewind|back)\s*(back|backward)?\s*(?:by\s*)?(\d+)\s*(second|sec|minute|min)s?\b/i,
  ],
  GO_TO_TIME: [
    /\b(go\s*to|seek\s*to|jump\s*to)\s*(\d+)\s*(hour|hr)s?\s*(\d+)?\s*(minute|min)s?\s*(\d+)?\s*(second|sec)s?\b/i,
    /\b(go\s*to|seek\s*to|jump\s*to)\s*(\d+)\s*(minute|min)s?\s*(\d+)?\s*(second|sec)s?\b/i,
    /\b(go\s*to|seek\s*to|jump\s*to)\s*(\d+)\s*(second|sec)s?\b/i,
  ],
  GO_TO_PERCENT: [
    /\b(go\s*to|jump\s*to)\s*(\d+)\s*%\s*(of\s*(the\s*)?video)?\b/i,
  ],
  NEXT_VIDEO: [/\b(next|skip)\s*(video|track)?\b/i],
  PREVIOUS_VIDEO: [/\b(previous|prev|back|last)\s*(video|track)?\b/i],
  
  // Audio control
  VOLUME_UP: [/\b(increase|raise|turn\s*up|louder)\s*(volume|sound)?\b/i],
  VOLUME_DOWN: [/\b(decrease|lower|turn\s*down|quieter)\s*(volume|sound)?\b/i],
  VOLUME_SET: [/\b(set|change)\s*(volume|sound)\s*(to|at)?\s*(\d+)\s*%?\b/i],
  MUTE: [/\b(mute|silence)\b/i],
  UNMUTE: [/\b(unmute|unsilence|sound\s*on)\b/i],
  
  // Playback settings
  SPEED_UP: [/\b(speed\s*up|faster|increase\s*speed)\b/i],
  SPEED_DOWN: [/\b(slow\s*down|slower|decrease\s*speed)\b/i],
  SPEED_SET: [
    /\b(set|change)\s*speed\s*(to|at)?\s*(\d+\.?\d*)\s*x?\b/i,
    /\b(play\s*at|set\s*to)\s*(\d+\.?\d*)\s*x?\s*(speed)?\b/i,
  ],
  SPEED_NORMAL: [/\b(normal|regular|default)\s*speed\b/i],
  
  // Display controls
  FULLSCREEN: [/\b(full\s*screen|fullscreen|maximize)\b/i],
  EXIT_FULLSCREEN: [/\b(exit\s*full\s*screen|minimize|normal\s*view)\b/i],
  THEATER_MODE: [/\b(theater|theatre)\s*mode\b/i],
  EXIT_THEATER: [/\b(exit\s*theater|exit\s*theatre|normal\s*mode)\b/i],
  
  // Captions/Subtitles
  CAPTIONS_ON: [/\b(turn\s*on|enable|show)\s*(captions|subtitles|cc)\b/i],
  CAPTIONS_OFF: [/\b(turn\s*off|disable|hide)\s*(captions|subtitles|cc)\b/i],
  TOGGLE_CAPTIONS: [/\b(toggle)\s*(captions|subtitles|cc)\b/i],
  
  // Quality
  QUALITY_SET: [/\b(set|change)\s*quality\s*(to|at)?\s*(\d+)p?\b/i],
  QUALITY_AUTO: [/\b(auto|automatic)\s*quality\b/i],
  
  // Search & Discovery
  SEARCH: [
    /\b(search|find|look\s*for|show\s*me)\s*(?:video(?:s)?\s*(?:on|about))?\s*(.+)/i,
    /\b(play|watch)\s*(?:a\s*)?(?:video\s*(?:on|about))?\s*(.+)/i,
  ],
  SEARCH_TUTORIAL: [/\b(find|show)\s*(?:a\s*)?tutorial\s*(?:on|about)?\s*(.+)/i],
  SEARCH_POPULAR: [/\b(play|show)\s*(?:the\s*)?(?:most\s*)?popular\s*video\s*(?:on|about)?\s*(.+)/i],
  SEARCH_CHANNEL: [/\b(find|show|play)\s*video(?:s)?\s*from\s*(.+)/i],
  
  // Learning tools
  SUMMARIZE: [/\b(summarize|summary|sum\s*up)\s*(this\s*)?(?:video)?\b/i],
  FLASHCARDS: [/\b(create|make|generate)\s*(flashcards?|cards?)\b/i],
  QUIZ: [/\b(create|make|generate|start|take)\s*(?:a\s*)?quiz\b/i],
  GET_TRANSCRIPT: [/\b(transcript|captions\s*text|subtitles\s*text)\b/i],
} as const;

export type CommandType = keyof typeof COMMAND_PATTERNS;

/**
 * Maps command types to their execution priority (lower = higher priority)
 */
export const COMMAND_PRIORITY: Record<CommandType, number> = {
  // High priority - stop/pause commands
  STOP: 1,
  PAUSE: 1,
  
  // Medium priority - playback
  PLAY: 2,
  RESTART: 2,
  
  // Navigation
  GO_TO_TIME: 3,
  GO_TO_PERCENT: 3,
  SKIP_FORWARD: 3,
  SKIP_BACKWARD: 3,
  NEXT_VIDEO: 3,
  PREVIOUS_VIDEO: 3,
  
  // Audio
  MUTE: 4,
  UNMUTE: 4,
  VOLUME_SET: 4,
  VOLUME_UP: 4,
  VOLUME_DOWN: 4,
  
  // Playback settings
  SPEED_SET: 5,
  SPEED_NORMAL: 5,
  SPEED_UP: 5,
  SPEED_DOWN: 5,
  
  // Display
  FULLSCREEN: 6,
  EXIT_FULLSCREEN: 6,
  THEATER_MODE: 6,
  EXIT_THEATER: 6,
  
  // Captions
  CAPTIONS_ON: 7,
  CAPTIONS_OFF: 7,
  TOGGLE_CAPTIONS: 7,
  
  // Quality
  QUALITY_SET: 8,
  QUALITY_AUTO: 8,
  
  // Search - lower priority as it changes context
  SEARCH: 9,
  SEARCH_TUTORIAL: 9,
  SEARCH_POPULAR: 9,
  SEARCH_CHANNEL: 9,
  
  // Learning tools - lowest priority
  SUMMARIZE: 10,
  FLASHCARDS: 10,
  QUIZ: 10,
  GET_TRANSCRIPT: 10,
};
