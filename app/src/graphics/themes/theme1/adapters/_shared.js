/**
 * Shared helpers for Tapeya theme prop adapters.
 */

import { formatBroadcastBowlingFigures, parseBowlingFigures } from '@tapeya/graphics-core/domain/player';
import {
  BROADCAST_NAME_STYLE,
  resolveBroadcastNameParts,
  resolveBroadcastPlayerName,
} from '@tapeya/graphics-core/domain/playerNameResolver';

export { accentGlowShadow, accentMix, normalizeAccentColor } from '../primitives';
export { formatBroadcastBowlingFigures, parseBowlingFigures } from '@tapeya/graphics-core/domain/player';
export {
  BROADCAST_NAME_STYLE,
  resolveBroadcastNameParts,
  resolveBroadcastPlayerName,
} from '@tapeya/graphics-core/domain/playerNameResolver';

/** Lower-third broadcast name (compact: "M Bilal"). */
export function resolveLtPlayerName(input) {
  return resolveBroadcastPlayerName(input, BROADCAST_NAME_STYLE.compact);
}

/** Full-screen broadcast name (standard: "Muhammad Bilal"). */
export function resolveFsPlayerName(input) {
  return resolveBroadcastPlayerName(input, BROADCAST_NAME_STYLE.standard);
}

/** @param {Parameters<typeof resolveBroadcastNameParts>[0]} input */
export function resolveLtNameParts(input) {
  return resolveBroadcastNameParts(input, BROADCAST_NAME_STYLE.compact);
}

/** @param {Parameters<typeof resolveBroadcastNameParts>[0]} input */
export function resolveFsNameParts(input) {
  return resolveBroadcastNameParts(input, BROADCAST_NAME_STYLE.standard);
}

/** @param {Record<string, unknown>} props */
export function tournamentSub(props) {
  return props.tournamentLabel ?? props.tournamentName ?? props.sub ?? '';
}

/**
 * Single source of truth for team accent colours from session tokens.
 *
 * @param {'home'|'away'|null|undefined} side
 * @param {import('../../../types.js').ThemeTokens|null|undefined} tokens
 * @returns {string}
 */
export function resolveTeamColor(side, tokens) {
  if (side === 'home') return tokens?.homeBgColor || 'var(--accentA)';
  if (side === 'away') return tokens?.awayBgColor || 'var(--accentB)';
  return 'var(--accentA)';
}

/** @param {'home'|'away'|null|undefined} side */
export function resolveCounterpartSide(side) {
  if (side === 'home') return 'away';
  if (side === 'away') return 'home';
  return null;
}

/**
 * Resolve a player portrait URL from common API / session field shapes.
 *
 * @param {Record<string, unknown>|null|undefined} row
 * @returns {string|null}
 */
export function resolvePlayerImageUrl(row) {
  const r = row ?? {};
  return r.playerImageUrl ?? r.avatarUrl ?? r.avatar_url ?? r.imageUrl ?? r.image_url ?? null;
}

/**
 * Return the first portrait URL found across one or more row objects.
 *
 * @param {...(Record<string, unknown>|null|undefined)} rows
 * @returns {string|null}
 */
export function coalescePlayerImageUrl(...rows) {
  for (const row of rows) {
    const url = resolvePlayerImageUrl(row);
    if (url) return url;
  }
  return null;
}

/**
 * Resolve a player portrait URL, returning null when the session has disabled
 * player images (`tokens.enableImages === false`).
 *
 * @param {Record<string, unknown>|null|undefined} row
 * @param {import('../../../types.js').ThemeTokens|null|undefined} tokens
 * @returns {string|null}
 */
export function resolvePlayerImageUrlGated(row, tokens) {
  if (tokens != null && tokens.enableImages === false) return null;
  return resolvePlayerImageUrl(row);
}

/**
 * Coalesce portrait URLs across rows, returning null when player images are
 * disabled (`tokens.enableImages === false`).
 *
 * @param {import('../../../types.js').ThemeTokens|null|undefined} tokens
 * @param {...(Record<string, unknown>|null|undefined)} rows
 * @returns {string|null}
 */
