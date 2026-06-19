import { describe, expect, it } from 'vitest';

import { parseBowlingFigures } from '../player';

describe('parseBowlingFigures', () => {
  it('parses wickets/runs from standard figures', () => {
    expect(parseBowlingFigures('2/35')).toEqual({ wickets: 2, runs: 35 });
  });

  it('parses figures with optional spaces around the slash', () => {
    expect(parseBowlingFigures('1 / 12')).toEqual({ wickets: 1, runs: 12 });
  });

  it('does not parse leading or trailing whitespace on the full string', () => {
    expect(parseBowlingFigures('  1/12  ')).toEqual({ wickets: null, runs: null });
  });

  it('returns nulls for unparseable input', () => {
    expect(parseBowlingFigures('')).toEqual({ wickets: null, runs: null });
    expect(parseBowlingFigures(null)).toEqual({ wickets: null, runs: null });
    expect(parseBowlingFigures('no figures')).toEqual({ wickets: null, runs: null });
  });
});
