import { describe, expect, it } from 'vitest';

import { buildNativeStackLayout, nativeUnderlaySurfaceClass } from '../iosNativeStreamLayout';

describe('nativeUnderlaySurfaceClass', () => {
  it('is transparent only while underlay is active', () => {
    expect(nativeUnderlaySurfaceClass(true)).toBe('bg-transparent');
    expect(nativeUnderlaySurfaceClass(false)).toBe('bg-black');
  });
});

describe('buildNativeStackLayout', () => {
  it('defaults to underlay + no native touches (live / highlights chrome)', () => {
    expect(buildNativeStackLayout(false)).toEqual({
      underlay: true,
      immersiveFullscreen: false,
      userInteractionEnabled: false,
    });
  });

  it('landscape fills the host while staying under Capacitor by default', () => {
    expect(buildNativeStackLayout(true)).toEqual({
      underlay: true,
      immersiveFullscreen: true,
      userInteractionEnabled: false,
    });
  });

  it('interactive promotes native above Capacitor', () => {
    expect(buildNativeStackLayout(false, { interactive: true })).toEqual({
      underlay: false,
      immersiveFullscreen: false,
      userInteractionEnabled: true,
    });
  });

  it('underlay can still enable native taps without promoting above Capacitor', () => {
    expect(buildNativeStackLayout(false, { interactive: false, touchEnabled: true })).toEqual({
      underlay: true,
      immersiveFullscreen: false,
      userInteractionEnabled: true,
    });
  });
});
