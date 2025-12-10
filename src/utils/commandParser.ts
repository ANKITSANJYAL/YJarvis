import { COMMAND_PATTERNS, type CommandType } from '../constants/commands';

export type Command =
  | { kind: 'search'; query: string }
  | { kind: 'search_tutorial'; query: string }
  | { kind: 'search_popular'; query: string }
  | { kind: 'search_channel'; channel: string }
  | { kind: 'summarize'; level?: 'brief' | 'standard' | 'detailed' }
  | { kind: 'flashcards' }
  | { kind: 'quiz' }
  | { kind: 'transcript' }
  | { kind: 'youtube_control'; command: string }
  | { kind: 'conversation'; text: string }
  | { kind: 'unknown' };

interface ParseResult {
  type: CommandType;
  match: RegExpMatchArray;
  priority: number;
}

/**
 * Parses natural language voice commands into structured actions.
 * @param text - Raw speech-to-text output
 * @returns Parsed command with type and parameters
 */
export function parseCommand(text: string): Command {
  const normalized = text.toLowerCase().trim();
  
  // Try to match against all command patterns
  const matches: ParseResult[] = [];
  
  for (const [type, patterns] of Object.entries(COMMAND_PATTERNS)) {
    for (const pattern of patterns) {
      const match = normalized.match(pattern);
      if (match) {
        matches.push({
          type: type as CommandType,
          match,
          priority: 0, // Could use COMMAND_PRIORITY from constants
        });
      }
    }
  }
  
  // If no matches, return unknown
  if (matches.length === 0) {
    // Check if it might be a general conversation
    if (normalized.length > 5) {
      return { kind: 'conversation', text };
    }
    return { kind: 'unknown' };
  }
  
  // Use first match (could be improved with priority sorting)
  const best = matches[0];
  if (!best) {
    return { kind: 'unknown' };
  }
  
  // Extract query/parameters based on command type
  switch (best.type) {
    case 'SEARCH':
      return { 
        kind: 'search', 
        query: best.match[2]?.trim() ?? best.match[1]?.trim() ?? '' 
      };
      
    case 'SEARCH_TUTORIAL':
      return { 
        kind: 'search_tutorial', 
        query: best.match[2]?.trim() ?? '' 
      };
      
    case 'SEARCH_POPULAR':
      return { 
        kind: 'search_popular', 
        query: best.match[2]?.trim() ?? '' 
      };
      
    case 'SEARCH_CHANNEL':
      return { 
        kind: 'search_channel', 
        channel: best.match[2]?.trim() ?? '' 
      };
      
    case 'SUMMARIZE': {
      // Determine level from command
      const cmdText = best.match[0] || '';
      let level: 'brief' | 'standard' | 'detailed' = 'standard';
      if (/brief|short|quick/i.test(cmdText)) level = 'brief';
      else if (/detailed|long|full/i.test(cmdText)) level = 'detailed';
      return { kind: 'summarize', level };
    }
      
    case 'FLASHCARDS':
      return { kind: 'flashcards' };
      
    case 'QUIZ':
      return { kind: 'quiz' };
      
    case 'GET_TRANSCRIPT':
      return { kind: 'transcript' };
      
    default:
      // It's a YouTube control command
      return { kind: 'youtube_control', command: text };
  }
}

/**
 * Checks if a command is a YouTube control command
 */
export function isYouTubeControl(cmd: Command): boolean {
  return cmd.kind === 'youtube_control';
}

/**
 * Checks if a command requires AI processing
 */
export function requiresAI(cmd: Command): boolean {
  return cmd.kind === 'summarize' || 
         cmd.kind === 'flashcards' || 
         cmd.kind === 'quiz' ||
         cmd.kind === 'conversation';
}

/**
 * Checks if a command requires video search
 */
export function requiresSearch(cmd: Command): boolean {
  return cmd.kind === 'search' || 
         cmd.kind === 'search_tutorial' || 
         cmd.kind === 'search_popular' ||
         cmd.kind === 'search_channel';
}