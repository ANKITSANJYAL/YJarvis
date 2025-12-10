import React, { useEffect, useState } from 'react';
import type { Message, ResponseMap } from '../../types/messages';

export function Setup(): JSX.Element {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'valid' | 'invalid' | 'saving'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_API_KEY' } as Message, (resp: ResponseMap['GET_API_KEY']) => {
      if (chrome.runtime.lastError) {
        setError('Failed to load API key.');
        return;
      }
      if (resp) setApiKey('••••••••••••••••');
    });
  }, []);

  const validate = (key: string): boolean => {
    return /^[a-zA-Z0-9-_]{20,}$/.test(key);
  };

  const onSave = async (): Promise<void> => {
    setStatus('saving');
    setError(null);
    if (!validate(apiKey)) {
      setStatus('invalid');
      setError('Invalid API key format.');
      return;
    }
    chrome.runtime.sendMessage(
      { type: 'SET_API_KEY', payload: { key: apiKey } } as Message,
      (resp: ResponseMap['SET_API_KEY']) => {
        if (chrome.runtime.lastError || !resp) {
          setStatus('invalid');
          setError('Failed to save API key.');
          return;
        }
        setStatus('valid');
      }
    );
  };

  return (
    <section>
      <h2 className="text-sm font-semibold mb-2">Setup</h2>
      <label className="block text-xs mb-1">OpenAI API Key</label>
      <input
        type="password"
        className="w-full border rounded px-2 py-1 text-sm"
        value={apiKey}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
        placeholder="sk-..."
      />
      <button
        className="mt-2 bg-black text-white rounded px-3 py-1 text-sm disabled:opacity-50"
        disabled={status === 'saving'}
        onClick={onSave}
      >
        Save
      </button>
      {status === 'valid' && <p className="text-xs text-green-600 mt-2">Saved.</p>}
      {status === 'invalid' && error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </section>
  );
}