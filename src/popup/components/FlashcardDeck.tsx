import React, { useState, useEffect } from 'react';
import type { Flashcard, ReviewRating } from '../../utils/flashcardGenerator';
import { schedule, exportToAnkiCsv, exportToQuizletTsv } from '../../utils/flashcardGenerator';

interface FlashcardDeckProps {
  videoId?: string;
}

export function FlashcardDeck({ videoId }: FlashcardDeckProps): JSX.Element {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);

  const currentCard = cards[currentIndex];
  const dueCards = cards.filter(c => c.due <= Date.now());
  const stats = {
    total: cards.length,
    new: cards.filter(c => c.state === 'new').length,
    learning: cards.filter(c => c.state === 'learning').length,
    review: cards.filter(c => c.state === 'review').length,
    mature: cards.filter(c => c.state === 'mature').length,
    due: dueCards.length,
  };

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async (): Promise<void> => {
    try {
      const stored = await chrome.storage.local.get(['JARVIS_FLASHCARDS']);
      const allCards = (stored.JARVIS_FLASHCARDS as Flashcard[]) || [];
      setCards(allCards);
    } catch {
      setError('Failed to load flashcards');
    }
  };

  const saveCards = async (updatedCards: Flashcard[]): Promise<void> => {
    try {
      await chrome.storage.local.set({ JARVIS_FLASHCARDS: updatedCards });
      setCards(updatedCards);
    } catch {
      setError('Failed to save flashcards');
    }
  };

  const generateCards = async (): Promise<void> => {
    if (!videoId) {
      setError('No video ID provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resp = await chrome.runtime.sendMessage({
        type: 'FLASHCARD_GENERATE',
        payload: { videoId },
      });

      if (Array.isArray(resp)) {
        const newCards = resp as Flashcard[];
        await saveCards([...cards, ...newCards]);
      } else {
        setError('Failed to generate flashcards');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (rating: ReviewRating): Promise<void> => {
    if (!currentCard) return;

    const updatedCard = schedule(currentCard, rating);
    const newCards = cards.map(c => c.id === updatedCard.id ? updatedCard : c);
    
    await saveCards(newCards);
    setIsFlipped(false);
    
    // Move to next due card or wrap around
    const nextDueIndex = newCards.findIndex((c, i) => i > currentIndex && c.due <= Date.now());
    if (nextDueIndex !== -1) {
      setCurrentIndex(nextDueIndex);
    } else {
      const firstDue = newCards.findIndex(c => c.due <= Date.now());
      setCurrentIndex(firstDue !== -1 ? firstDue : 0);
    }
  };

  const exportCards = (format: 'anki' | 'quizlet'): void => {
    const content = format === 'anki' ? exportToAnkiCsv(cards) : exportToQuizletTsv(cards);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashcards-${Date.now()}.${format === 'anki' ? 'csv' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (showStats) {
    return (
      <div className="mt-4 p-4 border rounded">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold">Flashcard Statistics</h3>
          <button
            className="text-xs text-blue-600"
            onClick={() => setShowStats(false)}
          >
            Back to Cards
          </button>
        </div>
        
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span>Total Cards:</span>
            <span className="font-medium">{stats.total}</span>
          </div>
          <div className="flex justify-between">
            <span>Due for Review:</span>
            <span className="font-medium text-orange-600">{stats.due}</span>
          </div>
          <div className="flex justify-between">
            <span>New:</span>
            <span className="font-medium text-blue-600">{stats.new}</span>
          </div>
          <div className="flex justify-between">
            <span>Learning:</span>
            <span className="font-medium text-yellow-600">{stats.learning}</span>
          </div>
          <div className="flex justify-between">
            <span>Review:</span>
            <span className="font-medium text-green-600">{stats.review}</span>
          </div>
          <div className="flex justify-between">
            <span>Mature:</span>
            <span className="font-medium text-green-700">{stats.mature}</span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            className="px-2 py-1 text-xs border rounded flex-1"
            onClick={() => exportCards('anki')}
          >
            Export to Anki
          </button>
          <button
            className="px-2 py-1 text-xs border rounded flex-1"
            onClick={() => exportCards('quizlet')}
          >
            Export to Quizlet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold">Flashcards</h3>
        <div className="flex gap-2">
          {videoId && (
            <button
              className="px-2 py-1 text-xs border rounded"
              onClick={generateCards}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate'}
            </button>
          )}
          <button
            className="px-2 py-1 text-xs border rounded"
            onClick={() => setShowStats(true)}
          >
            Stats ({stats.due} due)
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

      {cards.length === 0 ? (
        <p className="text-xs text-gray-500">No flashcards yet. Generate some from a video!</p>
      ) : currentCard ? (
        <div className="border rounded p-4">
          <div className="text-xs text-gray-500 mb-2">
            Card {currentIndex + 1} of {cards.length}
            {currentCard.state !== 'new' && ` • ${currentCard.state}`}
          </div>

          <div
            className={`min-h-[120px] p-4 border-2 rounded cursor-pointer transition-all ${
              isFlipped ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-300'
            }`}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {!isFlipped ? (
              <div>
                <div className="text-xs text-gray-500 mb-2">Front:</div>
                <div className="text-sm font-medium">{currentCard.front}</div>
              </div>
            ) : (
              <div>
                <div className="text-xs text-gray-500 mb-2">Back:</div>
                <div className="text-sm">{currentCard.back}</div>
              </div>
            )}
          </div>

          {currentCard.imageDataUrl && (
            <img
              src={currentCard.imageDataUrl}
              alt="Card visual"
              className="mt-2 max-h-32 rounded"
            />
          )}

          {currentCard.tags.length > 0 && (
            <div className="mt-2 flex gap-1 flex-wrap">
              {currentCard.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 text-xs bg-gray-200 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {isFlipped && (
            <div className="mt-4 flex gap-2">
              <button
                className="px-3 py-1 text-xs bg-red-500 text-white rounded flex-1"
                onClick={() => handleRating('again')}
              >
                Again
              </button>
              <button
                className="px-3 py-1 text-xs bg-orange-500 text-white rounded flex-1"
                onClick={() => handleRating('hard')}
              >
                Hard
              </button>
              <button
                className="px-3 py-1 text-xs bg-green-500 text-white rounded flex-1"
                onClick={() => handleRating('good')}
              >
                Good
              </button>
              <button
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded flex-1"
                onClick={() => handleRating('easy')}
              >
                Easy
              </button>
            </div>
          )}

          {!isFlipped && (
            <div className="mt-4 text-center">
              <button
                className="px-4 py-2 text-xs bg-gray-200 rounded"
                onClick={() => setIsFlipped(true)}
              >
                Show Answer
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-500">All cards reviewed! Check back later.</p>
      )}
    </div>
  );
}
