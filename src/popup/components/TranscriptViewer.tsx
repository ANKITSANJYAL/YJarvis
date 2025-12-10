import React, { useState } from 'react';
import type { Message } from '../../types/messages';

function getVideoIdFromUrl(url: string): string | null {
  const u = new URL(url);
  return u.searchParams.get('v');
}

export function TranscriptViewer(): JSX.Element {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = (level: 'brief' | 'standard' | 'detailed'): void => {
    setLoading(true);
    setError(null);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: unknown) => {
      const t = Array.isArray(tabs) ? (tabs as Array<{ url?: string }>) : [];
      const url = t[0]?.url;
      const videoId = url ? getVideoIdFromUrl(url) : null;
      if (!videoId) {
        setError('No YouTube video detected.');
        setLoading(false);
        return;
      }
      chrome.runtime.sendMessage(
        ({ type: 'YT_SUMMARIZE', payload: { videoId, level } } as unknown) as Message,
        (resp: unknown) => {
          setLoading(false);
          if (typeof resp === 'string') setSummary(resp);
          else setError('Failed to generate summary.');
        }
      );
    });
  };

  return (
    <div className="mt-4">
      <div className="flex gap-2">
        <button className="px-2 py-1 text-xs border rounded" onClick={() => run('brief')}>Brief</button>
        <button className="px-2 py-1 text-xs border rounded" onClick={() => run('standard')}>Standard</button>
        <button className="px-2 py-1 text-xs border rounded" onClick={() => run('detailed')}>Detailed</button>
      </div>
      {loading && <p className="text-xs text-gray-500 mt-2">Summarizing…</p>}
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      {summary && (
        <pre className="text-xs mt-2 whitespace-pre-wrap max-h-64 overflow-auto border rounded p-2">{summary}</pre>
      )}
    </div>
  );
}