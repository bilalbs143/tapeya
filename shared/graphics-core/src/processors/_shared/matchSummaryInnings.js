import { toNum } from '../../utils';

/** @typedef {import('../../types.js').GraphicSessionSnapshot} GraphicSessionSnapshot */

/**
 * @typedef {{
 *   teamCode: string,
 *   total: number,
 *   wkts: number,
 *   scoreSep: string,
 *   oversText: string,
 *   oversLabel: string,
 * }} MatchSummaryLtInningsRow
 */

/**
 * @param {string|null|undefined} score
 * @param {number|null|undefined} wicketsFallback
 */
function parseInningsScore(score, wicketsFallback) {
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
 * @param {unknown} entry
 * @returns {MatchSummaryLtInningsRow|null}
 */
function normalizeSummarySource(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const e = /** @type {Record<string, any>} */ (entry);

  const teamCode = e.teamCode ?? e.batting_team ?? e.battingTeam;
  if (!teamCode) return null;

  const runs = toNum(e.runs) ?? toNum(e.total) ?? 0;
  const wkts = toNum(e.wickets) ?? toNum(e.wkts) ?? 0;

  return {
    teamCode: String(teamCode),
    total: runs,
    wkts,
    scoreSep: String(e.scoreSep ?? '-'),
    oversText: String(e.oversText ?? e.overs ?? e.overs_display ?? ''),
    oversLabel: String(e.oversLabel ?? 'OVER'),
  };
}

/**
 * @param {MatchSummaryLtInningsRow|null} row
 * @returns {row is MatchSummaryLtInningsRow}
 */
function isInningsRow(row) {
  return row !== null;
}

/** @param {GraphicSessionSnapshot} snapshot @returns {MatchSummaryLtInningsRow} */
function currentInningsFromLive(snapshot) {
  const { live } = snapshot;
  const side = live.battingTeamSide ?? 'home';
  const parsed = parseInningsScore(live.battingTeam?.score, live.battingTeam?.wickets);

  return {
    teamCode: side,
    total: parsed.total,
    wkts: parsed.wkts,
    scoreSep: parsed.scoreSep,
    oversText: live.battingTeam?.overs ?? '',
    oversLabel: 'OVER',
  };
}

/** @param {GraphicSessionSnapshot} snapshot @param {string} side @returns {MatchSummaryLtInningsRow} */
function yetToBatInnings(snapshot, side) {
  return {
    teamCode: side,
    total: 0,
    wkts: 0,
    scoreSep: '-',
    oversText: '0.0',
    oversLabel: 'OVER',
  };
}

/**
 * Resolve two innings rows for MATCH_SUMMARY from payload, context summaries, and live scoreboard.
 *
 * @param {GraphicSessionSnapshot} snapshot
 * @param {unknown} payloadStats
 * @returns {MatchSummaryLtInningsRow[]}
 */
export function buildMatchSummaryInnings(snapshot, payloadStats) {
  const fromPayload = Array.isArray(payloadStats) ? payloadStats.map(normalizeSummarySource).filter(isInningsRow) : [];
  const fromContext = (snapshot.live.inningsSummaries ?? []).map(normalizeSummarySource).filter(isInningsRow);

  const source = fromPayload.length > 0 ? fromPayload : fromContext;
  if (source.length >= 2) {
    return source.slice(0, 2);
  }

  const current = currentInningsFromLive(snapshot);
  const otherSide = current.teamCode === 'home' ? 'away' : 'home';

  if (source.length === 1) {
    const completed = source[0];
    if (snapshot.live.inningsNumber === 2 && completed.teamCode !== current.teamCode) {
      return [completed, current];
    }

    if (completed.teamCode === current.teamCode) {
      return [completed, yetToBatInnings(snapshot, otherSide)];
    }

    return [completed, current];
  }

  return [current, yetToBatInnings(snapshot, otherSide)];
}
