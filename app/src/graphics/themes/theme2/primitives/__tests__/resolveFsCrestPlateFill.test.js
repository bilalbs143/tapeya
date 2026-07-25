import { describe, expect, it } from 'vitest';

import { colors } from '../../config';
import { resolveFsCrestPlateFill } from '../resolveFsCrestPlateFill';

describe('resolveFsCrestPlateFill', () => {
  it('uses wine panelPlayer for tournament crests', () => {
    expect(resolveFsCrestPlateFill({ variant: 'tournament', accent: '#0055ff' })).toBe(colors.panelPlayer);
  });

  it('prefers accent then team.color for team crests', () => {
    expect(resolveFsCrestPlateFill({ variant: 'team', accent: '#112233' })).toBe('#112233');
    expect(resolveFsCrestPlateFill({ variant: 'team', team: { color: '#445566' } })).toBe('#445566');
  });

  it('falls back to wine when team accent is missing', () => {
    expect(resolveFsCrestPlateFill({ variant: 'team' })).toBe(colors.panelPlayer);
  });
});
