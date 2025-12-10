import React, { useEffect, useState } from 'react';

interface VoiceVisualizerProps {
  isListening: boolean;
  isProcessing: boolean;
  confidence?: number;
  lastCommand?: string;
}

export function VoiceVisualizer({ 
  isListening, 
  isProcessing, 
  confidence = 0,
  lastCommand 
}: VoiceVisualizerProps): JSX.Element {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (!isListening) return;

    const interval = setInterval(() => {
      setPulse(p => (p + 1) % 3);
    }, 500);

    return () => clearInterval(interval);
  }, [isListening]);

  const getStatusColor = (): string => {
    if (isProcessing) return 'bg-yellow-500';
    if (isListening) return 'bg-green-500';
    return 'bg-gray-400';
  };

  const getStatusText = (): string => {
    if (isProcessing) return 'Processing...';
    if (isListening) return 'Listening...';
    return 'Inactive';
  };

  const confidenceColor = (): string => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center gap-3 p-3 border rounded bg-gray-50">
      {/* Visual indicator */}
      <div className="relative flex items-center justify-center w-12 h-12">
        {isListening && (
          <>
            <div
              className={`absolute w-full h-full rounded-full bg-green-200 animate-ping opacity-${
                pulse === 0 ? '75' : pulse === 1 ? '50' : '25'
              }`}
            />
            <div className="absolute w-10 h-10 rounded-full bg-green-300 animate-pulse" />
          </>
        )}
        <div
          className={`relative w-6 h-6 rounded-full ${getStatusColor()} transition-all ${
            isListening ? 'scale-110' : 'scale-100'
          }`}
        >
          {/* Microphone icon */}
          <svg
            className="w-full h-full p-1 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Status info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{getStatusText()}</span>
          {isListening && confidence > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full overflow-hidden">
                <div
                  className={`h-full ${confidenceColor()} transition-all duration-300`}
                  style={{ width: `${confidence * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{Math.round(confidence * 100)}%</span>
            </div>
          )}
        </div>
        
        {lastCommand && (
          <div className="mt-1 text-xs text-gray-600 truncate" title={lastCommand}>
            Last: &quot;{lastCommand}&quot;
          </div>
        )}
        
        {isListening && (
          <div className="mt-1 text-xs text-green-600">
            Say &quot;Jarvis&quot; or &quot;Dummy&quot; to activate
          </div>
        )}
      </div>

      {/* Status dots */}
      {isProcessing && (
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      )}
    </div>
  );
}
