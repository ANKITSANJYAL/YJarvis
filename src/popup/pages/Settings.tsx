import React, { useEffect, useState } from 'react';
import type { Message, ResponseMap } from '../../types/messages';
import { CONFIG } from '../../constants/config';

interface Settings {
  wakeWord: 'jarvis' | 'dummy';
  voiceRate: number;
  voicePitch: number;
  voiceVolume: number;
  commandSensitivity: number;
  recordingHistory: boolean;
  autoSummarize: boolean;
}

export function Settings(): JSX.Element {
  const [openaiKey, setOpenaiKey] = useState('');
  const [youtubeKey, setYoutubeKey] = useState('');
  const [settings, setSettings] = useState<Settings>({
    wakeWord: 'jarvis',
    voiceRate: CONFIG.TTS_RATE,
    voicePitch: CONFIG.TTS_PITCH,
    voiceVolume: CONFIG.TTS_VOLUME,
    commandSensitivity: CONFIG.VOICE_CONFIDENCE_THRESHOLD,
    recordingHistory: false,
    autoSummarize: false,
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async (): Promise<void> => {
    try {
      // Load API keys
      chrome.runtime.sendMessage({ type: 'GET_API_KEY' } as Message, (resp: ResponseMap['GET_API_KEY']) => {
        if (resp) setOpenaiKey('••••••••••••••••');
      });

      // Load settings
      const stored = await chrome.storage.local.get([CONFIG.STORAGE_KEY_SETTINGS]);
      if (stored[CONFIG.STORAGE_KEY_SETTINGS]) {
        setSettings(stored[CONFIG.STORAGE_KEY_SETTINGS] as Settings);
      }
    } catch {
      setError('Failed to load settings');
    }
  };

  const saveApiKeys = async (): Promise<void> => {
    setSaveStatus('saving');
    setError(null);

    try {
      if (openaiKey && openaiKey !== '••••••••••••••••') {
        await new Promise<void>((resolve, reject) => {
          chrome.runtime.sendMessage(
            { type: 'SET_API_KEY', payload: { key: openaiKey } } as Message,
            (resp: ResponseMap['SET_API_KEY']) => {
              if (resp) resolve();
              else reject(new Error('Failed to save'));
            }
          );
        });
      }

      if (youtubeKey && youtubeKey !== '••••••••••••••••') {
        await new Promise<void>((resolve, reject) => {
          chrome.runtime.sendMessage(
            { type: 'SET_YOUTUBE_API_KEY', payload: { key: youtubeKey } } as Message,
            (resp: unknown) => {
              if (resp) resolve();
              else reject(new Error('Failed to save'));
            }
          );
        });
      }

      await chrome.storage.local.set({ [CONFIG.STORAGE_KEY_SETTINGS]: settings });
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      setError('Failed to save settings');
    }
  };

  const clearData = async (): Promise<void> => {
    if (!confirm('Clear all data including flashcards and analytics? This cannot be undone.')) {
      return;
    }

    try {
      await chrome.storage.local.clear();
      setSaveStatus('saved');
      setOpenaiKey('');
      setYoutubeKey('');
    } catch {
      setError('Failed to clear data');
    }
  };

  return (
    <div className="p-4 space-y-6 max-h-[500px] overflow-y-auto">
      <div>
        <h2 className="text-lg font-bold mb-4">Settings</h2>
      </div>

      {/* API Keys */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold border-b pb-1">API Keys</h3>
        
        <div>
          <label className="block text-xs font-medium mb-1">OpenAI API Key *</label>
          <input
            type="password"
            className="w-full border rounded px-2 py-1.5 text-xs"
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            placeholder="sk-..."
          />
          <p className="text-xs text-gray-500 mt-0.5">Required for AI features</p>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">YouTube Data API Key</label>
          <input
            type="password"
            className="w-full border rounded px-2 py-1.5 text-xs"
            value={youtubeKey}
            onChange={(e) => setYoutubeKey(e.target.value)}
            placeholder="AIza..."
          />
          <p className="text-xs text-gray-500 mt-0.5">Optional: For enhanced video search</p>
        </div>
      </section>

      {/* Voice Settings */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold border-b pb-1">Voice Settings</h3>

        <div>
          <label className="block text-xs font-medium mb-1">Wake Word</label>
          <select
            className="w-full border rounded px-2 py-1.5 text-xs"
            value={settings.wakeWord}
            onChange={(e) => setSettings({ ...settings, wakeWord: e.target.value as 'jarvis' | 'dummy' })}
          >
            <option value="jarvis">Jarvis</option>
            <option value="dummy">Dummy</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">
            Speech Rate: {settings.voiceRate.toFixed(2)}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={settings.voiceRate}
            onChange={(e) => setSettings({ ...settings, voiceRate: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">
            Speech Pitch: {settings.voicePitch.toFixed(1)}
          </label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={settings.voicePitch}
            onChange={(e) => setSettings({ ...settings, voicePitch: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">
            Command Sensitivity: {Math.round(settings.commandSensitivity * 100)}%
          </label>
          <input
            type="range"
            min="0.5"
            max="1.0"
            step="0.05"
            value={settings.commandSensitivity}
            onChange={(e) => setSettings({ ...settings, commandSensitivity: Number(e.target.value) })}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-0.5">
            Higher = more accurate but less responsive
          </p>
        </div>
      </section>

      {/* Privacy */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold border-b pb-1">Privacy</h3>

        <div className="flex items-center justify-between">
          <span className="text-xs">Recording History</span>
          <label className="relative inline-block w-10 h-5">
            <input
              type="checkbox"
              checked={settings.recordingHistory}
              onChange={(e) => setSettings({ ...settings, recordingHistory: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-full h-full bg-gray-300 rounded-full peer-checked:bg-green-500 transition-all">
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                settings.recordingHistory ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs">Auto-summarize videos</span>
          <label className="relative inline-block w-10 h-5">
            <input
              type="checkbox"
              checked={settings.autoSummarize}
              onChange={(e) => setSettings({ ...settings, autoSummarize: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-full h-full bg-gray-300 rounded-full peer-checked:bg-green-500 transition-all">
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                settings.autoSummarize ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </div>
          </label>
        </div>
      </section>

      {/* Actions */}
      <section className="space-y-2">
        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          className={`w-full px-3 py-2 text-sm rounded font-medium ${
            saveStatus === 'saving'
              ? 'bg-gray-400 text-white'
              : saveStatus === 'saved'
              ? 'bg-green-500 text-white'
              : saveStatus === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 text-white'
          }`}
          onClick={saveApiKeys}
          disabled={saveStatus === 'saving'}
        >
          {saveStatus === 'saving'
            ? 'Saving...'
            : saveStatus === 'saved'
            ? 'Saved!'
            : saveStatus === 'error'
            ? 'Error'
            : 'Save Settings'}
        </button>

        <button
          className="w-full px-3 py-2 text-sm border rounded text-red-600 border-red-300 hover:bg-red-50"
          onClick={clearData}
        >
          Clear All Data
        </button>
      </section>

      {/* Version Info */}
      <section className="pt-4 border-t text-xs text-gray-500 text-center">
        <p>Jarvis YouTube Assistant v0.1.0</p>
        <p className="mt-1">Production-grade AI assistant</p>
      </section>
    </div>
  );
}
