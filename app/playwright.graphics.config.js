import { defineConfig } from '@playwright/test';

const PORT = 4174;

export default defineConfig({
  testDir: './e2e',
  testMatch: 'graphics-smoke.spec.js',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    headless: true,
    baseURL: `http://127.0.0.1:${PORT}`,
    ...(process.env.CHROME_86_EXECUTABLE
      ? {
          launchOptions: {
            executablePath: process.env.CHROME_86_EXECUTABLE,
          },
        }
      : {}),
  },
  webServer: {
    command: `npm run preview:graphics -- --port ${PORT} --strictPort`,
    url: `http://127.0.0.1:${PORT}/graphics.html`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
