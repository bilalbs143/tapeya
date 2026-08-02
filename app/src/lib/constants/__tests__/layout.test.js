/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { getNavbarOffsetPx, NAVBAR_HEIGHT, NAVBAR_SELECTOR } from '@/lib/constants/layout';

describe('getNavbarOffsetPx', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('falls back to NAVBAR_HEIGHT when navbar is missing', () => {
    expect(getNavbarOffsetPx()).toBe(NAVBAR_HEIGHT);
  });

  it('returns the measured navbar height when mounted', () => {
    const nav = document.createElement('nav');
    nav.setAttribute('data-app-navbar', '');
    document.body.appendChild(nav);
    vi.spyOn(nav, 'getBoundingClientRect').mockReturnValue({
      height: 98,
      width: 390,
      top: 0,
      left: 0,
      bottom: 98,
      right: 390,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    expect(document.querySelector(NAVBAR_SELECTOR)).toBe(nav);
    expect(getNavbarOffsetPx()).toBe(98);
  });

  it('falls back when measured height is zero', () => {
    const nav = document.createElement('nav');
    nav.setAttribute('data-app-navbar', '');
    document.body.appendChild(nav);
    vi.spyOn(nav, 'getBoundingClientRect').mockReturnValue({
      height: 0,
      width: 0,
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    expect(getNavbarOffsetPx()).toBe(NAVBAR_HEIGHT);
  });
});
