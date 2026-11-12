import { describe, expect, it } from 'vitest';

import { loginNationalError, loginShellDescription, loginShellTitle } from './loginForm';

describe('loginNationalError', () => {
  it('rejects empty / short national numbers for the selected country', () => {
    expect(loginNationalError('', 'PK')).toBe('Enter the number without the country code, digits only.');
    expect(loginNationalError('123', 'PK')).toMatch(/10-digit.*Pakistan/i);
  });

  it('rejects a leading trunk zero', () => {
    expect(loginNationalError('03001234567', 'PK')).toMatch(/leading 0|trunk zero/i);
  });

  it('accepts a valid national number for that country', () => {
    expect(loginNationalError('3001234567', 'PK')).toBeNull();
    expect(loginNationalError('501234567', 'AE')).toBeNull();
  });
});

describe('loginShellTitle', () => {
  it('switches on saved vs phone mode', () => {
    expect(loginShellTitle(true)).toBe('Choose an Account');
    expect(loginShellTitle(false)).toBe('Welcome Back');
  });
});

describe('loginShellDescription', () => {
  it('covers phone vs saved copy without a loading swap', () => {
    expect(loginShellDescription(false)).toBe("Your number is the account. We'll text a 4-digit code — no password.");
    expect(loginShellDescription(true)).toBe(
      "Tap a profile to continue. We'll only text a code if this device has gone stale."
    );
  });
});
