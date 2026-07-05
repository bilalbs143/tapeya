import { coalesceTrim } from '../utils.js';
import { buildMatchContext, resolveVenueFields, tournamentLabelOnly } from './_shared/matchContext';
import { pointTableRowsFromSnapshot } from './_shared/pointTableRows';

/**
 * @param {import('../types.js').GraphicSessionSnapshot} snapshot
 */
function buildMatchSummaryFooter(snapshot) {
  const p = snapshot.payload ?? {};
  if (p.footer_line) return String(p.footer_line);

  const { match, live } = snapshot;
  if (match.isCompleted && match.resultSummary) {
    return String(match.resultSummary);
  }

  const chasingName = live.battingTeam?.name || live.battingTeam?.abbrevDisplay || '';
  const runsRequired = live.runsToWin ?? 0;
  const ballsRemaining = live.ballsRemaining ?? 0;

  if (!match.isCompleted && chasingName && runsRequired > 0 && ballsRemaining >= 0) {
    return `${chasingName} NEEDED ${runsRequired} RUNS IN ${ballsRemaining} BALLS`;
  }

  return '';
}

/** @type {import('../types.js').GraphicProcessor} */
export function processMatchIntro(snapshot) {
  const mc = buildMatchContext(snapshot);
  const { venue, venueDisplayLine } = resolveVenueFields(snapshot);
  return {
    homeTeam: mc.homeTeam,
    awayTeam: mc.awayTeam,
    matchNumber: mc.matchNumber,
    venue,
    venueDisplayLine,
    tournamentName: mc.tournamentName,
  };
}

/** @type {import('../types.js').GraphicProcessor} */
export function processTournamentName(snapshot) {
  const p = snapshot.payload ?? {};
  const mc = buildMatchContext(snapshot);
  const { venue, venueDisplayLine } = resolveVenueFields(snapshot);

  return {
    homeTeam: mc.homeTeam,
    awayTeam: mc.awayTeam,
    title: coalesceTrim(p.tournament_name, p.title, mc.tournamentName),
    venue,
    venueDisplayLine,
    tournamentName: coalesceTrim(p.tournament_name, mc.tournamentName),
    tournamentLogoUrl: p.tournament_logo_url ?? mc.tournamentLogoUrl,
  };
}

/** @type {import('../types.js').GraphicProcessor} */
export function processPointTable(snapshot) {
  const p = snapshot.payload ?? {};
  const mc = buildMatchContext(snapshot);
  const rows = pointTableRowsFromSnapshot(snapshot, p.rows);
  const qualifyCount = p.qualify_count ?? p.qualifyCount ?? 4;

  return {
    title: coalesceTrim(p.title) || null,
    subtitle: coalesceTrim(p.subtitle, p.tournament_name, mc.tournamentName) || null,
    rows,
    qualifyCount,
    footerText: coalesceTrim(p.footer_text, p.footerText) || null,
    tournamentLogoUrl: p.tournament_logo_url ?? mc.tournamentLogoUrl,
  };
}

/** @type {import('../types.js').GraphicProcessor} */
export function processMatchSummaryFs(snapshot) {
  const p = snapshot.payload ?? {};
  const mc = buildMatchContext(snapshot);
  const { live } = snapshot;
  const innings = Array.isArray(p.innings) && p.innings.length > 0 ? p.innings : live.inningsSummaries;

  return {
    homeTeam: mc.homeTeam,
    awayTeam: mc.awayTeam,
    tournamentLabel: tournamentLabelOnly(snapshot),
    innings,
    footerLine: buildMatchSummaryFooter(snapshot),
  };
}
