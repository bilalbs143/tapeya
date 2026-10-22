/** Register `/legal/*` aliases → CMS slugs seeded in the API. */

export const LEGAL_SLUG_BY_KEY = {
  terms: 'terms-of-use',
  privacy: 'privacy-policy',
} as const;

export type LegalKey = keyof typeof LEGAL_SLUG_BY_KEY;

export function normalizeCmsSlug(raw: string | undefined): string {
  if (typeof raw !== 'string') return '';
  const trimmed = raw.trim().toLowerCase();
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed) ? trimmed : '';
}

export function cmsSlugFromLegalKey(key: string | undefined): string {
  if (!key) return '';
  const mapped = LEGAL_SLUG_BY_KEY[key as LegalKey];
  return mapped ?? normalizeCmsSlug(key);
}
