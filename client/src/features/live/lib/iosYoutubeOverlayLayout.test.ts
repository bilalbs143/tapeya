import { describe, expect, it } from 'vitest';

import {
  buildNativeOverlayLayout,
  buildNativeStackLayout,
  hasValidOverlayFrame,
  readElementLayoutRect,
  withIosNativeEmbedParams,
} from './iosYoutubeOverlayLayout';

describe('buildNativeStackLayout', () => {
  it('defaults to underlay', () => {
    expect(buildNativeStackLayout()).toEqual({
      underlay: true,
      immersiveFullscreen: false,
      userInteractionEnabled: false,
    });
  });

  it('portrait VOD is interactive above Cap', () => {
    expect(buildNativeStackLayout({ interactive: true })).toEqual({
      underlay: false,
      immersiveFullscreen: false,
      userInteractionEnabled: true,
    });
  });

  it('live Full stays underlay + immersive (no YouTube taps)', () => {
    expect(buildNativeStackLayout({ isLandscape: true })).toEqual({
      underlay: true,
      immersiveFullscreen: true,
      userInteractionEnabled: false,
    });
  });

  it('VOD Full stays interactive + immersive', () => {
    expect(buildNativeStackLayout({ isLandscape: true, interactive: true })).toEqual({
      underlay: false,
      immersiveFullscreen: true,
      userInteractionEnabled: true,
    });
  });
});

describe('buildNativeOverlayLayout', () => {
  it('uses placeholder rect in portrait', () => {
    const el = {
      getBoundingClientRect: () => ({ left: 0, top: 48, width: 390, height: 220 }),
    } as unknown as Element;
    expect(readElementLayoutRect(el)).toEqual({ x: 0, y: 48, width: 390, height: 220 });
    expect(buildNativeOverlayLayout(el, { interactive: true })).toEqual({
      x: 0,
      y: 48,
      width: 390,
      height: 220,
      underlay: false,
      immersiveFullscreen: false,
      userInteractionEnabled: true,
    });
  });

  it('omits rect in landscape', () => {
    const el = {
      getBoundingClientRect: () => ({ left: 0, top: 48, width: 390, height: 220 }),
    } as unknown as Element;
    expect(buildNativeOverlayLayout(el, { isLandscape: true })).toEqual({
      underlay: true,
      immersiveFullscreen: true,
      userInteractionEnabled: false,
    });
    expect(hasValidOverlayFrame(buildNativeOverlayLayout(el, { isLandscape: true }))).toBe(true);
  });
});

describe('withIosNativeEmbedParams', () => {
  it('toggles rotate/cover for Full', () => {
    const base = 'https://tapeya.com/embed/youtube?src=x&controls=1';
    const full = withIosNativeEmbedParams(base, { landscape: true, showControls: true });
    expect(full).toContain('rotate=1');
    expect(full).toContain('cover=1');
    expect(full).toContain('_yt=r1');
    expect(withIosNativeEmbedParams(full, { landscape: false, showControls: true })).not.toContain('rotate=1');
    expect(withIosNativeEmbedParams(full, { landscape: false, showControls: true })).not.toContain('_yt=');
  });
});
