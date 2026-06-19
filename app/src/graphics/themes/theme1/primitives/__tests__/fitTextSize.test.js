import { describe, expect, it } from 'vitest';

import { findFitFontSize } from '../fitTextSize';

describe('findFitFontSize', () => {
  it('returns max size when text already fits', () => {
    const size = findFitFontSize(() => 200, 300, 46, 22);
    expect(size).toBe(46);
  });

  it('scales down until text fits the width', () => {
    const widths = {
      46: 420,
      45: 410,
      44: 390,
      43: 360,
      42: 320,
      41: 290,
    };

    const size = findFitFontSize((px) => widths[px] ?? 0, 300, 46, 22);
    expect(size).toBe(41);
  });

  it('never goes below min font size', () => {
    const size = findFitFontSize(() => 9999, 300, 46, 22);
    expect(size).toBe(22);
  });
});
