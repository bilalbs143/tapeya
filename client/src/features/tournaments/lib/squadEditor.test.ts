import { describe, expect, it } from 'vitest';

import { squadEditorFillPct, squadEditorShortCount, squadEditorSubtitle } from './squadEditor';

describe('squadEditor', () => {
  it('computes fill percent against the XI floor', () => {
    expect(squadEditorFillPct(0)).toBe(0);
    expect(squadEditorFillPct(11)).toBe(100);
    expect(squadEditorFillPct(22)).toBe(100);
    expect(squadEditorFillPct(6)).toBe(55);
  });

  it('counts how many players short of XI', () => {
    expect(squadEditorShortCount(0)).toBe(11);
    expect(squadEditorShortCount(11)).toBe(0);
    expect(squadEditorShortCount(14)).toBe(0);
  });

  it('builds the screen subtitle', () => {
    expect(
      squadEditorSubtitle({
        emptySquad: true,
        teamName: 'Aces',
        tournamentName: 'Cup',
        readyCount: 0,
        teamsCount: 4,
      })
    ).toBe('Aces · No players yet');
    expect(
      squadEditorSubtitle({
        emptySquad: false,
        teamName: 'Aces',
        tournamentName: 'Cup',
        readyCount: 1,
        teamsCount: 4,
      })
    ).toBe('Cup · 1 of 4 ready');
  });
});
