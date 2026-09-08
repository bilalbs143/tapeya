/**
 * Match a phone against public system setting `test_otp_phones`
 * (comma-separated E.164 from GET /system-settings).
 */

function digitsOnly(phone) {
  return String(phone ?? '').replace(/\D/g, '');
}

/** @returns {string[]} */
export function parseTestOtpPhones(raw) {
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
export function isClientTestOtpPhone(phone, testOtpPhonesRaw) {
  const want = digitsOnly(phone);
  if (!want) return false;
  return parseTestOtpPhones(testOtpPhonesRaw).some((raw) => digitsOnly(raw) === want);
}
