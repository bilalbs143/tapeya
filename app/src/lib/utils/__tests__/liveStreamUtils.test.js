import { describe, expect, it } from 'vitest';

import { getStreamOrientation, isSelfServeLiveBroadcast } from '../liveStreamUtils';

describe('getStreamOrientation', () => {
  it('returns the API orientation value when present', () => {
    expect(getStreamOrientation({ orientation: 'landscape' })).toBe('landscape');
    expect(getStreamOrientation({ orientation: 'portrait' })).toBe('portrait');
  });

  it('defaults missing values to portrait (API column default)', () => {
    expect(getStreamOrientation(null)).toBe('portrait');
    expect(getStreamOrientation(undefined)).toBe('portrait');
    expect(getStreamOrientation({})).toBe('portrait');
    expect(getStreamOrientation({ orientation: null })).toBe('portrait');
    expect(getStreamOrientation({ orientation: '' })).toBe('portrait');
  });
});

describe('isSelfServeLiveBroadcast', () => {
  it('prefers is_self_serve from the API', () => {
    expect(isSelfServeLiveBroadcast({ is_self_serve: true })).toBe(true);
    expect(isSelfServeLiveBroadcast({ is_self_serve: false, broadcaster: { id: 1 } })).toBe(false);
  });
});
