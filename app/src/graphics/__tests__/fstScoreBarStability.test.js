import { createElement } from 'react';

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ensureThemeStylesLoaded, getThemeMeta, resolveDisplayModeShell } from '@/graphics/exit/themeRegistry';

import { assertCommandMarkupContent } from './commandSmokeExpectations';
import { createRawSessionForCommand, runGraphicPipeline, THEME_SLUG } from './pipelineFixtures';

/** @type {Record<string, { default: import('react').ComponentType<any> }>} */
const commandModules = import.meta.glob('../themes/theme1/commands/*/*.jsx', { eager: true });

const FST_BAR_STABLE_KEYS = ['FST_FOUR', 'FST_SIX', 'FST_OUT', 'FST_NOT_OUT'];

/**
 * Regression: FST score bar must not run EventSweep (bc-animate-wkt-sweep).
 * Flash overlay still mounts from processor `event.kind`.
 */
describe('FST score bar stability', () => {
  it('loads theme styles', async () => {
    await ensureThemeStylesLoaded(THEME_SLUG);
    expect(true).toBe(true);
  });

  for (const key of FST_BAR_STABLE_KEYS) {
    it(`${key} renders flash + score bar without EventSweep on ControllerBar`, () => {
      const command = {
        key,
        type: 'FULL_SCREEN_TRANSITION',
        category: 'animation',
        displayMode: null,
      };

      const { plan } = runGraphicPipeline(
        createRawSessionForCommand({
          key,
          type: 'FULL_SCREEN_TRANSITION',
          displayMode: null,
          category: 'animation',
        }),
      );

      expect(plan?.componentProps?.event?.kind).toBeTruthy();

      const modulePath = `../themes/theme1/commands/${command.type}/${command.key}.jsx`;
      const GraphicComponent = commandModules[modulePath]?.default;
      const themeMeta = getThemeMeta(plan.themeSlug);
      const DisplayModeShell = resolveDisplayModeShell(plan.displayMode);

      const html = renderToStaticMarkup(
        createElement(
          'div',
          { className: 'graphic-overlay-container' },
          createElement(
            themeMeta.ThemeRoot,
            null,
            createElement(
              DisplayModeShell,
              { tokens: plan.tokens },
              createElement(GraphicComponent, { ...plan.componentProps, tokens: plan.tokens, isOverlay: true }),
            ),
          ),
        ),
      );

      const markupError = assertCommandMarkupContent(command, html, plan);
      expect(markupError, markupError ?? undefined).toBeNull();
      expect(html).toContain('bc-controller-bar-wrap');
      expect(html).not.toContain('bc-animate-wkt-sweep');
      expect(html).toContain('bc-flash-title');
    });
  }
});
