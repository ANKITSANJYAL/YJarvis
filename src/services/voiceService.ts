type WakeCallback = (command: string) => void;

function getRecognition(): SpeechRecognition | null {
  const SR = (window as unknown as { webkitSpeechRecognition?: SpeechRecognition }).webkitSpeechRecognition;
  const Recognition = (window as unknown as { SpeechRecognition?: SpeechRecognition }).SpeechRecognition || SR;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Recognition ? new (Recognition as any)() : null;
}

function isWakeWord(text: string): boolean {
  const t = text.toLowerCase();
  return t.includes('jarvis') || t.includes('dummy');
}

export const voiceService = {
  startWakeWord(onCommand: WakeCallback): void {
    const rec = getRecognition();
    if (!rec) return;
    rec.continuous = true;
    rec.lang = 'en-US';
    let lastSpoken = 0;
    let lastCommand = '';
    let debounceTimer: number | null = null;
    rec.onresult = (event: SpeechRecognitionEvent) => {
      const lastIndex = Math.max(0, event.results.length - 1);
      const res = event.results.item(lastIndex);
      if (!res || res.length === 0) return;
      const alt = res.item(0);
      const transcript = alt.transcript.trim();
      const confidence = alt.confidence;
      const now = Date.now();
      if (confidence < 0.7) return;
      if (isWakeWord(transcript)) {
        lastSpoken = now;
        return;
      }
      if (now - lastSpoken < 3000) {
        lastCommand = transcript;
        if (debounceTimer) window.clearTimeout(debounceTimer);
        debounceTimer = window.setTimeout(() => {
          onCommand(lastCommand);
          debounceTimer = null;
        }, 500);
      }
    };
    try {
      rec.start();
    } catch {
      // recognition already started
    }
  },
};