import { createCard, schedule } from '../../src/utils/flashcardGenerator';

describe('flashcard scheduler', () => {
  it('schedules first reviews correctly', () => {
    const c = createCard('front', 'back');
    const now = 0;
    const c1 = schedule(c, 'good', now);
    expect(c1.interval).toBe(1);
    const c2 = schedule(c1, 'good', now);
    expect(c2.interval).toBe(6);
  });
  it('handles again rating', () => {
    const c = createCard('front', 'back');
    const cAgain = schedule(c, 'again', 0);
    expect(cAgain.repetitions).toBe(0);
    expect(cAgain.interval).toBe(0);
  });
});