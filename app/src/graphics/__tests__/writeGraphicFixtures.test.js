/**
 * Playwright fixture generator — not part of the default unit suite.
 *
 * Run: npm run generate:graphic-fixtures
 * Writes: app/e2e/fixtures/{LT_DEFAULT,FST_FOUR,PLAYING_11}.html
 * Consumed by: npm run test:e2e:graphics (CI job `graphics-visual`)
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createElement } from 'react';

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { GraphicRenderer } from '@/graphics/exit/GraphicRenderer';
import { ensureThemeStylesLoaded } from '@/graphics/exit/themeRegistry';

import manifest from '../../../../shared/graphics-command-manifest.json';
import { createRawSessionForCommand, runGraphicPipeline, THEME_SLUG } from './pipelineFixtures';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = join(__dirname, '../../../e2e/fixtures');
const FIXTURE_KEYS = ['LT_DEFAULT', 'FST_FOUR', 'PLAYING_11'];

function wrapHtml(body) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Graphic fixture</title>
  </head>
  <body>${body}</body>
</html>`;
}

describe('write graphic HTML fixtures', () => {
  it('writes representative command fixtures for Playwright', async () => {
    await ensureThemeStylesLoaded(THEME_SLUG);
    mkdirSync(FIXTURE_DIR, { recursive: true });

    for (const key of FIXTURE_KEYS) {
      const command = manifest.commands.find((entry) => entry.key === key);
      expect(command, `missing manifest entry for ${key}`).toBeTruthy();

      const { plan } = runGraphicPipeline(createRawSessionForCommand(command));
      expect(plan, `${key} should produce a render plan`).toBeTruthy();

      const html = renderToStaticMarkup(createElement(GraphicRenderer, { plan }));
      expect(html.length).toBeGreaterThan(0);

      writeFileSync(join(FIXTURE_DIR, `${key}.html`), wrapHtml(html), 'utf8');
    }
  });
});
