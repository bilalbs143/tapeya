/**
 * Best display role string for a player (playing_role, playing_role_enum, or role).
 *
 * @param {{ playing_role?: string, playing_role_enum?: string, role?: unknown } | null | undefined} player
 * @returns {string}
 */
export function playerDisplayRole(player) {
  return (
    player?.playing_role ??
    player?.playing_role_enum ??
    (player?.role != null ? String(player.role) : '—')
  );
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
