import { create } from 'zustand';

interface AccessibilityState {
  highContrast: boolean;
  fontScale: number; // 1.0 default
  toggleContrast: () => void;
  setFontScale: (scale: number) => void;
}

export const useAccessibility = create<AccessibilityState>((set) => ({
  highContrast: false,
  fontScale: 1.0,
  toggleContrast: () => set((s) => ({ highContrast: !s.highContrast })),
  setFontScale: (scale) => set({ fontScale: Math.max(0.8, Math.min(1.6, scale)) }),
}));