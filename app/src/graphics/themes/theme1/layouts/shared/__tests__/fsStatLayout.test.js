import { describe, expect, it } from 'vitest';

import { fsStatTile } from '../../../config';
import { resolveFsStatLayout } from '../fsStatLayout';

describe('resolveFsStatLayout', () => {
  const columnH = fsStatTile.columnMaxHeight;

  function stackH(layout, statCount) {
    return statCount * layout.tileH + (statCount - 1) * layout.gap;
  }

  it('fills the full avatar column height for a short stat stack', () => {
    const layout = resolveFsStatLayout(5);

    expect(layout.columnH).toBe(columnH);
    expect(layout.tileH).toBeGreaterThan(fsStatTile.height);
    expect(stackH(layout, 5)).toBeLessThanOrEqual(columnH);
    expect(layout.paddingY).toBeGreaterThanOrEqual(fsStatTile.denseTilePaddingY);
  });

  it('compresses tournament-sized stacks to fill the avatar column', () => {
    const layout = resolveFsStatLayout(8);

    expect(layout.tileH).toBeLessThan(fsStatTile.height);
    expect(stackH(layout, 8)).toBeLessThanOrEqual(columnH);
  });

  it('compresses match-sized stacks to fill the avatar column', () => {
    const layout = resolveFsStatLayout(9);

    expect(layout.tileH).toBeLessThan(fsStatTile.height);
    expect(stackH(layout, 9)).toBeLessThanOrEqual(columnH);
  });

  it('balances insets so label and value fit inside compressed tiles', () => {
    for (const count of [5, 8, 9, 14]) {
      const layout = resolveFsStatLayout(count);
      const contentH = layout.labelSize + layout.valueSize + layout.labelGap + layout.paddingY * 2;

      expect(contentH).toBeLessThanOrEqual(layout.tileH);
      expect(layout.paddingY).toBeGreaterThanOrEqual(6);
      expect(stackH(layout, count)).toBeLessThanOrEqual(columnH);
    }
  });
});
