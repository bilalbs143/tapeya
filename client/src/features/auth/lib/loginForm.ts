import { isValidNational } from './phone';

export type LoginLocationState = {
  returnTo?: string;
  from?: string;
  dial?: string;
  national?: string;
};

export type LoginMode = 'saved' | 'phone';

export function loginNationalError(national: string): string | null {
  if (!isValidNational(national)) return 'Enter the number without the country code, digits only.';
  return null;
}

export function loginShellTitle(savedMode: boolean): string {
  return savedMode ? 'Choose an Account' : 'Welcome Back';
}

export function loginShellDescription(savedMode: boolean): string {
  if (!savedMode) return "Your number is the account. We'll text a 4-digit code — no password.";
  return "Tap a profile to continue. We'll only text a code if this device has gone stale.";
}
