export type QuestionType = 'mcq' | 'truefalse' | 'short' | 'fill';

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[]; // for MCQ
  answer: string | boolean;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

function makeId(): string {
  return crypto.randomUUID();
}

export function generateFromTranscript(transcript: string, lengthSec: number): Question[] {
  const baseCount = lengthSec < 600 ? 5 : lengthSec < 1800 ? 10 : 15;
  const sentences = transcript.split(/\.|\n/).map((s) => s.trim()).filter(Boolean);
  const take = (n: number): string[] => sentences.slice(0, Math.min(n, sentences.length));
  const src = take(baseCount * 2);
  const qs: Question[] = [];
  for (let i = 0; i < baseCount; i++) {
    const s = src[i % src.length] ?? 'General concept';
    if (i % 3 === 0) {
      const correct = s;
      const distractors = [
        s.replace(/\b(\w+)\b/, '$1 concept'),
        s.replace(/\b(\w+)\b/, '$1 method'),
        'None of the above',
      ];
      qs.push({ id: makeId(), type: 'mcq', prompt: `Which best describes: ${s}?`, options: shuffle([correct, ...distractors]).slice(0, 4), answer: correct, difficulty: pickDifficulty(i) });
    } else if (i % 3 === 1) {
      const statement = s.length > 10 ? s : `${s} is discussed.`;
      qs.push({ id: makeId(), type: 'truefalse', prompt: statement, answer: true, difficulty: pickDifficulty(i) });
    } else {
      qs.push({ id: makeId(), type: 'short', prompt: `Explain briefly: ${s}`, answer: s, difficulty: pickDifficulty(i) });
    }
  }
  // Add a fill-in-blank
  if (sentences.length) {
    const s = sentences[0] ?? '';
    const word = (s.match(/\b(\w{5,})\b/)?.[1] ?? 'concept');
    qs.push({ id: makeId(), type: 'fill', prompt: s.replace(word, '_____'), answer: word, difficulty: 'medium' });
  }
  return qs;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function pickDifficulty(i: number): 'easy' | 'medium' | 'hard' {
  return i % 5 === 0 ? 'hard' : i % 2 === 0 ? 'medium' : 'easy';
}