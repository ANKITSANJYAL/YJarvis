import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
  popup: 'src/popup/index.html',
        content: 'src/content/index.ts',
        background: 'src/background/index.ts',
      },
      output: {
  entryFileNames: 'assets/[name].js',
  chunkFileNames: 'assets/[name].js',
  assetFileNames: 'assets/[name][extname]',
      },
    },
  },
});