import { describe, expect, it } from 'vitest';

import { omitRegisterError, registerShellDescription, validateRegisterForm } from './registerForm';

describe('validateRegisterForm', () => {
  it('requires phone, name, nickname, and terms', () => {
    expect(validateRegisterForm('', '', '', false)).toEqual({
      phone: 'Enter the number without the country code, digits only.',
      name: 'Required.',
      nickname: 'Required — teammates see this on the scorecard.',
      acceptTerms: 'You must agree to the Terms of Use to create an account.',
    });
  });

  it('rejects non-letter names and nicknames', () => {
    expect(validateRegisterForm('3001234567', 'Ali123', 'Nick!', true)).toEqual({
      name: 'Letters and spaces only.',
      nickname: 'Letters and spaces only.',
    });
  });

  it('passes a complete valid form', () => {
    expect(validateRegisterForm('3001234567', 'Ali Khan', 'Ali', true)).toEqual({});
  });
});

describe('omitRegisterError', () => {
  it('drops one field key', () => {
    expect(omitRegisterError({ phone: 'x', name: 'y' }, 'phone')).toEqual({ name: 'y' });
  });
});

describe('registerShellDescription', () => {
  it('returns default copy before submit or when clean', () => {
    expect(registerShellDescription(false, 0)).toBe('Name, nickname, and the number the code will land on.');
    expect(registerShellDescription(true, 0)).toBe('Name, nickname, and the number the code will land on.');
  });

  it('counts errors after submit', () => {
    expect(registerShellDescription(true, 1)).toBe('One thing needs fixing before we can send your code.');
    expect(registerShellDescription(true, 2)).toBe('Two things need fixing before we can send your code.');
    expect(registerShellDescription(true, 3)).toBe('A few things need fixing before we can send your code.');
  });
});
