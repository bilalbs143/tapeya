import { describe, expect, it } from 'vitest';

import { fitReelPosterDimensions, reelPosterSeekSeconds } from '../extractReelPoster';

describe('reelPosterSeekSeconds', () => {
  it('uses 1s when duration is missing or short', () => {
    expect(reelPosterSeekSeconds(null)).toBe(1);
    expect(reelPosterSeekSeconds(undefined)).toBe(1);
    expect(reelPosterSeekSeconds(1.5)).toBe(1);
    expect(reelPosterSeekSeconds(2)).toBe(1);
  });

  it('uses 10% clamped between 0.5 and 5 for longer clips', () => {
    expect(reelPosterSeekSeconds(3)).toBe(0.5); // 0.3 → clamp to 0.5
    expect(reelPosterSeekSeconds(20)).toBe(2);
    expect(reelPosterSeekSeconds(120)).toBe(5);
  });
});

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
