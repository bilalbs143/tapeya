import { resolveTournamentShortCode, toNum } from '../../core/utils';
import { GRAPHIC_KEYS as K } from '../graphicCommandKeys';
import { buildLeaderboardProps } from './_shared/leaderboardRows';
import { buildMatchContext, tournamentLabelOnly, withMatchTeams } from './_shared/matchContext';
import {
  bowlingBallsFromOversDisplay,
  buildBatsmanMatchProps,
  buildDefaultBowlerMatchStats,
  mergePlayerPropsFromSession,
  parseBowlingFigures,
} from './_shared/resolvePlayer';
import { scoreboardBase } from './_shared/scoreboardBase';

/** @type {import('../../types.js').GraphicProcessor} */
export function createLeaderboardProcessor(commandKey) {
  return (snapshot) => buildLeaderboardProps(commandKey, snapshot);
}

/** @type {import('../../types.js').GraphicProcessor} */
export function processBatsmanMatchLt(snapshot) {
  return buildBatsmanMatchProps(snapshot);
}

/** @type {import('../../types.js').GraphicProcessor} */
export function processBatsmanMatchFs(snapshot) {
  return buildBatsmanMatchProps(snapshot);
}

/** @type {import('../../types.js').GraphicProcessor} */
export function processMom(snapshot) {
  const p = snapshot.payload ?? {};
  const userId = toNum(p.user_id) ?? snapshot.match.playerOfMatchUserId;
  if (!userId) {
    return null;
  }

  return withMatchTeams(snapshot, {
    ...mergePlayerPropsFromSession(snapshot, { ...p, user_id: userId }),
    tournamentLabel: tournamentLabelOnly(snapshot),
  });
}

/** @type {import('../../types.js').GraphicProcessor} */
export function processPlayerIntro(snapshot) {
  const p = snapshot.payload ?? {};
  const merged = mergePlayerPropsFromSession(snapshot, p);
  const key = snapshot.commandKey ?? '';
  const isBowler = key.startsWith('BOWLER_');
  const styleLine = isBowler ? merged.playerBowlingStyle || merged.playerRole : merged.playerBattingStyle || merged.playerRole;

  return withMatchTeams(snapshot, {
    ...merged,
    playerRole: styleLine,
    tournamentLabel: tournamentLabelOnly(snapshot),
  });
}

/** @type {Record<string, string>} */
const STATS_SCOPE_BY_COMMAND = {
  [K.BATSMAN_MATCH_FS]: 'Match Career',
  [K.BATSMAN_TOURNAMENT_LT]: 'Tournament Career',
  [K.BATSMAN_TOURNAMENT_FS]: 'Tournament Career',
  [K.BOWLER_MATCH_FS]: 'Match Career',
  [K.BOWLER_TOURNAMENT_LT]: 'Tournament Career',
  [K.BOWLER_TOURNAMENT_FS]: 'Tournament Career',
};

function statsScopeLabel(snapshot, fallback = 'Career Overview') {
  const key = snapshot.commandKey ?? '';
  return STATS_SCOPE_BY_COMMAND[key] ?? fallback;
}

/** @type {import('../../types.js').GraphicProcessor} */
export function processBatsmanTournament(snapshot) {
  const p = snapshot.payload ?? {};
  const tournamentBatting = p.tournament_batting ?? null;
  const stats =
    Array.isArray(p.stats) && p.stats.length > 0
      ? p.stats
      : tournamentBatting
        ? buildTournamentBattingStats(tournamentBatting)
        : [];

  return withMatchTeams(snapshot, {
    ...mergePlayerPropsFromSession(snapshot, p),
    headline: p.headline ?? statsScopeLabel(snapshot),
    stats,
    tournamentBatting,
    tournamentLabel: tournamentLabelOnly(snapshot),
  });
}

function buildTournamentBattingStats(tb) {
  const rows = [
    { label: 'Matches', value: tb.matches ?? 0 },
    { label: 'Runs', value: tb.runs ?? 0 },
    { label: '4s', value: tb.fours ?? 0 },
    { label: '6s', value: tb.sixes ?? 0 },
    { label: '50s', value: tb.fifties ?? 0 },
    { label: '100s', value: tb.hundreds ?? 0 },
    { label: 'SR', value: tb.strike_rate ?? '—' },
    { label: 'Avg', value: tb.average ?? '—' },
  ];

  return rows;
}

/** @type {import('../../types.js').GraphicProcessor} */
export function processBowlerMatch(snapshot) {
  const p = snapshot.payload ?? {};
  const merged = mergePlayerPropsFromSession(snapshot, p);
  const bow = snapshot.live.bowler ?? {};
  const figures = p.figures ?? bow.figures ?? '';
  const oversStr = p.overs ?? bow.overs ?? '';
  const parsed = parseBowlingFigures(figures);
  // snapshot.live.bowler uses camelCase (normalized); payload uses snake_case
  const runsConc = toNum(p.runs_conceded) ?? bow.runsConceded ?? toNum(parsed.runs) ?? 0;
  const wickets = toNum(p.wickets) ?? bow.wickets ?? toNum(parsed.wickets) ?? 0;
  const ballsBowled = toNum(p.balls_bowled) ?? bow.ballsBowled ?? bowlingBallsFromOversDisplay(oversStr) ?? 0;
  const dotsBowled = toNum(p.dots) ?? bow.dots ?? 0;
  const payloadStats = Array.isArray(p.stats) ? p.stats : [];
  const stats =
    payloadStats.length > 0
      ? payloadStats
      : buildDefaultBowlerMatchStats({
          runs: runsConc,
          balls: ballsBowled,
          dots: dotsBowled,
          wickets,
          extras: toNum(p.extras_conceded) ?? bow.extrasConceded ?? 0,
          economyDisplay: bow.economy,
        });

  return withMatchTeams(snapshot, {
    ...merged,
    figures,
    overs: oversStr,
    stats,
    headline: p.headline ?? statsScopeLabel(snapshot, 'Match Career'),
    tournamentLabel: tournamentLabelOnly(snapshot),
  });
}

