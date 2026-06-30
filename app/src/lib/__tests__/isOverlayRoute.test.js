import { describe, expect, it } from 'vitest';

import { isOverlayRoute } from '../isOverlayRoute';

describe('isOverlayRoute', () => {
  it('detects overlay paths', () => {
    expect(isOverlayRoute('/overlay/3')).toBe(true);
    expect(isOverlayRoute('/overlay/')).toBe(true);
    expect(isOverlayRoute('/home')).toBe(false);
  });
});
