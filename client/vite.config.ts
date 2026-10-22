import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

import { THEME_BOOT_SNIPPET } from './src/shared/config/themeBoot.js';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'inject-theme-boot',
      transformIndexHtml(html) {
        return html.replace(
          '<!--THEME_BOOT-->',
          `<!-- Theme boot — single source: shared/config/themeBoot.ts -->\n    <script>${THEME_BOOT_SNIPPET}</script>`
        );
      },
    },
  ],
  server: {
    // Keep clear of legacy `app/` (usually :5173) so local e2e never attaches to the wrong SPA.
    port: 5180,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@/app': fileURLToPath(new URL('./src/app', import.meta.url)),
      '@/features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@/entities': fileURLToPath(new URL('./src/entities', import.meta.url)),
      '@/shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@/test': fileURLToPath(new URL('./src/test', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: true,
    // e2e/ is Playwright's tree, not Vitest's — Playwright's `test()` global
    // isn't a Vitest test and shouldn't be collected by this runner.
    exclude: ['e2e/**', 'node_modules/**'],
    env: {
      // Vitest doesn't read `.env` unless one exists; these are the same
      // defaults `.env.example` documents, so `npm test` works with zero setup.
      VITE_API_URL: 'http://localhost:8000/api/v1',
      VITE_APP_URL: 'http://localhost:5180',
      VITE_CDN_BASE: 'https://cdn.tapeya.com',
    },
  },
});
