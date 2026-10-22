/** Production API — `VerifyOtpRequest` is `size:4`. Do not “modernise” to 6. */
export const OTP_LENGTH = 4;
export const RESEND_SECONDS = 60;
export const NICK_MAX = 50;

export const COUNTRIES = [
  { code: 'PK', dial: '+92', flag: '🇵🇰', name: 'Pakistan' },
  { code: 'IN', dial: '+91', flag: '🇮🇳', name: 'India' },
  { code: 'BD', dial: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: 'AE', dial: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: 'GB', dial: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'AU', dial: '+61', flag: '🇦🇺', name: 'Australia' },
] as const;

export type CountryDial = (typeof COUNTRIES)[number]['dial'];
