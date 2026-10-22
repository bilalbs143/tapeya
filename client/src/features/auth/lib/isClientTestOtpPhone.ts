/** Match phone against public `test_otp_phones` (comma-separated E.164 from system settings). */

function digitsOnly(phone: string | null | undefined): string {
  return String(phone ?? '').replace(/\D/g, '');
}

export function parseTestOtpPhones(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((p) => String(p ?? '').trim()).filter(Boolean);
  }
  if (typeof raw === 'string' && raw.trim()) {
    return raw
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
  }
  return [];
}

/** True when this phone is listed in API `test_otp_phones` (banner + manual entry). */
export function isClientTestOtpPhone(phone: string | null | undefined, testOtpPhonesRaw: unknown): boolean {
  const want = digitsOnly(phone);
  if (!want) return false;
  return parseTestOtpPhones(testOtpPhonesRaw).some((raw) => digitsOnly(raw) === want);
}
