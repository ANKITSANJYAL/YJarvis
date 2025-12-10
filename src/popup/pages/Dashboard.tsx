import React, { useEffect, useState } from 'react';
import { VoiceVisualizer } from '../components/VoiceVisualizer';
import { FlashcardDeck } from '../components/FlashcardDeck';
import { TranscriptViewer } from '../components/TranscriptViewer';
import { QuizInterface } from '../components/QuizInterface';

interface Tab {
  url?: string;
  title?: string;
}

export function Dashboard(): JSX.Element {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [quota, setQuota] = useState({ used: 0, limit: 60, resetInMs: 0 });
  const [activeTab, setActiveTab] = useState<'transcript' | 'flashcards' | 'quiz'>('transcript');

  useEffect(() => {
    // Get current video info
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: Tab[]) => {
      const tab = tabs[0];
      if (tab?.url) {
        const url = new URL(tab.url);
        const vid = url.searchParams.get('v');
        setVideoId(vid);
        setVideoTitle(tab.title || 'YouTube Video');
      }
    });

    // Get quota status
    chrome.runtime.sendMessage({ type: 'GET_QUOTA' }, (resp: unknown) => {
      if (resp && typeof resp === 'object') {
        setQuota(resp as typeof quota);
      }
    });

    // Poll for listening status (this would need to be implemented in background)
    const interval = setInterval(() => {
      chrome.storage.local.get(['VOICE_LISTENING'], (result: { VOICE_LISTENING?: boolean }) => {
        setIsListening(!!result.VOICE_LISTENING);
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const toggleVoice = (): void => {
    setIsListening(!isListening);
    chrome.storage.local.set({ VOICE_LISTENING: !isListening });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold">Jarvis Assistant</h1>
        {videoId ? (
          <p className="text-xs text-gray-600 truncate" title={videoTitle}>
            {videoTitle}
          </p>
        ) : (
          <p className="text-xs text-gray-500">No YouTube video detected</p>
        )}
      </div>

      {/* Voice Status */}
      <VoiceVisualizer 
        isListening={isListening} 
        isProcessing={false}
      />

      <div className="flex gap-2">
        <button
          className={`px-3 py-1 text-xs rounded flex-1 ${
            isListening 
              ? 'bg-red-500 text-white' 
              : 'bg-green-500 text-white'
          }`}
          onClick={toggleVoice}
        >
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </button>
      </div>

      {/* Quota Display */}
      <div className="text-xs p-2 bg-gray-50 rounded">
        <div className="flex justify-between">
          <span>API Quota:</span>
          <span className={quota.used >= quota.limit * 0.9 ? 'text-red-600' : 'text-gray-600'}>
            {quota.used}/{quota.limit}
          </span>
        </div>
        <div className="w-full h-1 bg-gray-300 rounded-full mt-1 overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${(quota.used / quota.limit) * 100}%` }}
          />
        </div>
        {quota.resetInMs > 0 && (
          <div className="text-gray-500 mt-1">
            Resets in {Math.ceil(quota.resetInMs / 1000)}s
          </div>
        )}
      </div>

      {/* Tabs */}
      {videoId && (
        <>
          <div className="flex border-b">
            <button
              className={`px-3 py-2 text-xs font-medium ${
                activeTab === 'transcript'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('transcript')}
            >
              Summary
            </button>
            <button
              className={`px-3 py-2 text-xs font-medium ${
                activeTab === 'flashcards'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('flashcards')}
            >
              Flashcards
            </button>
            <button
              className={`px-3 py-2 text-xs font-medium ${
                activeTab === 'quiz'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('quiz')}
            >
              Quiz
            </button>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'transcript' && <TranscriptViewer />}
            {activeTab === 'flashcards' && <FlashcardDeck videoId={videoId} />}
            {activeTab === 'quiz' && <QuizInterface />}
          </div>
        </>
      )}
    </div>
  );
}
