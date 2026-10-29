import { describe, expect, it } from 'vitest';

import {
  canUseComposeBackgrounds,
  COMPOSE_BACKGROUND_MAX_CHARS,
  COMPOSE_TEXT_BACKGROUNDS,
  POST_BACKGROUND_IDS,
  resolveBackgroundIdForSubmit,
  SELECTABLE_COMPOSE_TEXT_BACKGROUNDS,
} from './composeBackgrounds';

describe('catalog', () => {
  it('covers every persisted API id plus plain', () => {
    const ids = COMPOSE_TEXT_BACKGROUNDS.map((b) => b.id);
    expect(ids).toContain('plain');
    for (const id of POST_BACKGROUND_IDS) {
      expect(ids).toContain(id);
    }
  });

  it('hides retired bats from the picker but keeps it renderable', () => {
    expect(SELECTABLE_COMPOSE_TEXT_BACKGROUNDS.map((b) => b.id)).not.toContain('bats');
    expect(COMPOSE_TEXT_BACKGROUNDS.map((b) => b.id)).toContain('bats');
  });
});

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
    expect(resolveBackgroundIdForSubmit({ backgroundId: 'century', body: 'hi' })).toBe('century');
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
