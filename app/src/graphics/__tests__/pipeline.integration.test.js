import { describe, expect, it } from 'vitest';

import { FullScreenShell } from '@/graphics/exit/shells/FullScreenShell';
import { LowerThirdShell } from '@/graphics/exit/shells/LowerThirdShell';
import { resolveDisplayModeShell } from '@/graphics/exit/themeRegistry';

import manifest from '../../../../shared/graphics-command-manifest.json';
import { createRawSession, createRawSessionForCommand, runGraphicPipeline, THEME_SLUG } from './pipelineFixtures';

describe('graphics pipeline integration', () => {
  it('normalizes → processes → resolves theme component for LT_DEFAULT', () => {
    const { snapshot, plan, component, themeMeta } = runGraphicPipeline(createRawSession());

    expect(snapshot?.commandKey).toBe('LT_DEFAULT');
    expect(plan).toMatchObject({
      commandKey: 'LT_DEFAULT',
      commandType: 'LOWER_THIRD',
      displayMode: 'LT',
      themeSlug: THEME_SLUG,
      contextHash: 'integration-fixture-hash',
    });
    expect(plan?.componentProps).toMatchObject({
      battingTeam: expect.objectContaining({ score: '120-3' }),
    });
    expect(plan?.tokens.enableImages).toBe(true);
    expect(component).not.toBeNull();
    expect(themeMeta?.ThemeRoot).toBeTypeOf('function');
    expect(resolveDisplayModeShell(plan?.displayMode)).toBe(LowerThirdShell);
  });

  it('resolves full-screen commands with FS shell', () => {
    const { plan, component } = runGraphicPipeline(
      createRawSession({
        active_command: {
          command_key: 'PLAYING_11',
          command_type: 'FULL_SCREEN',
          display_mode: 'FS',
          payload: {
            home_team: { players: [{ name: 'Player A' }] },
            away_team: { players: [{ name: 'Player B' }] },
          },
        },
      }),
    );

    expect(plan?.displayMode).toBe('FS');
    expect(plan?.componentProps.homeTeam.players).toEqual([{ name: 'Player A' }]);
    expect(component).not.toBeNull();
    expect(resolveDisplayModeShell('FS')).toBe(FullScreenShell);
  });

  it('wires FST animation commands to scoreboard props with event kind', () => {
    const { plan, component } = runGraphicPipeline(
      createRawSession({
        active_command: {
          command_key: 'FST_FOUR',
          command_type: 'FULL_SCREEN_TRANSITION',
          display_mode: null,
        },
      }),
    );

    expect(plan?.componentProps).toMatchObject({
      battingTeam: expect.objectContaining({ score: '120-3' }),
      event: { kind: 'four' },
    });
    expect(component).not.toBeNull();
  });

  it('returns null plan when processor signals no render', () => {
    const { plan, component } = runGraphicPipeline(
      createRawSession({
        active_command: { command_key: 'WAGON_WHEEL', command_type: 'FULL_SCREEN', display_mode: 'FS' },
        context: { match: { wagon_wheel_enabled: false } },
      }),
    );

    expect(plan).toBeNull();
    expect(component).toBeNull();
  });

  it('smokes every manifest overlay key through normalize → process → registry', () => {
    const overlayCommands = manifest.commands.filter(
      (command) => command.status !== 'pending_full_stack' && command.category !== 'backoffice_only',
    );

    const failures = [];

    for (const command of overlayCommands) {
      const rawSession = createRawSessionForCommand(command);

      const { plan, component, themeMeta } = runGraphicPipeline(rawSession);

      if (command.category === 'clear') {
        if (plan === null) failures.push(`${command.key}: expected clear plan, got null`);
        continue;
      }

      if (plan === null) {
        failures.push(`${command.key}: processGraphicCommand returned null`);
        continue;
      }

      if (!component) {
        failures.push(`${command.key}: themeRegistry returned null component`);
        continue;
      }

      if (!themeMeta?.ThemeRoot) {
        failures.push(`${command.key}: missing ThemeRoot for ${THEME_SLUG}`);
      }
    }

    expect(failures, failures.join('\n')).toEqual([]);
  });
});
