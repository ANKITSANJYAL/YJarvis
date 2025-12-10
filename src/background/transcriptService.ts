export interface TranscriptSegment {
  start: number;
  dur: number;
  text: string;
}

async function fetchTimedText(videoId: string, lang: string): Promise<TranscriptSegment[] | null> {
  const url = new URL('https://www.youtube.com/api/timedtext');
  url.searchParams.set('v', videoId);
  url.searchParams.set('lang', lang);
  const resp = await fetch(url.toString());
  if (!resp.ok) return null;
  const xml = await resp.text();
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const texts = Array.from(doc.getElementsByTagName('text'));
  if (!texts.length) return null;
  const dec = (s: string): string => s.replace(/&#39;/g, "'" ).replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  return texts.map((t) => ({ start: Number(t.getAttribute('start') ?? 0), dur: Number(t.getAttribute('dur') ?? 0), text: dec(t.textContent ?? '') }));
}

export const transcriptService = {
  async getTranscript(videoId: string): Promise<TranscriptSegment[] | null> {
    // Try common English codes first, could be extended to detect page lang
    const langs = ['en', 'en-US', 'en-GB'];
    for (const l of langs) {
      try {
        const segs = await fetchTimedText(videoId, l);
        if (segs && segs.length) return segs;
      } catch {
        // continue
      }
    }
    return null;
  },
};