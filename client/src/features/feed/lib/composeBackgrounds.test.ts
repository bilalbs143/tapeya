import { describe, expect, it } from 'vitest';

import {
  canUseComposeBackgrounds,
  COMPOSE_BACKGROUND_MAX_CHARS,
  resolveBackgroundIdForSubmit,
} from './composeBackgrounds';

describe('canUseComposeBackgrounds', () => {
  it('allows short text without media', () => {
    expect(canUseComposeBackgrounds('hi', false)).toBe(true);
    expect(canUseComposeBackgrounds('x'.repeat(COMPOSE_BACKGROUND_MAX_CHARS), false)).toBe(true);
  });

  it('blocks media or over-limit body', () => {
    expect(canUseComposeBackgrounds('hi', true)).toBe(false);
    expect(canUseComposeBackgrounds('x'.repeat(COMPOSE_BACKGROUND_MAX_CHARS + 1), false)).toBe(false);
  });
});

describe('resolveBackgroundIdForSubmit', () => {
  it('omits plain and null', () => {
    expect(resolveBackgroundIdForSubmit({ backgroundId: null, body: 'hi' })).toBeUndefined();
    expect(resolveBackgroundIdForSubmit({ backgroundId: 'plain', body: 'hi' })).toBeUndefined();
  });

  it('keeps styled id when allowed', () => {
    expect(resolveBackgroundIdForSubmit({ backgroundId: 'pitch', body: 'hi' })).toBe('pitch');
  });

  it('drops styled id when over limit or has media', () => {
    expect(
      resolveBackgroundIdForSubmit({
        backgroundId: 'pitch',
        body: 'x'.repeat(COMPOSE_BACKGROUND_MAX_CHARS + 1),
      })
    ).toBeUndefined();
    expect(resolveBackgroundIdForSubmit({ backgroundId: 'night', body: 'hi', hasMedia: true })).toBeUndefined();
  });
});
