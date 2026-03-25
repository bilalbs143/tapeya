/**
 * Profile strength – 0–100 score based on profile completeness.
 * Uses the same user shape as the API (UserResource): name, nickname, email,
 * phone, date_of_birth, country, city, batting_style, bowling_style,
 * playing_role, avatar_url.
 *
 * Each criterion is weighted equally; filled = 1, missing = 0.
 * Result is rounded to an integer.
 */

const CRITERIA = [
  { key: 'name', get: (u) => (u?.name ?? u?.nickname ?? '').trim().length > 0 },
  { key: 'avatar_url', get: (u) => !!u?.avatar_url },
  { key: 'email', get: (u) => (u?.email ?? '').trim().length > 0 },
  { key: 'phone', get: (u) => (u?.phone ?? '').trim().length > 0 },
  { key: 'date_of_birth', get: (u) => !!u?.date_of_birth },
  { key: 'country', get: (u) => (u?.country ?? '').trim().length > 0 },
  { key: 'city', get: (u) => (u?.city ?? '').trim().length > 0 },
  {
    key: 'batting_style',
    get: (u) => !!(u?.batting_style ?? u?.batting_style_enum),
  },
  {
    key: 'bowling_style',
    get: (u) => !!(u?.bowling_style ?? u?.bowling_style_enum),
  },
  {
    key: 'playing_role',
    get: (u) => !!(u?.playing_role ?? u?.playing_role_enum),
  },
];

/**
 * @param {object|null|undefined} user – User object (API shape).
 * @returns {number} Integer 0–100.
 */
export function calculateProfileStrength(user) {
  if (!user || typeof user !== 'object') return 0;
  const filled = CRITERIA.filter((c) => c.get(user)).length;
  const total = CRITERIA.length;
  return total === 0 ? 0 : Math.round((filled / total) * 100);
}