/** @type {import('../../types.js').GraphicProcessor} */
export function processBowlerTournament(snapshot) {
  const p = snapshot.payload ?? {};
  const tournamentBowling = p.tournament_bowling ?? null;
  const stats =
    Array.isArray(p.stats) && p.stats.length > 0
      ? p.stats
      : tournamentBowling
        ? buildTournamentBowlingStats(tournamentBowling)
        : [];

  return withMatchTeams(snapshot, {
    ...mergePlayerPropsFromSession(snapshot, p),
    headline: p.headline ?? statsScopeLabel(snapshot),
    stats,
    tournamentBowling,
    tournamentLabel: tournamentLabelOnly(snapshot),
  });
}

function buildTournamentBowlingStats(tb) {
  return [
    { label: 'Matches', value: tb.matches ?? 0 },
    { label: 'Overs', value: tb.overs ?? '0.0' },
    { label: 'Wkts', value: tb.wickets ?? 0 },
    { label: 'Runs', value: tb.runs_conceded ?? 0 },
    { label: 'Avg', value: tb.average ?? '—' },
    { label: 'Econ', value: tb.economy ?? '—' },
  ];
}

function normalizeBattingOrderRow(row) {
  if (!row || typeof row !== 'object') return null;
  return {
    display_name: row.display_name ?? row.displayName ?? row.name ?? '',
    status: row.status ?? 'yet_to_bat',
    runs: row.runs ?? null,
    balls: row.balls ?? null,
    dismissal_text: row.dismissal_text ?? row.dismissalText ?? null,
    is_at_crease: Boolean(row.is_at_crease ?? row.isAtCrease),
    avatar_url: row.avatar_url ?? row.avatarUrl ?? row.image_url ?? row.imageUrl ?? null,
  };
}

/** @type {import('../../types.js').GraphicProcessor} */
export function processInningFigures(snapshot) {
  const { live } = snapshot;
  const mc = buildMatchContext(snapshot);
  const inningsNum = live.inningsNumber ?? 1;
  const inningsLabel = inningsNum === 2 ? '2ND' : '1ST';

  // Parse score string "105-0" into components when explicit fields are absent
  const scoreStr = live.battingTeam?.score ?? '';
  const [runsStr, wktsStr] = scoreStr.split('-');
  const runs = live.battingTeam?.runs ?? parseInt(runsStr, 10) ?? 0;
  const wickets = live.battingTeam?.wickets ?? parseInt(wktsStr, 10) ?? 0;

  return {
    battingTeam: live.battingTeam,
    bowlingTeam: live.bowlingTeam,
    matchHeader: `${mc.homeTeam.name} VS ${mc.awayTeam.name}`,
    tournamentLabel: tournamentLabelOnly(snapshot),
    teamLogoUrl: live.battingTeam?.logoUrl ?? null,
    innings: {
      runs,
      innings_number_label: inningsLabel,
      wickets,
      overs_display: live.battingTeam?.overs ?? '',
      required_run_rate: live.requiredRR ? Number(live.requiredRR) : null,
    },
  };
}

/** @type {import('../../types.js').GraphicProcessor} */
export function processBattingSummary(snapshot) {
  const p = snapshot.payload ?? {};
  const { live } = snapshot;
  const rawOrder = Array.isArray(p.batting_order) && p.batting_order.length > 0 ? p.batting_order : live.battingOrder;
  const battingOrder = rawOrder.map(normalizeBattingOrderRow).filter(Boolean);

  return {
    battingTeam: {
      ...live.battingTeam,
      name: p.batting_team?.display_name ?? live.battingTeam?.name ?? '',
      logoUrl: p.batting_team?.logo_url ?? p.team_logo_url ?? live.battingTeam?.logoUrl ?? null,
    },
    tournamentLabel: tournamentLabelOnly(snapshot),
    battingOrder,
    inningsExtras: p.innings?.extras ?? live.battingTeam?.extras ?? 0,
    inningsScore: p.innings?.score_display ?? live.battingTeam?.score ?? '',
    inningsOvers: p.innings?.overs_display ?? live.battingTeam?.overs ?? '',
  };
}

/** @type {Record<string, string>} */
const TOUR_STAT_KEY_BY_COMMAND = {
  [K.TOUR_RUNS]: 'totalRuns',
  [K.TOUR_FOURS]: 'totalFours',
  [K.TOUR_SIXES]: 'totalSixes',
  [K.TOUR_FIFTIES]: 'totalFifties',
  [K.TOUR_HUNDREDS]: 'totalCenturies',
  [K.TOUR_WICKETS]: 'totalWickets',
};

export function processTourStat(snapshot) {
  const p = snapshot.payload ?? {};
  const statKey = TOUR_STAT_KEY_BY_COMMAND[snapshot.commandKey ?? ''] ?? 'totalRuns';
  const aggregates = snapshot.tournament?.aggregates ?? {};
  const mc = buildMatchContext(snapshot);

  return {
    ...scoreboardBase(snapshot),
    ...mergePlayerPropsFromSession(snapshot, p),
    tournamentName: mc.tournamentName,
    tourHit: {
      statKey,
      value: p.value ?? aggregates[statKey] ?? 0,
      tournamentLogoUrl: p.tournament_logo_url ?? mc.tournamentLogoUrl ?? null,
      tournamentShortCode: resolveTournamentShortCode(p.tournament_short_code ?? mc.tournamentShort, mc.tournamentName),
    },
  };
}
