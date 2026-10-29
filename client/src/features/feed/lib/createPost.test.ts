import { describe, expect, it } from 'vitest';

import { COMPOSE_BACKGROUND_MAX_CHARS } from './composeBackgrounds';
import {
  createPostActiveBackground,
  createPostApiBackgroundId,
  createPostCanPublish,
  createPostCharLimit,
  POST_BODY_MAX_CHARS,
} from './createPost';

describe('createPostApiBackgroundId', () => {
  it('maps UI selection to API ids', () => {
    expect(createPostApiBackgroundId('plain')).toBeNull();
    expect(createPostApiBackgroundId('pitch')).toBe('pitch');
    expect(createPostApiBackgroundId('century')).toBe('century');
  });
});

describe('createPostActiveBackground', () => {
  it('forces plain when media is attached', () => {
    expect(createPostActiveBackground('pitch', 'hi', true)).toBe('plain');
  });

  it('keeps selection when caption is short and text-only', () => {
    expect(createPostActiveBackground('night', 'hi', false)).toBe('night');
  });
});

describe('createPostCharLimit', () => {
  it('uses the styled cap when a background is on', () => {
    expect(createPostCharLimit(true)).toBe(COMPOSE_BACKGROUND_MAX_CHARS);
    expect(createPostCharLimit(false)).toBe(POST_BODY_MAX_CHARS);
  });
});

describe('createPostCanPublish', () => {
  it('requires body or media and no over-limit', () => {
    expect(createPostCanPublish('', false, false)).toBe(false);
    expect(createPostCanPublish('hi', false, false)).toBe(true);
    expect(createPostCanPublish('', true, false)).toBe(true);
    expect(createPostCanPublish('hi', false, true)).toBe(false);
  });
});
