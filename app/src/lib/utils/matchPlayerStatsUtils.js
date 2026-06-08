/**
 * Helpers for `GET /matches/{match}/player-stats` display on the Stats tab.
 */

import { formatDecimal } from '@/lib/utils/displayUtils';

/**
 * @param {Record<string, string>} nameById
 * @param {number|null|undefined} playerId
 */
export function matchPlayerName(nameById, playerId) {
  if (playerId == null) return '—';
  return nameById[String(playerId)] || `Player ${playerId}`;
}

/**
 * @param {number|null|undefined} value
 */
export function formatMatchStatRate(value) {
  return formatDecimal(value, 1);
}

/**
 * Strike rate from runs and balls faced.
 *
 * @param {number|string|null|undefined} runs
 * @param {number|string|null|undefined} balls
 * @param {number} [decimals=1]
 * @returns {string}
 */
export function calculateStrikeRate(runs, balls, decimals = 1) {
  const ballsNum = Number(balls);
  if (!ballsNum) return '—';
  const runsNum = Number(runs);
  if (!Number.isFinite(runsNum) || !Number.isFinite(ballsNum)) return '—';
  return ((runsNum / ballsNum) * 100).toFixed(decimals);
}

/**
 * @param {number|null|undefined} overs Decimal overs from API (e.g. 4.2 = 4 overs 2 balls).
 */
export function formatMatchBowlingOvers(overs) {
  if (overs == null || Number.isNaN(Number(overs))) return '—';
  const n = Number(overs);
  const whole = Math.floor(n);
  const balls = Math.round((n - whole) * 10);
  if (balls <= 0) return String(whole);
  return `${whole}.${balls}`;
}

/**
 * @param {object[]} rows
 * @param {(row: object) => number} scoreFn
 */
export function sortMatchStatRows(rows, scoreFn) {
  return [...(rows ?? [])].sort((a, b) => scoreFn(b) - scoreFn(a));
}

/**
 * @param {object[]} [squads]
 * @param {object[]} [scorecardInnings]
 */
export function buildMatchPlayerNameMap(squads = [], scorecardInnings = []) {
  const map = {};
  for (const p of squads) {
    if (p?.id != null) map[String(p.id)] = p.name ?? '';
  }
  for (const inn of scorecardInnings) {
    for (const row of [...(inn.batting_stats ?? []), ...(inn.bowling_stats ?? [])]) {
      const id = row.id ?? row.player_id;
      if (id != null && row.name) map[String(id)] = row.name;
    }
  }
  return map;
}
