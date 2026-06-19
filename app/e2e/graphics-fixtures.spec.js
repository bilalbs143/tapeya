import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from '@playwright/test';

const FIXTURE_KEYS = ['LT_DEFAULT', 'FST_FOUR', 'PLAYING_11'];

for (const key of FIXTURE_KEYS) {
  test(`${key} HTML fixture includes overlay shell`, async ({ page }) => {
    const html = readFileSync(join(process.cwd(), 'e2e/fixtures', `${key}.html`), 'utf8');
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.graphic-overlay-container')).toHaveCount(1);
  });
}
