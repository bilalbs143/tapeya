import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from '@playwright/test';

const SESSION_FIXTURE = JSON.parse(readFileSync(join(process.cwd(), 'e2e/fixtures/graphics-session.json'), 'utf8'));
const SIGNATURE = 'a'.repeat(64);
const GRAPHICS_URL = `/1-9999999999-${SIGNATURE}`;

test.describe('graphics artifact smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/graphic-sessions/access/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(SESSION_FIXTURE),
      });
    });
  });

  test('loads signed graphics URL with transparent background and LT_DEFAULT', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });
    page.on('pageerror', (error) => {
      consoleErrors.push(error.message);
    });

    await page.goto(GRAPHICS_URL, { waitUntil: 'networkidle' });

    const htmlBg = await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
    const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

    expect(htmlBg).toBe('rgba(0, 0, 0, 0)');
    expect(bodyBg).toBe('rgba(0, 0, 0, 0)');

    await expect(page.locator('.graphic-overlay-container')).toHaveCount(1, { timeout: 15_000 });
    await expect(page.locator('.theme1')).toHaveCount(1, { timeout: 15_000 });

    const benignPatterns = [/favicon/i, /websocket/i, /reverb/i, /pusher/i];
    const criticalErrors = consoleErrors.filter((line) => !benignPatterns.some((pattern) => pattern.test(line)));
    expect(criticalErrors, `unexpected console errors: ${criticalErrors.join('; ')}`).toEqual([]);
  });
});
