/**
 * Shared helpers for Tapeya theme prop adapters.
 */

import { formatBroadcastBowlingFigures, parseBowlingFigures } from '../../../core/domain/player';
import { resolveBroadcastPlayerName } from '../../../core/domain/playerNameResolver';

export { formatBroadcastBowlingFigures, parseBowlingFigures } from '../../../core/domain/player';
export { resolveBroadcastNameParts, resolveBroadcastPlayerName } from '../../../core/domain/playerNameResolver';
export { accentGlowShadow, accentMix, normalizeAccentColor } from '../primitives';

/** @param {Record<string, unknown>} props */
export function tournamentSub(props) {
  return props.tournamentLabel ?? props.tournamentName ?? props.sub ?? '';
}

/**
 * Resolve a player portrait URL from common API / session field shapes.
 *
 * @param {Record<string, unknown>|null|undefined} row
 * @returns {string|null}
 */
export function resolvePlayerImageUrl(row) {
  const r = row ?? {};
  return r.playerImageUrl ?? r.avatarUrl ?? r.image_url ?? r.imageUrl ?? r.avatar_url ?? null;
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
  return {
    total: parseInt(runsPart, 10) || 0,
    wkts: wktsPart != null ? parseInt(wktsPart, 10) || 0 : (wicketsFallback ?? 0),
    scoreSep: sep,
  };
}

/**
 * @param {Record<string, unknown>|null|undefined} bowler
 */
export function toFrameBowler(bowler) {
  const b = bowler ?? {};
  const figures = String(b.figures ?? '');
  const parsed = parseBowlingFigures(figures);
  const overs = b.overs ?? '';
  const w = parsed.wickets ?? b.wickets ?? b.w ?? 0;
  const r = parsed.runs ?? b.runsConceded ?? b.r ?? 0;
  const figuresDisplay = formatBroadcastBowlingFigures(figures, { w, r });

  return {
    name: resolveBroadcastPlayerName(b),
    figText: `${figuresDisplay} ${overs}`.trim(),
    o: overs,
    m: 0,
    r: parsed.runs ?? b.runsConceded ?? 0,
    w: parsed.wickets ?? b.wickets ?? 0,
  };
}

/**
 * @param {Record<string, unknown>|null|undefined} batter
 */
export function toFrameBatter(batter) {
  const b = batter ?? {};
  return {
    name: resolveBroadcastPlayerName(b),
    runs: b.runs ?? 0,
    balls: b.balls ?? 0,
    onStrike: Boolean(b.onStrike),
  };
}

/**
 * @param {Record<string, unknown>} team
 * @param {string} code
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 * @param {'home'|'away'|null} side
 */
export function toTeamRecord(team, code, tokens, side = null) {
  const accent =
    side === 'home'
      ? tokens?.homeBgColor || 'var(--accentA)'
      : side === 'away'
        ? tokens?.awayBgColor || 'var(--accentB)'
        : 'var(--accentA)';

  const short = team.shortCode ?? team.abbrevDisplay ?? code.toUpperCase();
  const full = team.name ?? short;

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
