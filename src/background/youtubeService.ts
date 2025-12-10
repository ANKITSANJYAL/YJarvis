import { cacheService } from '../services/cacheService';
import { quotaManager } from './quotaManager';

export interface YTVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  viewCount: number;
  likeCount: number;
  publishedAt: string;
  description: string;
}

function rank(v: YTVideo, intent: 'learn' | 'entertain'): number {
  const recency = 1 / (1 + (Date.now() - Date.parse(v.publishedAt)) / (1000 * 60 * 60 * 24 * 365));
  const likeScore = Math.log10(1 + v.likeCount);
  const viewScore = Math.log10(1 + v.viewCount);
  const base = 0.5 * viewScore + 0.4 * likeScore + 0.1 * recency;
  return intent === 'learn' ? base + 0.2 * recency : base;
}

export const youtubeService = {
  async searchBest(query: string): Promise<YTVideo | null> {
  // Simple throttle: skip if called too frequently within 500ms
  const lastTsKey = 'YT_LAST_CALL';
  const st = await cachesMatch(lastTsKey);
  const now = Date.now();
  if (st && now - st < 500) return null;
  await cacheSetTs(lastTsKey, now);
    const cacheKey = `yt:q:${query}`;
    const cached = await cacheService.get<YTVideo>(cacheKey);
    if (cached) return cached;
    if (!quotaManager.canConsume(1)) throw new Error('Rate limit exceeded');
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('q', query);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('type', 'video');
    url.searchParams.set('maxResults', '5');
    const resp = await fetch(url.toString());
    if (!resp.ok) throw new Error(`YouTube API error ${resp.status}`);
    const data = (await resp.json()) as {
      items: Array<{ id: { videoId: string }; snippet: { title: string; channelTitle: string; publishedAt: string; description: string } }>;
    };
    const ids = data.items.map((i) => i.id.videoId).join(',');
    const statsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    statsUrl.searchParams.set('id', ids);
    statsUrl.searchParams.set('part', 'statistics,snippet');
    const statsResp = await fetch(statsUrl.toString());
    if (!statsResp.ok) throw new Error(`YouTube API error ${statsResp.status}`);
    const stats = (await statsResp.json()) as {
      items: Array<{ id: string; statistics: { viewCount: string; likeCount: string }; snippet: { description: string } }>;
    };
    quotaManager.consume(1);
    const merged: YTVideo[] = data.items.map((it) => {
      const s = stats.items.find((x) => x.id === it.id.videoId);
      return {
        videoId: it.id.videoId,
        title: it.snippet.title,
        channelTitle: it.snippet.channelTitle,
        publishedAt: it.snippet.publishedAt,
        description: s?.snippet.description ?? it.snippet.description,
        viewCount: s ? Number(s.statistics.viewCount) : 0,
        likeCount: s ? Number(s.statistics.likeCount) : 0,
      };
    });
    // naive clickbait filter
    const filtered = merged.filter((m) => !/(shocking|you won't believe|click here|gone wrong)/i.test(m.title));
    const intent: 'learn' | 'entertain' = /(tutorial|how to|guide|course|lesson|learn)/i.test(query) ? 'learn' : 'entertain';
    const best = filtered.sort((a, b) => rank(b, intent) - rank(a, intent))[0] ?? null;
    if (best) await cacheService.set(cacheKey, best, 60 * 60 * 1000);
    return best;
  },
};

async function cachesMatch(key: string): Promise<number | null> {
  try {
    const val = await cacheService.get<number>(`ts:${key}`);
    return val ?? null;
  } catch {
    return null;
  }
}

async function cacheSetTs(key: string, ts: number): Promise<void> {
  await cacheService.set(`ts:${key}`, ts, 60 * 60 * 1000);
}