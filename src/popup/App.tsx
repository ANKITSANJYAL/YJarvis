import React, { useState, useEffect } from 'react';
import { Setup } from './pages/Setup';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { useAccessibility } from '../store/accessibility';

export default function App(): JSX.Element {
  const { highContrast, fontScale, toggleContrast, setFontScale } = useAccessibility();
  const [hasApiKey, setHasApiKey] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'settings'>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if API key is configured
    chrome.runtime.sendMessage({ type: 'GET_API_KEY' }, (resp: unknown) => {
      setHasApiKey(!!resp);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className={`min-w-[320px] min-h-[360px] p-4 font-sans flex items-center justify-center ${highContrast ? 'hc' : ''}`} style={{ fontSize: `${fontScale}rem` }}>
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          <p className="mt-2 text-xs text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Show setup if no API key
  if (!hasApiKey) {
    return (
      <div className={`min-w-[320px] min-h-[360px] p-4 font-sans ${highContrast ? 'hc' : ''}`} style={{ fontSize: `${fontScale}rem` }}>
        <Setup />
        <button
          className="mt-4 text-xs text-blue-600 underline"
          onClick={() => {
            chrome.runtime.sendMessage({ type: 'GET_API_KEY' }, (resp: unknown) => {
              if (resp) {
                setHasApiKey(true);
              }
            });
          }}
        >
          I&apos;ve already set up my API key
        </button>
      </div>
    );
  }

  return (
    <div className={`min-w-[320px] min-h-[500px] font-sans ${highContrast ? 'hc' : ''}`} style={{ fontSize: `${fontScale}rem` }}>
      {/* Top bar */}
      <div className="bg-gray-100 border-b px-4 py-2 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 text-xs rounded ${
              currentView === 'dashboard'
                ? 'bg-blue-500 text-white'
                : 'bg-white border'
            }`}
            onClick={() => setCurrentView('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`px-3 py-1 text-xs rounded ${
              currentView === 'settings'
                ? 'bg-blue-500 text-white'
                : 'bg-white border'
            }`}
            onClick={() => setCurrentView('settings')}
          >
            Settings
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            className="px-2 py-1 text-xs border rounded bg-white" 
            onClick={toggleContrast}
            title="Toggle high contrast"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
            </svg>
          </button>
          <input 
            type="range" 
            min={0.8} 
            max={1.6} 
            step={0.1} 
            value={fontScale} 
            onChange={(e) => setFontScale(Number(e.target.value))} 
            className="w-16"
            title="Font size"
          />
        </div>
      </div>

      {/* Content */}
      {currentView === 'dashboard' && <Dashboard />}
      {currentView === 'settings' && <Settings />}
    </div>
  );
}