import React, { useState } from 'react';
import type { Message } from '../../types/messages';

interface QuizItem {
  id: string;
  type: 'mcq' | 'truefalse' | 'short' | 'fill';
  prompt: string;
  options?: string[];
  answer: string | boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

export function QuizInterface(): JSX.Element {
  const [items, setItems] = useState<QuizItem[]>([]);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const generate = (): void => {
    setError(null);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: unknown) => {
      const t = Array.isArray(tabs) ? (tabs as Array<{ url?: string }>) : [];
      const url = t[0]?.url ?? '';
      const vid = new URL(url).searchParams.get('v');
      if (!vid) {
        setError('No video found');
        return;
      }
      chrome.runtime.sendMessage(({ type: 'QUIZ_GENERATE', payload: { videoId: vid } } as unknown) as Message, (resp: unknown) => {
        if (Array.isArray(resp)) setItems(resp as QuizItem[]);
        else setError('Failed to generate quiz');
      });
    });
  };

  const gradeShort = (q: QuizItem, userAnswer: string): void => {
    chrome.runtime.sendMessage(({ type: 'QUIZ_GRADE', payload: { prompt: q.prompt, answer: userAnswer } } as unknown) as Message, (resp: unknown) => {
      if (typeof resp === 'string') setResult(resp);
      else setResult('Grading failed');
    });
  };

  return (
    <div className="mt-4">
      <button className="px-2 py-1 text-xs border rounded" onClick={generate}>Generate Quiz</button>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      <div className="mt-2 space-y-2 max-h-64 overflow-auto">
        {items.map((q) => (
          <div key={q.id} className="border rounded p-2">
            <p className="text-xs font-medium">{q.prompt}</p>
            {q.type === 'mcq' && q.options && (
              <ul className="mt-1">
                {q.options.map((o) => (
                  <li key={o} className="text-xs">• {o}</li>
                ))}
              </ul>
            )}
            {q.type === 'short' && (
              <div className="mt-1">
                <input className="border rounded px-2 py-1 text-xs w-full" placeholder="Your answer" onBlur={(e) => gradeShort(q, e.target.value)} />
              </div>
            )}
          </div>
        ))}
      </div>
      {result && <pre className="text-xs mt-2 whitespace-pre-wrap border rounded p-2">{result}</pre>}
    </div>
  );
}