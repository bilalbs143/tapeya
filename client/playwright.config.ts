import { defineConfig, devices } from '@playwright/test';

const APP_URL = process.env.VITE_APP_URL ?? 'http://localhost:5180';

/** Architecture doc §10 — Playwright covers critical flows only, not every page. */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: APP_URL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: APP_URL,
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      VITE_API_URL: process.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
      VITE_APP_URL: APP_URL,
      VITE_CDN_BASE: process.env.VITE_CDN_BASE ?? 'https://cdn.tapeya.com',
    },
  },
});
