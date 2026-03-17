/**
 * Masks a phone number for display, e.g. "+92 315 *** ****".
 * Only masks when the digit string is long enough; otherwise returns as-is.
 *
 * @param {string} [phone]
 * @returns {string}
 */
export function formatPhoneMasked(phone) {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length < 10) return phone || '';
  return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} *** ****`;
}

/**
 * Formats a raw E.164-ish phone string for full display.
 * e.g. "+923157118511" → "+92 315 711 8511"
 *
 * @param {string} [phone]
 * @returns {string}
 */
export function formatPhoneFull(phone) {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length < 10) return phone || '';
  return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 12)}`;
}
