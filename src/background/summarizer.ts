import { aiService } from './aiService';
import type { TranscriptSegment } from './transcriptService';

export type SummaryLevel = 'brief' | 'standard' | 'detailed';

export async function summarizeTranscript(
  segments: TranscriptSegment[],
  level: SummaryLevel
): Promise<string> {
  const text = segments
    .slice(0, 400)
    .map((s) => `[${Math.round(s.start)}s] ${s.text}`)
    .join('\n');
  const instruction =
    level === 'brief'
      ? 'In 2-3 sentences, summarize concisely with 2-3 key points.'
      : level === 'standard'
      ? 'Provide a short paragraph summary with key concepts.'
      : 'Provide bullet-point detailed summary with timestamp-linked highlights.';
  const prompt = `${instruction}\n\nTranscript excerpt:\n${text}`;
  return aiService.prompt(prompt, { temperature: 0.4 });
}