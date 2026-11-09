import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  bindReelHls,
  claimReelPlayback,
  killReelPlayback,
  registerReelVideo,
  releaseReelPlayback,
  resumeReelHlsLoading,
} from './reelPlaybackGate';

function fakeVideo(paused = true): HTMLVideoElement {
  const video = {
    paused,
    muted: false,
    defaultMuted: false,
    currentTime: 1.5,
    src: '',
    play: vi.fn(async () => {
      video.paused = false;
    }),
    pause: vi.fn(() => {
      video.paused = true;
    }),
    setAttribute: vi.fn(),
    removeAttribute: vi.fn(),
    getAttribute: vi.fn(() => null),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    load: vi.fn(),
  } as unknown as HTMLVideoElement & { paused: boolean };
  return video;
}

describe('reelPlaybackGate', () => {
  const cleanups: Array<() => void> = [];

  afterEach(() => {
    while (cleanups.length) cleanups.pop()?.();
  });

  it('hard-kills the former owner on claim so MSE audio cannot linger', () => {
    const a = fakeVideo(false);
    const b = fakeVideo(true);
    cleanups.push(registerReelVideo(a), registerReelVideo(b));

    const hlsA = {
      media: a,
      stopLoad: vi.fn(),
      startLoad: vi.fn(),
      detachMedia: vi.fn(),
      attachMedia: vi.fn(),
    };
    bindReelHls(a, hlsA as never);

    claimReelPlayback(a);
    claimReelPlayback(b);

    expect(hlsA.stopLoad).toHaveBeenCalled();
    expect(hlsA.detachMedia).toHaveBeenCalled();
    expect(a.pause).toHaveBeenCalled();
    expect(a.muted).toBe(true);
  });

  it('releaseReelPlayback detaches media even when already paused', () => {
    const video = fakeVideo(true);
    cleanups.push(registerReelVideo(video));
    const hls = {
      media: video,
      stopLoad: vi.fn(),
      startLoad: vi.fn(),
      detachMedia: vi.fn(),
      attachMedia: vi.fn(),
    };
    bindReelHls(video, hls as never);

    claimReelPlayback(video);
    releaseReelPlayback(video);

    expect(hls.detachMedia).toHaveBeenCalled();
  });

  it('resumeReelHlsLoading reattaches after detach', () => {
    const video = fakeVideo(true);
    const hls = {
      media: null as HTMLVideoElement | null,
      stopLoad: vi.fn(),
      startLoad: vi.fn(),
      detachMedia: vi.fn(),
      attachMedia: vi.fn((el: HTMLVideoElement) => {
        hls.media = el;
      }),
    };
    bindReelHls(video, hls as never);

    resumeReelHlsLoading(video);

    expect(hls.attachMedia).toHaveBeenCalledWith(video);
    expect(hls.startLoad).toHaveBeenCalledWith(-1);
  });

  it('killReelPlayback is a no-op without hls binding', () => {
    const video = fakeVideo(false);
    expect(() => killReelPlayback(video)).not.toThrow();
    expect(video.pause).toHaveBeenCalled();
  });
});
