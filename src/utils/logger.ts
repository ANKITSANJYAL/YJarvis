type Level = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

const isProd = process.env.NODE_ENV === 'production';
const buffer: Array<{ ts: number; level: Level; msg: string; ctx?: unknown }> = [];

function log(level: Level, msg: string, ctx?: unknown): void {
  const entry = { ts: Date.now(), level, msg, ctx };
  buffer.push(entry);
  if (buffer.length > 100) buffer.shift();
  if (isProd && (level === 'INFO' || level === 'DEBUG')) return;
  const fn = level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.info;
  fn(`[${level}] ${msg}`, ctx ?? '');
}

export const logger = {
  error: (msg: string, ctx?: unknown): void => log('ERROR', msg, ctx),
  warn: (msg: string, ctx?: unknown): void => log('WARN', msg, ctx),
  info: (msg: string, ctx?: unknown): void => log('INFO', msg, ctx),
  debug: (msg: string, ctx?: unknown): void => log('DEBUG', msg, ctx),
  getBuffer: (): ReadonlyArray<{ ts: number; level: Level; msg: string; ctx?: unknown }> => buffer,
};