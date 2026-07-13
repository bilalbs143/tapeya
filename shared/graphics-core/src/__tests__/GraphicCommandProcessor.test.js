import { describe, expect, it } from 'vitest';

import { processGraphicCommand } from '../GraphicCommandProcessor.js';
import { createTestSnapshot } from '../processors/__tests__/fixtures.js';

describe('processGraphicCommand', () => {
  it('returns null when commandKey is missing', () => {
    const snapshot = createTestSnapshot({ active_command: { command_key: null } });
    expect(processGraphicCommand(snapshot)).toBeNull();
  });

  it('builds a render plan for LT_DEFAULT', () => {
    const snapshot = createTestSnapshot({ active_command: { command_key: 'LT_DEFAULT' } });
    const plan = processGraphicCommand(snapshot);

    expect(plan).not.toBeNull();
    expect(plan?.commandKey).toBe('LT_DEFAULT');
    expect(plan?.themeSlug).toBe('theme1');
    expect(plan?.componentProps).toMatchObject({
      battingTeam: expect.objectContaining({ score: '120-3' }),
    });
    expect(plan?.tokens).toEqual(snapshot.config);
  });

  it('returns null when processor signals no render (wagon wheel disabled)', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'WAGON_WHEEL' },
      context: {
        match: { wagon_wheel_enabled: false },
      },
    });

    expect(processGraphicCommand(snapshot)).toBeNull();
  });

  it('returns empty componentProps for LT_EMPTY clear command', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'LT_EMPTY', command_type: 'LOWER_THIRD', display_mode: 'LT' },
    });
    const plan = processGraphicCommand(snapshot);

    expect(plan).not.toBeNull();
    expect(plan?.componentProps).toEqual({});
  });
});
