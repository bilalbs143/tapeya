import { nationalNumberError } from './phone';

export type LoginLocationState = {
  returnTo?: string;
  from?: string;
  countryCode?: string;
  national?: string;
};

export type LoginMode = 'saved' | 'phone';

export function loginNationalError(national: string, countryCode?: string): string | null {
  return nationalNumberError(national, countryCode);
}

export function loginShellTitle(savedMode: boolean): string {
  return savedMode ? 'Choose an Account' : 'Welcome Back';
}

export function loginShellDescription(savedMode: boolean): string {
  if (!savedMode) return "Your number is the account. We'll text a 4-digit code — no password.";
  return "Tap a profile to continue. We'll only text a code if this device has gone stale.";
}
