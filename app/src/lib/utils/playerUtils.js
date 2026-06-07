/**
 * Best display role string for a player (playing_role, playing_role_enum, or role).
 *
 * @param {{ playing_role?: string, playing_role_enum?: string, role?: unknown } | null | undefined} player
 * @returns {string}
 */
export function playerDisplayRole(player) {
  return player?.playing_role ?? player?.playing_role_enum ?? (player?.role != null ? String(player.role) : '—');
}

/** @param {unknown} v */
function nonEmptyString(v) {
  if (v == null) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

/**
 * Profile fields to copy onto scoring squad rows (from API team squad users).
 *
 * @param {Record<string, unknown>} p
 */
export function squadPlayerProfileFields(p) {
  return {
    playing_role: p.playing_role,
    playing_role_enum: p.playing_role_enum,
    batting_style: p.batting_style,
    batting_style_enum: p.batting_style_enum,
    bowling_style: p.bowling_style,
    bowling_style_enum: p.bowling_style_enum,
  };
}

/**
 * Cricket playing role (Batter, Bowler, …) — ignores squad bench/playing `role`.
 *
 * @param {Record<string, unknown> | null | undefined} player
 * @returns {string|null}
 */
export function playerProfileRoleLabel(player) {
  return nonEmptyString(player?.playing_role ?? player?.playing_role_enum);
}

/**
 * @param {Record<string, unknown> | null | undefined} player
 * @returns {string|null}
 */
export function playerProfileBattingStyle(player) {
  return nonEmptyString(player?.batting_style ?? player?.batting_style_enum);
}

/**
 * @param {Record<string, unknown> | null | undefined} player
 * @returns {string|null}
 */
export function playerProfileBowlingStyle(player) {
  return nonEmptyString(player?.bowling_style ?? player?.bowling_style_enum);
}

/**
 * Ordered subtitle segments for scoring pickers (role + styles).
 *
 * @param {'batting'|'bowling'|'fielder'} variant
 * @returns {string[]}
 */
export function playerPickerMetaSegments(player, variant) {
  const role = playerProfileRoleLabel(player);
  const bat = playerProfileBattingStyle(player);
  const bowl = playerProfileBowlingStyle(player);
  const segments = [];
  if (role) segments.push(role);
  if (variant === 'bowling') {
    if (bowl) segments.push(bowl);
    else if (bat) segments.push(bat);
  } else if (variant === 'batting') {
    if (bat) segments.push(bat);
    else if (bowl) segments.push(bowl);
  } else {
    if (bat) segments.push(bat);
    if (bowl) segments.push(bowl);
  }
  return segments;
}

/**
 * Which picker variant to use for lineup / Playing XI meta (role + one or both styles).
 *
 * @param {string|null|undefined} roleLabel Human-readable role (e.g. "Bowler", "All Rounder")
 * @returns {'batting'|'bowling'|'fielder'}
 */
export function playingLineupMetaVariant(roleLabel) {
  const r = String(roleLabel ?? '').toLowerCase();
  if (r.includes('all') && r.includes('round')) return 'fielder';
  if (r.includes('bowler')) return 'bowling';
  if (r.includes('batsman') || r.includes('batter')) return 'batting';
  return 'fielder';
}

/**
 * Display name + meta subtitle for a Playing XI row (graphics or string fallback).
 *
 * @param {string | Record<string, unknown> | null | undefined} raw
 * @returns {{ name: string, metaText: string | null, userId?: unknown }}
 */
export function playingXiRowMeta(raw) {
  if (raw == null || typeof raw === 'string') {
    return { name: String(raw ?? ''), metaText: null };
  }
  const name = typeof raw.name === 'string' ? raw.name : '';
  const metaPlayer = squadPlayerProfileFields(raw);
  const variant = playingLineupMetaVariant(playerProfileRoleLabel(metaPlayer));
  const segments = playerPickerMetaSegments(metaPlayer, variant);
  const metaText = segments.length > 0 ? segments.join(' · ') : null;
  return { name, metaText, userId: raw.user_id };
}

/**
 * Profile strength – 0–100 score based on profile completeness.
 * Uses the same user shape as the API (UserResource): name, nickname, email,
 * phone, date_of_birth, country, city, batting_style, bowling_style,
 * playing_role, avatar_url.
 *
 * Each criterion is weighted equally; filled = 1, missing = 0.
 * Result is rounded to an integer.
 */
const PROFILE_STRENGTH_CRITERIA = [
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
  const filled = PROFILE_STRENGTH_CRITERIA.filter((c) => c.get(user)).length;
  const total = PROFILE_STRENGTH_CRITERIA.length;
  return total === 0 ? 0 : Math.round((filled / total) * 100);
}

export function getProfileRankingParamsByPlayingRole(playingRoleEnum) {
  const raw = playingRoleEnum == null ? '' : String(playingRoleEnum);
  const key = raw.includes('_') ? raw.toLowerCase() : raw.toUpperCase();

  if (key === 'BOWLER' || key === 'bowler') {
    return {
      category: 'bowling',
      sort: 'wickets',
    };
  }

  if (key === 'ALL_ROUNDER' || key === 'all_rounder') {
    return {
      category: 'batting',
      sort: 'runs',
    };
  }

  /* BATSMAN, unknown, or unset — batting runs */
  return {
    category: 'batting',
    sort: 'runs',
  };
}
