// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';

import {
  clearSplashPlayedThisSession,
  hasSplashPlayedThisSession,
  markSplashPlayedThisSession,
  resolveSplashDestination,
} from '../splashNavigation';

describe('resolveSplashDestination', () => {
  it('sends authenticated users home', () => {
    expect(resolveSplashDestination({ isAuthenticated: true, isReturning: true })).toBe('/home');
  });

  it('sends returning guests to login and first-install to register', () => {
    expect(resolveSplashDestination({ isAuthenticated: false, isReturning: true })).toBe('/login');
    expect(resolveSplashDestination({ isAuthenticated: false, isReturning: false })).toBe('/register');
  });
});

describe('splash session flag', () => {
  afterEach(() => {
    clearSplashPlayedThisSession();
  });

  it('round-trips sessionStorage', () => {
    expect(hasSplashPlayedThisSession()).toBe(false);
    markSplashPlayedThisSession();
    expect(hasSplashPlayedThisSession()).toBe(true);
  });
});
