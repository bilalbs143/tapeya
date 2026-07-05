import { describe, expect, it } from 'vitest';

import { formatBroadcastBowlingFigures, parseBowlingFigures } from '../player';

describe('formatBroadcastBowlingFigures', () => {
  it('converts API slash figures to hyphen broadcast format', () => {
    expect(formatBroadcastBowlingFigures('2/28')).toBe('2-28');
    expect(formatBroadcastBowlingFigures('1 / 20')).toBe('1-20');
  });

  it('falls back to w/r fields when figures string is absent', () => {
    expect(formatBroadcastBowlingFigures(null, { w: 2, r: 35 })).toBe('2-35');
  });
});

describe('parseBowlingFigures', () => {
  it('parses hyphen broadcast figures from API', () => {
    expect(parseBowlingFigures('2-28')).toEqual({ wickets: 2, runs: 28 });
    expect(parseBowlingFigures('1 - 20')).toEqual({ wickets: 1, runs: 20 });
  });

  it('parses wickets/runs from standard slash figures', () => {
    expect(parseBowlingFigures('2/35')).toEqual({ wickets: 2, runs: 35 });
  });

  it('parses figures with optional spaces around the slash', () => {
    expect(parseBowlingFigures('1 / 12')).toEqual({ wickets: 1, runs: 12 });
  });

  it('parses figures with optional surrounding whitespace', () => {
    expect(parseBowlingFigures('  1/12  ')).toEqual({ wickets: 1, runs: 12 });
    expect(parseBowlingFigures('  2-28  ')).toEqual({ wickets: 2, runs: 28 });
  });

  it('returns nulls for unparseable input', () => {
    expect(parseBowlingFigures('')).toEqual({ wickets: null, runs: null });
    expect(parseBowlingFigures(null)).toEqual({ wickets: null, runs: null });
    expect(parseBowlingFigures('no figures')).toEqual({ wickets: null, runs: null });
  });
});