export function coalescePlayerImageUrlGated(tokens, ...rows) {
  if (tokens != null && tokens.enableImages === false) return null;
  return coalescePlayerImageUrl(...rows);
}

/** @param {string|number|null|undefined} value */
export function toInt(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * @param {string|null|undefined} score
 * @param {number|null|undefined} wicketsFallback
 */
export function parseInningsScore(score, wicketsFallback) {
  const raw = String(score ?? '').trim();
  if (!raw) {
    return { total: 0, wkts: wicketsFallback ?? 0, scoreSep: '-' };
  }

  const sep = raw.includes('/') ? '/' : '-';
  const [runsPart, wktsPart] = raw.split(/[-/]/);
  const totalParsed = parseInt(runsPart, 10);
  const wktsParsed = wktsPart != null ? parseInt(wktsPart, 10) : NaN;

  if (Number.isNaN(totalParsed)) return null;

  return {
    total: totalParsed,
    wkts: Number.isNaN(wktsParsed) ? (wicketsFallback ?? 0) : wktsParsed,
    scoreSep: sep,
  };
}

/**
 * @param {Record<string, unknown>|null|undefined} bowler
 * @param {import('../../../types.js').ThemeTokens|null|undefined} [tokens]
 */
export function toFrameBowler(bowler, tokens) {
  const b = bowler ?? {};
  const figures = String(b.figures ?? '');
  const parsed = parseBowlingFigures(figures);
  const overs = b.overs ?? '';
  const w = parsed.wickets ?? b.wickets ?? b.w ?? 0;
  const r = parsed.runs ?? b.runsConceded ?? b.r ?? 0;
  const figuresDisplay = formatBroadcastBowlingFigures(figures, { w, r });

  return {
    name: resolveLtPlayerName(b),
    figText: `${figuresDisplay} ${overs}`.trim(),
    o: overs,
    m: 0,
    r: parsed.runs ?? b.runsConceded ?? 0,
    w: parsed.wickets ?? b.wickets ?? 0,
    avatarUrl: resolvePlayerImageUrlGated(b, tokens),
  };
}

/**
 * @param {Record<string, unknown>|null|undefined} batter
 * @param {import('../../../types.js').ThemeTokens|null|undefined} [tokens]
 */
export function toFrameBatter(batter, tokens) {
  const b = batter ?? {};
  return {
    name: resolveLtPlayerName(b),
    runs: b.runs ?? 0,
    balls: b.balls ?? 0,
    onStrike: Boolean(b.onStrike),
    avatarUrl: resolvePlayerImageUrlGated(b, tokens),
  };
}

/**
 * @param {Record<string, unknown>} team
 * @param {string} code
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 * @param {'home'|'away'|null} side
 */
export function toTeamRecord(team, code, tokens, side = null) {
  const accent = resolveTeamColor(side, tokens);
  const short = team.shortCode || team.abbrevDisplay || code.toUpperCase();
  const full = team.name || short;

  return {
    code: String(short).toUpperCase(),
    name: short,
    fullName: full,
    displayName: full,
    introName: full,
    color: accent,
    logoUrl: team.logoUrl ?? null,
  };
}

/**
 * @param {Record<string, unknown>} team
 * @param {Record<string, object>} teams
 */
export function resolveTeamCode(team, teams) {
  if (!team) return null;
  const teamId = team.id ?? team.teamId;
  if (teamId != null) {
    if (teams.home?.id === teamId) return 'home';
    if (teams.away?.id === teamId) return 'away';
  }

  const short = String(team.shortCode ?? team.name ?? '').toLowerCase();
  if (teams.home && String(teams.home.code ?? teams.home.name ?? '').toLowerCase() === short) return 'home';
  if (teams.away && String(teams.away.code ?? teams.away.name ?? '').toLowerCase() === short) return 'away';
  return null;
}
