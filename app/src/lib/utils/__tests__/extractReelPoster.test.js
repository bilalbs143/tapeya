import { describe, expect, it } from 'vitest';

import { captureHtmlVideoFrameJpeg, fitReelPosterDimensions } from '../extractReelPoster';

describe('fitReelPosterDimensions', () => {
  it('keeps even dimensions when already under max edge', () => {
    expect(fitReelPosterDimensions(720, 960)).toEqual({ width: 720, height: 960 });
    expect(fitReelPosterDimensions(721, 961)).toEqual({ width: 722, height: 962 });
  });

  it('scales down so the longest edge is ~1080 (even)', () => {
    expect(fitReelPosterDimensions(720, 1280)).toEqual({ width: 608, height: 1080 });
    expect(fitReelPosterDimensions(2160, 3840)).toEqual({ width: 608, height: 1080 });
  });
});

describe('captureHtmlVideoFrameJpeg', () => {
  it('returns null when video has no dimensions', async () => {
    const video = {
      videoWidth: 0,
      videoHeight: 0,
      readyState: 2,
    };
    expect(await captureHtmlVideoFrameJpeg(/** @type {any} */ (video))).toBeNull();
  });
});
