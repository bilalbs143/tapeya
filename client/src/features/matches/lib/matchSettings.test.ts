import { describe, expect, it } from 'vitest';

import {
  linesOf,
  matchSettingsBarSubtitle,
  matchSettingsFooterNote,
  officialsNameHint,
  wagonWheelStatusHint,
} from './matchSettings';

describe('linesOf', () => {
  it('splits trimmed non-empty lines', () => {
    expect(linesOf('  Ali \n\n  Bilal\n')).toEqual(['Ali', 'Bilal']);
  });
});

describe('officialsNameHint', () => {
  it('labels zero, one, and many', () => {
    expect(officialsNameHint(0)).toBe('None yet');
    expect(officialsNameHint(1)).toBe('1 name');
    expect(officialsNameHint(3)).toBe('3 names');
  });
});

describe('wagonWheelStatusHint', () => {
  it('reflects on/off', () => {
    expect(wagonWheelStatusHint(true)).toBe('On · adds one tap per scoring shot');
    expect(wagonWheelStatusHint(false)).toBe('Off · Stats tab stays empty');
  });
});

describe('matchSettingsBarSubtitle', () => {
  it('joins shorts with saves-as-you-go', () => {
    expect(matchSettingsBarSubtitle('LHQ', 'MUL')).toBe('LHQ vs MUL · Saves as you go');
  });
});

describe('matchSettingsFooterNote', () => {
  it('differs for read-only vs operator', () => {
    expect(matchSettingsFooterNote(true)).toBe("View-only — you can see settings but can't change them.");
    expect(matchSettingsFooterNote(false)).toBe("View-only users see this screen but can't change anything on it.");
  });
});
