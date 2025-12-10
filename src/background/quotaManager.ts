let used = 0;
const limitPerMinute = 60;
let windowStart = Date.now();

export const quotaManager = {
  canConsume(units = 1): boolean {
    const now = Date.now();
    if (now - windowStart > 60_000) {
      windowStart = now;
      used = 0;
    }
    return used + units <= limitPerMinute;
  },
  consume(units = 1): void {
    if (!this.canConsume(units)) throw new Error('Quota exceeded');
    used += units;
  },
  getStatus(): { used: number; limit: number; resetInMs: number } {
    const now = Date.now();
    const resetInMs = Math.max(0, 60_000 - (now - windowStart));
    return { used, limit: limitPerMinute, resetInMs };
  },
};