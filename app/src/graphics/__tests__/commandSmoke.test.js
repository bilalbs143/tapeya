import { createElement } from 'react';

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ensureThemeStylesLoaded, getThemeMeta, resolveDisplayModeShell } from '@/graphics/exit/themeRegistry';

import manifest from '../../../../shared/graphics-command-manifest.json';
import { assertCommandMarkupContent } from './commandSmokeExpectations';
import { createRawSessionForCommand, runGraphicPipeline, THEME_SLUG } from './pipelineFixtures';

/** @type {Record<string, { default: import('react').ComponentType<any> }>} */
const commandModules = import.meta.glob('../themes/theme1/commands/*/*.jsx', { eager: true });

const overlayCommands = manifest.commands.filter(
  (command) => command.status !== 'pending_full_stack' && command.category !== 'backoffice_only',
);

/**
 * Eager-render command JSX (GraphicRenderer uses lazy() which SSR does not resolve).
 *
 * @param {import('@/graphics/types.js').GraphicRenderPlan} plan
 * @param {{ type: string, key: string }} command
 */
function renderCommandTree(plan, command) {
  const modulePath = `../themes/theme1/commands/${command.type}/${command.key}.jsx`;
  const GraphicComponent = commandModules[modulePath]?.default;
  const themeMeta = getThemeMeta(plan.themeSlug);
  const DisplayModeShell = resolveDisplayModeShell(plan.displayMode);

  if (!GraphicComponent || !themeMeta?.ThemeRoot) {
    throw new Error(`missing component or theme for ${command.key}`);
  }

  const { ThemeRoot } = themeMeta;

  return renderToStaticMarkup(
    createElement(
      'div',
      { className: 'graphic-overlay-container' },
      createElement(
        ThemeRoot,
        null,
        createElement(
          DisplayModeShell,
          { tokens: plan.tokens },
          createElement(GraphicComponent, { ...plan.componentProps, tokens: plan.tokens, isOverlay: true }),
        ),
      ),
    ),
  );
}

describe('theme1 command JSX smoke', () => {
  it('loads theme styles for smoke renders', async () => {
    await ensureThemeStylesLoaded(THEME_SLUG);
    expect(true).toBe(true);
  });

  it('eager-loads a JSX module for every overlay command file', () => {
    const renderableCommands = overlayCommands.filter((command) => command.category !== 'clear');
    const missing = renderableCommands.filter((command) => {
      const modulePath = `../themes/theme1/commands/${command.type}/${command.key}.jsx`;
      return !commandModules[modulePath]?.default;
    });

    expect(
      missing.map((command) => command.key),
      missing.map((command) => command.key).join(', '),
    ).toEqual([]);
  });

  it('renders every overlay command through GraphicRenderer without throwing', () => {
    const failures = [];

    for (const command of overlayCommands) {
      const { plan } = runGraphicPipeline(createRawSessionForCommand(command));

      if (command.category === 'clear') {
        if (plan === null) {
          failures.push(`${command.key}: expected clear plan`);
        }
        continue;
      }

      if (!plan) {
        failures.push(`${command.key}: null render plan`);
        continue;
      }

      try {
        const html = renderCommandTree(plan, command);
        if (!html || html.trim() === '') {
          failures.push(`${command.key}: empty markup`);
          continue;
        }

        const contentFailure = assertCommandMarkupContent(command, html, plan);
        if (contentFailure) {
          failures.push(`${command.key}: ${contentFailure}`);
        }
      } catch (error) {
        failures.push(`${command.key}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    expect(failures, failures.join('\n')).toEqual([]);
  });
});
