import { buildMatchContext } from './_shared/matchContext';

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

/** @param {string|null|undefined} overs */
function formatOversText(overs) {
  const raw = String(overs ?? '').trim();
  if (!raw) return '';
  if (/OVER/i.test(raw)) return raw.toUpperCase();
  return `${raw} OVER`;
}

/** @type {import('../../types.js').GraphicProcessor} */
export function processMiniScorecard(snapshot) {
  const { live } = snapshot;
  const mc = buildMatchContext(snapshot);
  const batting = live.battingTeam ?? {};
  const teamCode = live.battingTeamSide ?? 'home';
  const parsed = parseInningsScore(batting.score, batting.wickets);

  return {
    homeTeam: mc.homeTeam,
    awayTeam: mc.awayTeam,
    teamCode,
    teamLabel: batting.shortCode ?? batting.code ?? batting.name ?? '',
    oversText: formatOversText(batting.overs),
    total: parsed.total,
    wkts: parsed.wkts,
    scoreSep: parsed.scoreSep,
  };
}
