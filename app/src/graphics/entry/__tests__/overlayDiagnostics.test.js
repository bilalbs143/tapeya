import { describe, expect, it } from 'vitest';

import { mixColorWithTransparent } from '../../shared/accentColor';
import { describeGateBlock, isOverlayDiagnosticsEnabled } from '../overlayDiagnostics';

describe('overlayDiagnostics', () => {
  it('enables via overlayDebug query param', () => {
    const params = new URLSearchParams('expires=1&signature=abc&overlayDebug=1');
    expect(isOverlayDiagnosticsEnabled(params)).toBe(true);
    expect(isOverlayDiagnosticsEnabled(new URLSearchParams('expires=1'))).toBe(false);
  });

  it('describes gate blocks', () => {
    expect(describeGateBlock('session_error')).toContain('session');
  });
});

describe('overlayDiagnostics accent via shared', () => {
  it('mixes hex without color-mix', () => {
    expect(mixColorWithTransparent('#5b7cff', 33)).toBe('#5b7cff54');
  });
});
