import { coalesceTrim } from '../../../core/utils';
import { GRAPHIC_KEYS as K } from '../../graphicCommandKeys';
import { buildMatchContext } from './matchContext';

/** @typedef {import('../../../types.js').GraphicSessionSnapshot} GraphicSessionSnapshot */

/** @type {Record<string, { contextKey: string, metric: 'batting'|'bowling' }>} */
export const LEADERBOARD_COMMANDS = {
  [K.HIGHEST_RUNS]: {
    contextKey: 'runs',
    metric: 'batting',
  },
  [K.TOP_BATTER]: {
    contextKey: 'matchRuns',
    metric: 'batting',
  },
  [K.HIGHEST_FOURS]: {
    contextKey: 'fours',
    metric: 'batting',
  },
  [K.HIGHEST_SIXES]: {
    contextKey: 'sixes',
    metric: 'batting',
  },
  [K.HIGHEST_WICKETS]: {
    contextKey: 'wickets',
    metric: 'bowling',
  },
  [K.TOP_BOWLER]: {
    contextKey: 'matchWickets',
    metric: 'bowling',
  },
};

/**
 * @param {string} commandKey
 * @param {GraphicSessionSnapshot} snapshot
 * @param {Array<unknown>|undefined} payloadRows
 */
function leaderboardRowsFromSnapshot(commandKey, snapshot, payloadRows) {
  if (Array.isArray(payloadRows) && payloadRows.length > 0) {
    return payloadRows;
  }

  const meta = LEADERBOARD_COMMANDS[commandKey];
  if (!meta) return [];

  return snapshot.live.leaderboards[meta.contextKey] ?? [];
}

/**
 * @param {'batting'|'bowling'} metric
 * @param {Record<string, unknown>|undefined} row
 * @param {Record<string, unknown>|null|undefined} explicitFeatured
 */
function featuredFromLeaderboardRow(metric, row, explicitFeatured) {
  if (explicitFeatured != null && typeof explicitFeatured === 'object') {
    return explicitFeatured;
  }
  if (!row || typeof row !== 'object') return null;

  const name = row.name;
  if (name == null || String(name).trim() === '') return null;

  const v = metric === 'bowling' ? (row.wickets ?? row.value) : (row.runs ?? row.value);
  const notOut = metric === 'batting' && row.is_not_out ? '*' : '';

  return {
    name: String(name),
    value: `${v ?? ''}${notOut}`,
    image_url: row.image_url ?? null,
    team_name: row.team_name ?? row.team ?? '',
    metric_kind: row.metric_kind ?? (metric === 'bowling' ? 'wickets' : 'runs'),
  };
}

/**
 * @param {string} commandKey
 * @param {GraphicSessionSnapshot} snapshot
 */
export function buildLeaderboardProps(commandKey, snapshot) {
  const meta = LEADERBOARD_COMMANDS[commandKey];
  if (!meta) return {};

  const p = snapshot.payload ?? {};
  const mc = buildMatchContext(snapshot);
  const rows = leaderboardRowsFromSnapshot(commandKey, snapshot, p.rows);

  return {
    commandKey,
    title: coalesceTrim(p.title) || null,
    subtitle: coalesceTrim(p.subtitle, mc.tournamentName) || null,
    rows,
    featured: featuredFromLeaderboardRow(meta.metric, rows[0], p.featured),
    tournamentLogoUrl: p.tournament_logo_url ?? mc.tournamentLogoUrl,
  };
}
