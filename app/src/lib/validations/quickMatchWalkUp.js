import { phoneSchema } from '@/lib/validations/shared';

/** Shared with auth / quick-match walk-up forms. */
export const QUICK_MATCH_NAME_REGEX = /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/;

/**
 * Validate walk-up name + phone (E.164 via {@link phoneSchema}).
 * @returns {{ ok: true, name: string, phone: string } | { ok: false, error: string }}
 */
export function validateWalkUpPlayer(name, phone) {
  const n = String(name ?? '').trim();
  if (!n) {
    return { ok: false, error: 'Name is required.' };
  }
  if (!QUICK_MATCH_NAME_REGEX.test(n)) {
    return { ok: false, error: 'Name may only contain letters and spaces.' };
  }
  const parsed = phoneSchema.safeParse(phone);
  if (!parsed.success) {
    const msg = parsed.error.issues?.[0]?.message ?? 'Enter a valid phone number.';
    return { ok: false, error: msg };
  }
  return { ok: true, name: n, phone: parsed.data };
}
