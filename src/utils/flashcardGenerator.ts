export type CardState = 'new' | 'learning' | 'review' | 'mature';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  tags: string[];
  imageDataUrl?: string;
  state: CardState;
  ease: number; // SM-2 ease factor
  interval: number; // days
  repetitions: number;
  due: number; // epoch ms
}

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

export function createCard(front: string, back: string, tags: string[] = [], imageDataUrl?: string): Flashcard {
  return {
    id: crypto.randomUUID(),
    front,
    back,
    tags,
    imageDataUrl,
    state: 'new',
    ease: 2.5,
    interval: 0,
    repetitions: 0,
    due: Date.now(),
  };
}

export function schedule(card: Flashcard, rating: ReviewRating, now = Date.now()): Flashcard {
  const next = { ...card };
  // SM-2 adjustments
  if (rating === 'again') {
    next.repetitions = 0;
    next.interval = 0;
    next.ease = Math.max(1.3, next.ease - 0.2);
    next.state = 'learning';
  } else {
    next.repetitions += 1;
    if (next.repetitions === 1) next.interval = 1;
    else if (next.repetitions === 2) next.interval = 6;
    else next.interval = Math.round(next.interval * next.ease);
    if (rating === 'hard') next.ease = Math.max(1.3, next.ease - 0.15);
    if (rating === 'good') next.ease = Math.max(1.3, next.ease + 0.0);
    if (rating === 'easy') next.ease = Math.max(1.3, next.ease + 0.15);
    next.state = next.interval >= 21 ? 'mature' : 'review';
  }
  next.due = now + next.interval * 24 * 60 * 60 * 1000;
  return next;
}

export function exportToAnkiCsv(cards: Flashcard[]): string {
  const esc = (s: string): string => '"' + s.replace(/"/g, '""') + '"';
  return cards
    .map((c) => `${esc(c.front)};${esc(c.back)};${esc(c.tags.join(' '))};${esc(c.imageDataUrl ?? '')}`)
    .join('\n');
}

export function exportToQuizletTsv(cards: Flashcard[]): string {
  const esc = (s: string): string => s.replace(/\t/g, '    ').replace(/\n/g, ' ');
  return cards.map((c) => `${esc(c.front)}\t${esc(c.back)}`).join('\n');
}