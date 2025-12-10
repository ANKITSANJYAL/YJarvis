export type Message =
  | { type: 'GET_API_KEY' }
  | { type: 'SET_API_KEY'; payload: { key: string } }
  | { type: 'CLEAR_API_KEY' }
  | { type: 'GET_YOUTUBE_API_KEY' }
  | { type: 'SET_YOUTUBE_API_KEY'; payload: { key: string } }
  | { type: 'GET_QUOTA' }
  | { type: 'AI_PROMPT'; payload: { text: string } }
  | { type: 'YT_SEARCH_BEST'; payload: { query: string } }
  | { type: 'YT_GET_TRANSCRIPT'; payload: { videoId: string } }
  | { type: 'YT_SUMMARIZE'; payload: { videoId: string; level: 'brief' | 'standard' | 'detailed' } }
  | { type: 'QUIZ_GENERATE'; payload: { videoId: string } }
  | { type: 'QUIZ_GRADE'; payload: { prompt: string; answer: string } }
  | { type: 'FLASHCARD_GENERATE'; payload: { videoId: string } };

export type ResponseMap = {
  GET_API_KEY: string | null;
  SET_API_KEY: { ok: true };
  CLEAR_API_KEY: { ok: true };
  GET_YOUTUBE_API_KEY: string | null;
  SET_YOUTUBE_API_KEY: { ok: true };
  GET_QUOTA: { used: number; limit: number; resetInMs: number };
  AI_PROMPT: string;
  YT_SEARCH_BEST: { videoId: string; title: string } | null;
  YT_GET_TRANSCRIPT: Array<{ start: number; dur: number; text: string }> | null;
  YT_SUMMARIZE: string | null;
  QUIZ_GENERATE: unknown;
  QUIZ_GRADE: string;
  FLASHCARD_GENERATE: unknown;
};