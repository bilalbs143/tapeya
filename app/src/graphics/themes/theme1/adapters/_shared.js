/**
 * Shared helpers for Tapeya theme prop adapters.
 */

import { parseBowlingFigures } from '../../../core/domain/player';

export { accentGlowShadow, accentMix, normalizeAccentColor } from '../primitives';

/** @param {Record<string, unknown>} props */
export function tournamentSub(props) {
  return props.tournamentLabel ?? props.tournamentName ?? props.sub ?? '';
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

  return {
    name: b.name ?? '',
    figText: figures || `${parsed.wickets ?? b.wickets ?? 0}-${parsed.runs ?? b.runsConceded ?? 0} ${overs}`.trim(),
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
    name: b.name ?? '',
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
