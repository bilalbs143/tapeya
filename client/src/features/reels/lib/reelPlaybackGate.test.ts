import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  attachReelHls,
  bindReelHls,
  claimReelPlayback,
  registerReelVideo,
  releaseReelPlayback,
} from './reelPlaybackGate';

function fakeVideo(paused = true): HTMLVideoElement {
  const video = {
    paused,
    muted: false,
    defaultMuted: false,
    currentTime: 1.5,
    play: vi.fn(async () => {
      video.paused = false;
    }),
    pause: vi.fn(() => {
      video.paused = true;
    }),
    setAttribute: vi.fn(),
    removeAttribute: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as HTMLVideoElement & { paused: boolean };
  return video;
}

function fakeHls(media: HTMLVideoElement | null) {
  return {
    media,
    stopLoad: vi.fn(),
    startLoad: vi.fn(),
    detachMedia: vi.fn(),
    attachMedia: vi.fn(),
  };
}

describe('reelPlaybackGate', () => {
  const cleanups: Array<() => void> = [];

  afterEach(() => {
    while (cleanups.length) cleanups.pop()?.();
  });

  it('detaches the former owner when another reel claims playback', () => {
    const a = fakeVideo(false);
    const b = fakeVideo(true);
    cleanups.push(registerReelVideo(a), registerReelVideo(b));

    const hlsA = fakeHls(a);
    bindReelHls(a, hlsA as never);

    claimReelPlayback(a);
    claimReelPlayback(b);

    expect(hlsA.stopLoad).toHaveBeenCalled();
    expect(hlsA.detachMedia).toHaveBeenCalled();
    expect(a.pause).toHaveBeenCalled();
    expect(a.muted).toBe(true);
  });

  it('releaseReelPlayback detaches even when already paused', () => {
    const video = fakeVideo(true);
    cleanups.push(registerReelVideo(video));
    const hls = fakeHls(video);
    bindReelHls(video, hls as never);

    claimReelPlayback(video);
    releaseReelPlayback(video);

    expect(hls.detachMedia).toHaveBeenCalled();
  });

  it('attachReelHls reattaches after detach', () => {
    const video = fakeVideo(true);
    const hls = fakeHls(null);
    hls.attachMedia = vi.fn((el: HTMLVideoElement) => {
      hls.media = el;
    });
    bindReelHls(video, hls as never);

    attachReelHls(video);

    expect(hls.attachMedia).toHaveBeenCalledWith(video);
    expect(hls.startLoad).toHaveBeenCalledWith(-1);
  });
});
