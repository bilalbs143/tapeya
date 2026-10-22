import { isValidName, isValidNational } from './phone';

export type RegisterLocationState = {
  returnTo?: string;
  from?: string;
  dial?: string;
  national?: string;
};

export type RegisterFieldErrors = {
  phone?: string;
  name?: string;
  nickname?: string;
  acceptTerms?: string;
};

export function validateRegisterForm(
  national: string,
  name: string,
  nickname: string,
  acceptTerms: boolean
): RegisterFieldErrors {
  const next: RegisterFieldErrors = {};
  if (!isValidNational(national)) next.phone = 'Enter the number without the country code, digits only.';
  if (!name.trim()) next.name = 'Required.';
  else if (!isValidName(name)) next.name = 'Letters and spaces only.';
  if (!nickname.trim()) next.nickname = 'Required — teammates see this on the scorecard.';
  else if (!isValidName(nickname)) next.nickname = 'Letters and spaces only.';
  if (!acceptTerms) next.acceptTerms = 'You must agree to the Terms of Use to create an account.';
  return next;
}

export function omitRegisterError(errors: RegisterFieldErrors, key: keyof RegisterFieldErrors): RegisterFieldErrors {
  if (!(key in errors)) return errors;
  const next = { ...errors };
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- drop one field key
  delete next[key];
  return next;
}

/** AuthShell subtitle — default copy, or a count-aware fix prompt after submit. */
export function registerShellDescription(submitted: boolean, errorCount: number): string {
  if (!submitted || errorCount === 0) {
    return 'Name, nickname, and the number the code will land on.';
  }
  if (errorCount === 1) return 'One thing needs fixing before we can send your code.';
  if (errorCount === 2) return 'Two things need fixing before we can send your code.';
  return 'A few things need fixing before we can send your code.';
}
