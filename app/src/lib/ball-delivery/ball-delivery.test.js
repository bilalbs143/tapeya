import { describe, expect, it } from 'vitest';

import { ballIsLegalDelivery, resolveBallChip } from '@/lib/utils/ballDisplay';

import fixtures from '../../../../shared/ball-delivery/fixtures.json';
import { getBallDisplay, presentBall } from '../../../../shared/ball-delivery/index.js';

describe('shared/ball-delivery', () => {
  it.each(fixtures.cases)('$name', ({ input, expected }) => {
    const presented = presentBall(input);
    for (const [key, value] of Object.entries(expected)) {
      expect(presented[key], key).toBe(value);
    }
  });

  it('getBallDisplay uses bullet for dot in over strip', () => {
    const { label, variant } = getBallDisplay({ runs: 0 }, { dotStyle: 'bullet' });
    expect(label).toBe('•');
    expect(variant).toBe('dot');
  });

  it('normalizes UI wide ball', () => {
    const p = presentBall({ type: 'wd', runs: 2 });
    expect(p.display_token).toBe('1WD');
    expect(p.chip_type).toBe('wide');
  });

  it('resolveBallChip prefers API presentation', () => {
    const chip = resolveBallChip(
      {
        presentation: {
          display_token: '2WD+W',
          label: '2WD+W',
          chip_type: 'wicket',
          variant: 'wicket',
          is_legal: false,
        },
      },
      { dotStyle: 'bullet' },
    );
    expect(chip.label).toBe('2WD+W');
    expect(chip.variant).toBe('wicket');
    expect(chip.chipType).toBe('wicket');
  });

  it('resolveBallChip applies bullet for dot presentation', () => {
    const chip = resolveBallChip(
      {
        presentation: {
          display_token: '0',
          label: '0',
          chip_type: 'dot',
          variant: 'dot',
        },
      },
      { dotStyle: 'bullet' },
    );
    expect(chip.label).toBe('•');
  });

  it('ballIsLegalDelivery prefers presentation.is_legal', () => {
    expect(ballIsLegalDelivery({ presentation: { is_legal: false }, runs: 1 })).toBe(false);
    expect(ballIsLegalDelivery({ presentation: { is_legal: true }, runs: 0 })).toBe(true);
  });
});
