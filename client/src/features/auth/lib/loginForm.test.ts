import { describe, expect, it } from 'vitest';

import { loginNationalError, loginShellDescription, loginShellTitle } from './loginForm';

describe('loginNationalError', () => {
  it('rejects empty / short national numbers', () => {
    expect(loginNationalError('')).toBe('Enter the number without the country code, digits only.');
    expect(loginNationalError('123')).toBe('Enter the number without the country code, digits only.');
  });

  it('accepts a valid national number', () => {
    expect(loginNationalError('3001234567')).toBeNull();
  });
});

describe('loginShellTitle', () => {
  it('switches on saved vs phone mode', () => {
    expect(loginShellTitle(true)).toBe('Choose an Account');
    expect(loginShellTitle(false)).toBe('Welcome Back');
  });
});

describe('loginShellDescription', () => {
  it('covers phone, idle saved, and signing-in copy', () => {
    expect(loginShellDescription(false, null)).toBe(
      "Your number is the account. We'll text a 4-digit code — no password."
    );
    expect(loginShellDescription(true, null)).toBe(
      "Tap a profile to continue. We'll only text a code if this device has gone stale."
    );
    expect(loginShellDescription(true, 'Ali')).toBe('Signing In as Ali…');
  });
});
