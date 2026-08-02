import { describe, expect, it } from 'vitest';

import {
  canUseComposeBackgrounds,
  COMPOSE_BACKGROUND_INPUT_IDS,
  COMPOSE_BACKGROUND_MAX_CHARS,
  COMPOSE_TEXT_BACKGROUNDS,
  PERSISTED_BACKGROUND_IDS,
  resolveBackgroundIdForSubmit,
  RETIRED_COMPOSE_BACKGROUND_IDS,
  SELECTABLE_COMPOSE_TEXT_BACKGROUNDS,
} from '../composeBackgrounds';
import { CRICKET_ICON_MAP } from '../cricketPatternIconMap';
import { CRICKET_PATTERN_LAYOUTS } from '../cricketPatternLayouts';

/** Mirror of api/app/Enums/Post/PostBackgroundId::inputValues() */
const API_INPUT_VALUES = ['plain', 'pitch', 'night', 'gold', 'boundary', 'bats', 'balls', 'wickets', 'century'];

describe('compose backgrounds allow-list', () => {
  it('matches API PostBackgroundId::inputValues()', () => {
    expect([...COMPOSE_BACKGROUND_INPUT_IDS].sort()).toEqual([...API_INPUT_VALUES].sort());
  });

  it('has a config entry for every input id', () => {
    const ids = COMPOSE_TEXT_BACKGROUNDS.map((b) => b.id);
    expect(ids).toEqual(COMPOSE_BACKGROUND_INPUT_IDS);
  });

  it('retires Stadium Lights from compose without breaking existing posts', () => {
    expect(RETIRED_COMPOSE_BACKGROUND_IDS).toContain('bats');
    expect(SELECTABLE_COMPOSE_TEXT_BACKGROUNDS.map((b) => b.id)).not.toContain('bats');
    expect(COMPOSE_TEXT_BACKGROUNDS.map((b) => b.id)).toContain('bats');
  });

  it('persisted ids exclude plain', () => {
    expect(PERSISTED_BACKGROUND_IDS).not.toContain('plain');
    expect(PERSISTED_BACKGROUND_IDS).toHaveLength(API_INPUT_VALUES.length - 1);
  });
});

describe('pattern integrity', () => {
  const styled = COMPOSE_TEXT_BACKGROUNDS.filter((b) => b.id !== 'plain');

  it('every styled background has pattern, overlay, and text class', () => {
    for (const bg of styled) {
      expect(bg.pattern, bg.id).toBeTruthy();
      expect(bg.overlayClassName, bg.id).toBeTruthy();
      expect(bg.textClassName, bg.id).toBeTruthy();
      expect(CRICKET_PATTERN_LAYOUTS[bg.pattern], `${bg.id} layout`).toBeTruthy();
    }
  });

  it('every layout icon exists in CRICKET_ICON_MAP', () => {
    for (const [patternId, items] of Object.entries(CRICKET_PATTERN_LAYOUTS)) {
      expect(items.length).toBeGreaterThanOrEqual(5);
      for (const item of items) {
        expect(CRICKET_ICON_MAP[item.icon], `${patternId}:${item.icon}`).toBeTypeOf('function');
      }
    }
  });

  it('layout keys match styled background pattern ids', () => {
    const patternIds = styled.map((b) => b.pattern).sort();
    expect(Object.keys(CRICKET_PATTERN_LAYOUTS).sort()).toEqual(patternIds);
  });
});

describe('canUseComposeBackgrounds', () => {
  it('allows short text without media', () => {
    expect(canUseComposeBackgrounds('hi', false)).toBe(true);
    expect(canUseComposeBackgrounds('x'.repeat(COMPOSE_BACKGROUND_MAX_CHARS), false)).toBe(true);
  });

  it('blocks media or long text', () => {
    expect(canUseComposeBackgrounds('hi', true)).toBe(false);
    expect(canUseComposeBackgrounds('x'.repeat(COMPOSE_BACKGROUND_MAX_CHARS + 1), false)).toBe(false);
  });
});

describe('resolveBackgroundIdForSubmit', () => {
  it('omits plain / missing / unknown', () => {
    expect(resolveBackgroundIdForSubmit({ backgroundId: 'plain', body: 'hi' })).toBeUndefined();
    expect(resolveBackgroundIdForSubmit({ backgroundId: undefined, body: 'hi' })).toBeUndefined();
    expect(resolveBackgroundIdForSubmit({ backgroundId: 'neon', body: 'hi' })).toBeUndefined();
  });

  it('returns persisted id for short text', () => {
    expect(resolveBackgroundIdForSubmit({ backgroundId: 'pitch', body: 'Six!' })).toBe('pitch');
  });

  it('clears when media or text too long even if bg selected', () => {
    expect(resolveBackgroundIdForSubmit({ backgroundId: 'pitch', body: 'hi', hasMedia: true })).toBeUndefined();
    expect(
      resolveBackgroundIdForSubmit({
        backgroundId: 'gold',
        body: 'x'.repeat(COMPOSE_BACKGROUND_MAX_CHARS + 1),
      }),
    ).toBeUndefined();
  });
});
