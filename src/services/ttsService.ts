export const ttsService = {
  speak(text: string): void {
    if (!('speechSynthesis' in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.05;
    utter.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) => /en/.test(v.lang) && /male|daniel|english/.test(v.name.toLowerCase()));
    if (preferred) utter.voice = preferred;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  },
};