import { describe, expect, it } from 'vitest';

import { resolveOfficialNames } from '../officialsLTBar.helpers';

describe('resolveOfficialNames', () => {
  it('uses names array when provided', () => {
    expect(resolveOfficialNames({ names: ['A', 'B'] })).toEqual(['A', 'B']);
  });

  it('splits multiline text', () => {
    expect(resolveOfficialNames({ text: 'John Smith\nJane Doe' })).toEqual(['John Smith', 'Jane Doe']);
  });

  it('splits pipe-separated text', () => {
    expect(resolveOfficialNames({ text: 'A | B | C' })).toEqual(['A', 'B', 'C']);
  });
});
