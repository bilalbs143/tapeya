import { describe, expect, it } from 'vitest';

import { resolvePointTableRowHeight } from '@/graphics/themes/theme1/layouts/full-screen/pointTableLayout';

describe('resolvePointTableRowHeight', () => {
  it('caps row height for few teams instead of stretching to fill canvas', () => {
    expect(resolvePointTableRowHeight(4)).toBe(88);
    expect(resolvePointTableRowHeight(3)).toBe(88);
  });

  it('uses balanced height for medium-sized tables', () => {
    expect(resolvePointTableRowHeight(8)).toBe(87);
    expect(resolvePointTableRowHeight(10)).toBe(68);
  });

  it('uses compact minimum for large tables', () => {
    expect(resolvePointTableRowHeight(14)).toBe(56);
    expect(resolvePointTableRowHeight(20)).toBe(56);
  });

  it('returns minimum for empty tables', () => {
    expect(resolvePointTableRowHeight(0)).toBe(56);
  });
});
