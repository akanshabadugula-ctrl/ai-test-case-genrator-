import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://127.0.0.1:4000' } },
  test: { environment: 'jsdom', setupFiles: './src/test/setup.ts' },
  // CodeMirror is isolated to the lazy-loaded test-studio route; its 177 KB gzip payload is not in the initial app bundle.
  build: { chunkSizeWarningLimit: 600 },
});
