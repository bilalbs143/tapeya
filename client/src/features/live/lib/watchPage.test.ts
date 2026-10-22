import { describe, expect, it } from 'vitest';

import {
  watchAllowRotate,
  watchChatLive,
  watchIsUrlStream,
  watchLiveChatGloballyEnabled,
  watchPortraitSelfServeLive,
  watchViewerLabel,
} from './watchPage';

describe('watchIsUrlStream', () => {
  it('detects a pasted streaming URL', () => {
    expect(watchIsUrlStream({ streamingUrl: 'https://youtu.be/abc' })).toBe(true);
    expect(watchIsUrlStream({ streamingUrl: '  ' })).toBe(false);
    expect(watchIsUrlStream(null)).toBe(false);
  });
});

describe('watchPortraitSelfServeLive', () => {
  const base = {
    isSelfServe: true,
    status: 'live' as const,
    orientation: 'portrait',
    streamingUrl: null as string | null,
  };

  it('is true only for portrait self-serve live without a watch URL', () => {
    expect(watchPortraitSelfServeLive(base as never)).toBe(true);
    expect(watchPortraitSelfServeLive({ ...base, streamingUrl: 'https://x' } as never)).toBe(false);
    expect(watchPortraitSelfServeLive({ ...base, orientation: 'landscape' } as never)).toBe(false);
  });
});

describe('watchAllowRotate', () => {
  it('blocks rotate for portrait self-serve', () => {
    expect(watchAllowRotate(true)).toBe(false);
    expect(watchAllowRotate(false)).toBe(true);
  });
});

describe('watchChatLive', () => {
  it('allows chat while live or starting', () => {
    expect(watchChatLive('live')).toBe(true);
    expect(watchChatLive('starting')).toBe(true);
    expect(watchChatLive('ended')).toBe(false);
  });
});

describe('watchLiveChatGloballyEnabled', () => {
  it('defaults on and only disables on 0', () => {
    expect(watchLiveChatGloballyEnabled(undefined)).toBe(true);
    expect(watchLiveChatGloballyEnabled('1')).toBe(true);
    expect(watchLiveChatGloballyEnabled('0')).toBe(false);
  });
});

describe('watchViewerLabel', () => {
  it('hides zero and disabled presence', () => {
    expect(watchViewerLabel(false, 12)).toBeNull();
    expect(watchViewerLabel(true, 0)).toBeNull();
    expect(watchViewerLabel(true, 12)).toBeTruthy();
  });
});
