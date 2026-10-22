import { describe, expect, it } from 'vitest';

import {
  FALLBACK_TOSS,
  matchTossSubtitle,
  resolveTossChoseTo,
  resolveTossDecisions,
  tossSummaryLine,
} from './matchToss';

describe('resolveTossDecisions', () => {
  it('uses API options when present, else fallback', () => {
    expect(resolveTossDecisions([{ value: 'bat', label: 'Bat First' }])).toEqual([
      { value: 'bat', label: 'Bat First' },
    ]);
    expect(resolveTossDecisions([])).toEqual([...FALLBACK_TOSS]);
  });
});

describe('resolveTossChoseTo', () => {
  it('only accepts bat/bowl', () => {
    expect(resolveTossChoseTo('bat')).toBe('bat');
    expect(resolveTossChoseTo('bowl')).toBe('bowl');
    expect(resolveTossChoseTo('field')).toBeNull();
  });
});

describe('matchTossSubtitle', () => {
  it('joins shorts, overs, venue', () => {
    expect(matchTossSubtitle('LHQ', 'MUL', 20, 'Gaddafi')).toBe('LHQ vs MUL · 20 overs · Gaddafi');
    expect(matchTossSubtitle('LHQ', 'MUL', null, null)).toBe('LHQ vs MUL');
  });
});

describe('tossSummaryLine', () => {
  it('lowercases the decision label', () => {
    expect(tossSummaryLine('LHQ', 'Bat')).toBe('LHQ won the toss and elected to bat.');
  });
});
