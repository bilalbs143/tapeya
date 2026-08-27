import { describe, expect, it } from 'vitest';

import { isPrimaryTabActive } from '../primaryTabs';

describe('isPrimaryTabActive', () => {
  it('highlights reels feed only — not creator profiles', () => {
    expect(isPrimaryTabActive('/reels', '/reels', 71)).toBe(true);
    expect(isPrimaryTabActive('/reels/12', '/reels', 71)).toBe(true);
    expect(isPrimaryTabActive('/reels/u/71', '/reels', 71)).toBe(false);
    expect(isPrimaryTabActive('/reels/upload', '/reels', 71)).toBe(false);
  });

  it('highlights own creator profile and edit account as Profile', () => {
    expect(isPrimaryTabActive('/reels/u/71', '/reels/u/71', 71)).toBe(true);
    expect(isPrimaryTabActive('/profile', '/reels/u/71', 71)).toBe(true);
    expect(isPrimaryTabActive('/reels/u/99', '/reels/u/71', 71)).toBe(false);
    expect(isPrimaryTabActive('/home', '/reels/u/71', 71)).toBe(false);
  });
});
