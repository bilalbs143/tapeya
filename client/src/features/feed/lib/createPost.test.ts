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
  it('maps UI tokens to API ids', () => {
    expect(createPostApiBackgroundId('none')).toBeNull();
    expect(createPostApiBackgroundId('turf')).toBe('pitch');
    expect(createPostApiBackgroundId('floodlit')).toBe('night');
  });
});

describe('createPostActiveBackground', () => {
  it('forces plain when media is attached', () => {
    expect(createPostActiveBackground('turf', 'hi', true)).toBe('none');
  });

  it('keeps selection when caption is short and text-only', () => {
    expect(createPostActiveBackground('floodlit', 'hi', false)).toBe('floodlit');
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
