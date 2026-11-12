import {
  COUNTRIES,
  countryByCode,
  countryByDial,
  type CountryDialInfo,
  DEFAULT_COUNTRY_CODE,
  DEFAULT_DIAL,
} from './constants';

/** Digits only; strip trunk zeros (legacy `PhoneInput` / `normalizePhoneE164`). */
export function nationalDigits(national: string): string {
  return String(national).replace(/\D/g, '').replace(/^0+/, '');
}

/** Longest-dial matchers — one row per dial (NANP `+1` → US). */
const DIAL_MATCHERS: CountryDialInfo[] = (() => {
  const seen = new Set<string>();
  const out: CountryDialInfo[] = [];
  // Prefer US for shared +1 before scanning the alphabetical list (Canada is earlier).
  for (const c of [countryByCode('US'), ...COUNTRIES]) {
    if (seen.has(c.dial)) continue;
    seen.add(c.dial);
    out.push(c);
  }
  return out.sort((a, b) => b.dial.length - a.dial.length);
})();

export type SplitE164 = { code: string; dial: string; national: string };

/** Split a stored E.164 value into country + national using the curated table. */
export function splitE164(e164: string | null | undefined): SplitE164 {
  const digits = String(e164 ?? '').replace(/\D/g, '');
  if (!digits) return { code: DEFAULT_COUNTRY_CODE, dial: DEFAULT_DIAL, national: '' };

  for (const country of DIAL_MATCHERS) {
    const code = country.dial.replace(/\D/g, '');
    if (digits.startsWith(code) && digits.length > code.length) {
      return { code: country.code, dial: country.dial, national: digits.slice(code.length) };
    }
  }

  return { code: DEFAULT_COUNTRY_CODE, dial: DEFAULT_DIAL, national: nationalDigits(digits) };
}

/** Cap national digits to the selected country's max length. */
export function clampNational(national: string, dialOrCode: string): string {
  const country = dialOrCode.startsWith('+') ? countryByDial(dialOrCode) : countryByCode(dialOrCode);
  return nationalDigits(national).slice(0, country.nsnMax);
}

/** E.164 for the wire: +923001234567 */
export function toE164(dial: string, national: string): string {
  return `${dial}${nationalDigits(national)}`;
}

/** Grouped for reading aloud: +92 300 123 4567 */
export function formatPhone(e164: string): string {
  const m = String(e164).match(/^(\+\d{1,3})(\d{3})(\d{3})(\d+)$/);
  return m ? `${m[1]} ${m[2]} ${m[3]} ${m[4]}` : e164;
}

/** Masked for a shared device: +92 300 ••• 4567 */
export function maskPhone(e164: string): string {
  const s = String(e164);
  const m = s.match(/^(\+\d{1,3})(\d{3})\d+(\d{4})$/);
  return m ? `${m[1]} ${m[2]} ••• ${m[3]}` : s.replace(/\d(?=\d{4})/g, '•');
}

/** User-facing national-number error (leading 0 vs country length). */
export function nationalNumberError(national: string, dialOrCode: string = DEFAULT_DIAL): string | null {
  const raw = String(national).replace(/\D/g, '');
  if (raw.startsWith('0')) return "Don't start with 0 — enter the number without the trunk zero.";
  if (!raw) return 'Enter the number without the country code, digits only.';

  const country = dialOrCode.startsWith('+') ? countryByDial(dialOrCode) : countryByCode(dialOrCode);
  const digits = nationalDigits(national);
  if (digits.length < country.nsnMin || digits.length > country.nsnMax) {
    if (country.nsnMin === country.nsnMax) {
      return `Enter a ${country.nsnMin}-digit ${country.name} number (no country code or leading 0).`;
    }
    return `Enter a ${country.nsnMin}–${country.nsnMax}-digit ${country.name} number (no country code or leading 0).`;
  }
  return null;
}

/** National subscriber only — no country code, no leading 0, length matches dial. */
export function isValidNational(national: string, dialOrCode: string = DEFAULT_DIAL): boolean {
  return nationalNumberError(national, dialOrCode) === null;
}

/** Optional phone fields — empty is OK; otherwise same rules as auth. */
export function optionalNationalError(national: string, dialOrCode: string = DEFAULT_DIAL): string | null {
  if (!String(national).replace(/\D/g, '')) return null;
  return nationalNumberError(national, dialOrCode);
}

/** Letters and spaces — matches Laravel RegisterRequest name/nickname regex intent. */
export function isValidName(v: string): boolean {
  return /^[\p{L}][\p{L} ]*$/u.test(String(v).trim());
}
