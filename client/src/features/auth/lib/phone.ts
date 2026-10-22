/** E.164 for the wire: +923001234567 */
export function toE164(dial: string, national: string): string {
  return `${dial}${String(national).replace(/\D/g, '')}`;
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

export function isValidNational(national: string, min = 9): boolean {
  const d = String(national).replace(/\D/g, '');
  return d.length >= min && d.length <= 12;
}

/** Letters and spaces — matches Laravel RegisterRequest name/nickname regex intent. */
export function isValidName(v: string): boolean {
  return /^[\p{L}][\p{L} ]*$/u.test(String(v).trim());
}
