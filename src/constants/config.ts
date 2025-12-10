/**
 * Application configuration constants
 */

export const CONFIG = {
  // API Configuration
  OPENAI_MODEL: 'gpt-4o-mini',
  OPENAI_TEMPERATURE: 0.6,
  OPENAI_MAX_TOKENS: 1000,
  
  // Rate Limiting
  RATE_LIMIT_PER_MINUTE: 60,
  RATE_LIMIT_WINDOW_MS: 60_000,
  
  // Cache Configuration
  CACHE_TTL_MS: 60 * 60 * 1000, // 1 hour
  CACHE_MAX_ENTRIES: 1000,
  
  // Voice Recognition
  VOICE_CONFIDENCE_THRESHOLD: 0.7,
  WAKE_WORD_TIMEOUT_MS: 3000, // Time after wake word to accept command
  COMMAND_DEBOUNCE_MS: 500,
  VOICE_LANG: 'en-US',
  
  // Text-to-Speech
  TTS_RATE: 1.05,
  TTS_PITCH: 1.0,
  TTS_VOLUME: 1.0,
  
  // YouTube Control
  VOLUME_INCREMENT: 10, // percent
  SEEK_SMALL: 5, // seconds
  SEEK_MEDIUM: 10,
  SEEK_LARGE: 30,
  SPEED_INCREMENT: 0.25,
  SPEED_MIN: 0.25,
  SPEED_MAX: 2.0,
  
  // Quiz Configuration
  QUIZ_QUESTIONS_SHORT_VIDEO: 5, // < 10 min
  QUIZ_QUESTIONS_MEDIUM_VIDEO: 10, // 10-30 min
  QUIZ_QUESTIONS_LONG_VIDEO: 15, // > 30 min
  QUIZ_MCQ_PERCENTAGE: 0.6,
  QUIZ_TIMER_SECONDS: 60, // per question (optional)
  
  // Flashcards Configuration
  FLASHCARDS_MIN: 5,
  FLASHCARDS_MAX: 50,
  FLASHCARDS_PER_10_MIN: 3,
  SM2_INITIAL_EASE: 2.5,
  SM2_MIN_EASE: 1.3,
  
  // Transcript
  TRANSCRIPT_MAX_SEGMENTS: 400, // Limit for summarization
  TRANSCRIPT_LANGS: ['en', 'en-US', 'en-GB', 'en-CA', 'en-AU'],
  
  // Performance
  MAX_MEMORY_MB: 150,
  MAX_CPU_PERCENT: 5,
  DEBOUNCE_SEARCH_MS: 300,
  THROTTLE_API_CALLS_MS: 500,
  
  // Logging
  LOG_BUFFER_SIZE: 100,
  LOG_LEVEL_PROD: 'WARN' as const,
  LOG_LEVEL_DEV: 'DEBUG' as const,
  
  // UI
  POPUP_MIN_WIDTH: 320,
  POPUP_MIN_HEIGHT: 360,
  FONT_SCALE_MIN: 0.8,
  FONT_SCALE_MAX: 1.6,
  ANIMATION_DURATION_MS: 300,
  
  // Storage Keys
  STORAGE_KEY_API_KEY: 'OPENAI_API_KEY_ENC',
  STORAGE_KEY_API_KEY_IV: 'OPENAI_API_KEY_IV',
  STORAGE_KEY_YOUTUBE_API_KEY: 'YOUTUBE_API_KEY_ENC',
  STORAGE_KEY_YOUTUBE_API_KEY_IV: 'YOUTUBE_API_KEY_IV',
  STORAGE_KEY_SETTINGS: 'JARVIS_SETTINGS',
  STORAGE_KEY_FLASHCARDS: 'JARVIS_FLASHCARDS',
  STORAGE_KEY_ANALYTICS: 'JARVIS_ANALYTICS',
  
  // Encryption
  PBKDF2_ITERATIONS: 100_000,
  PBKDF2_HASH: 'SHA-256' as const,
  AES_KEY_LENGTH: 256,
  AES_IV_LENGTH: 12,
  
  // Error Handling
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_BACKOFF_MS: 500,
  RETRY_BACKOFF_MULTIPLIER: 2,
  
  // Features Flags (for gradual rollout)
  FEATURES: {
    VOICE_RECOGNITION: true,
    WAKE_WORD_DETECTION: true,
    VIDEO_SEARCH: true,
    TRANSCRIPT_EXTRACTION: true,
    AI_SUMMARIZATION: true,
    FLASHCARD_GENERATION: true,
    QUIZ_GENERATION: true,
    VOICE_QUIZ_ANSWERS: true,
    ANALYTICS: true,
    KEYBOARD_SHORTCUTS: true,
  },
} as const;

export const KEYBOARD_SHORTCUTS = {
  TOGGLE_VOICE: 'Ctrl+Shift+J',
  PLAY_PAUSE: 'Space',
  SEEK_FORWARD: 'ArrowRight',
  SEEK_BACKWARD: 'ArrowLeft',
  VOLUME_UP: 'ArrowUp',
  VOLUME_DOWN: 'ArrowDown',
  FULLSCREEN: 'f',
  THEATER_MODE: 't',
  CAPTIONS: 'c',
  SPEED_UP: '>',
  SPEED_DOWN: '<',
  MUTE: 'm',
} as const;

export const VIDEO_QUALITIES = [
  'auto',
  '144p',
  '240p',
  '360p',
  '480p',
  '720p',
  '1080p',
  '1440p',
  '2160p',
] as const;

export const PLAYBACK_SPEEDS = [
  0.25,
  0.5,
  0.75,
  1.0,
  1.25,
  1.5,
  1.75,
  2.0,
] as const;
