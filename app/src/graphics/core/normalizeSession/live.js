import { toNum } from '../utils';
import { normalizeBallSummary, normalizeDeliveries } from './deliveries';
import { normalizeBatters, normalizeTeam } from './teams';

/**
 * @param {unknown} wp
 * @returns {{ home: number, away: number } | null}
 */
function normalizeWinProbability(wp) {
  if (!wp || typeof wp !== 'object') return null;
  const home = Number(wp.home);
  const away = Number(wp.away);
  if (!Number.isFinite(home) || !Number.isFinite(away)) return null;
  return { home, away };
}

/**
 * @param {unknown} mirror
 * @returns {Record<string, unknown> | null}
 */
function normalizeAtStageMirror(mirror) {
  if (!mirror || typeof mirror !== 'object') return null;
  if (mirror.batting_team !== 'home' && mirror.batting_team !== 'away') return null;

  return {
    battingTeam: mirror.batting_team,
    score: mirror.score ?? '',
    overs: mirror.overs ?? '',
    batters: normalizeBatters(mirror.batters),
    bowler: {
      name: mirror.bowler?.name ?? '',
      figures: mirror.bowler?.figures ?? '',
      overs: mirror.bowler?.overs ?? '',
    },
    currentOverDeliveries: normalizeDeliveries(mirror.current_over_deliveries),
    inningsLabel: mirror.innings_label ?? '1st Innings',
  };
}

/**
 * @param {Record<string, unknown>} ctx
 * @param {{ home_team: Record<string, unknown>, away_team: Record<string, unknown> }} teams
 * @returns {import('../../types.js').GraphicSessionSnapshot['live']}
 */
export function normalizeLive(ctx, teams) {
  const homeTeam = normalizeTeam(teams.home_team);
  const awayTeam = normalizeTeam(teams.away_team);
  const battingSide = ctx.batting_team === 'away' ? 'away' : 'home';
  const battingTeam = battingSide === 'away' ? awayTeam : homeTeam;
  const bowlingTeam = battingSide === 'away' ? homeTeam : awayTeam;
  const bowlerRaw = ctx.bowler && typeof ctx.bowler === 'object' ? ctx.bowler : {};

  return {
    inningsNumber: ctx.innings_number === 2 ? 2 : 1,
    battingTeamSide: battingSide,
    battingTeam: {
      ...battingTeam,
      score: ctx.score ?? '',
      overs: ctx.overs ?? '',
      wickets: ctx.wickets ?? null,
      extras: ctx.extras ?? 0,
      fours: ctx.fours ?? 0,
      sixes: ctx.sixes ?? 0,
    },
    bowlingTeam,
    batters: normalizeBatters(ctx.batters),
    bowler: {
      name: bowlerRaw.name ?? '',
      figures: bowlerRaw.figures ?? '',
      overs: bowlerRaw.overs ?? '',
      userId: toNum(bowlerRaw.user_id),
      teamId: toNum(bowlerRaw.team_id),
      runsConceded: bowlerRaw.runs_conceded ?? null,
      ballsBowled: bowlerRaw.balls_bowled ?? null,
      dots: bowlerRaw.dots ?? null,
      wickets: bowlerRaw.wickets ?? null,
      economy: bowlerRaw.economy ?? null,
      extrasConceded: bowlerRaw.extras_conceded ?? null,
    },
    currentOverDeliveries: normalizeDeliveries(ctx.current_over_deliveries),
    partnership: {
      runs: ctx.partnership?.runs ?? 0,
      balls: ctx.partnership?.balls ?? 0,
    },
    partnershipHistory: Array.isArray(ctx.partnership_history) ? ctx.partnership_history : [],
    battingOrder: Array.isArray(ctx.batting_order) ? ctx.batting_order : [],
    bowlers: Array.isArray(ctx.bowlers) ? ctx.bowlers : [],
    wicketsRemaining: ctx.wickets_remaining ?? null,
    target: ctx.target ?? null,
    runsToWin: ctx.runs_to_win ?? null,
    ballsRemaining: ctx.balls_remaining ?? null,
    currentRR: ctx.current_rr ?? '',
    requiredRR: ctx.required_rr ?? '',
    winProbability: normalizeWinProbability(ctx.win_probability),
    fallOfWickets: Array.isArray(ctx.fall_of_wickets) ? ctx.fall_of_wickets : [],
    previousOver: {
      runs: ctx.previous_over?.runs ?? 0,
      wickets: ctx.previous_over?.wickets ?? 0,
    },
    last12Balls: normalizeBallSummary(ctx.last_12_balls),
    last30Balls: normalizeBallSummary(ctx.last_30_balls),
    thisOver: normalizeBallSummary(ctx.this_over),
    inningsChart: Array.isArray(ctx.innings_chart) ? ctx.innings_chart : [],
    atStageMirror: normalizeAtStageMirror(ctx.at_stage_mirror),
    leaderboards: {
      runs: Array.isArray(ctx.graphic_leaderboard_runs) ? ctx.graphic_leaderboard_runs : [],
      fours: Array.isArray(ctx.graphic_leaderboard_fours) ? ctx.graphic_leaderboard_fours : [],
      sixes: Array.isArray(ctx.graphic_leaderboard_sixes) ? ctx.graphic_leaderboard_sixes : [],
      wickets: Array.isArray(ctx.graphic_leaderboard_wickets) ? ctx.graphic_leaderboard_wickets : [],
      matchRuns: Array.isArray(ctx.graphic_leaderboard_match_runs) ? ctx.graphic_leaderboard_match_runs : [],
      matchWickets: Array.isArray(ctx.graphic_leaderboard_match_wickets) ? ctx.graphic_leaderboard_match_wickets : [],
    },
    inningsSummaries: Array.isArray(ctx.innings_summaries) ? ctx.innings_summaries : [],
    standings: Array.isArray(ctx.standings) ? ctx.standings : [],
    squadHome: Array.isArray(ctx.squad_home) ? ctx.squad_home : [],
    squadAway: Array.isArray(ctx.squad_away) ? ctx.squad_away : [],
    wagonWheelEnabled: Boolean((ctx.match && typeof ctx.match === 'object' ? ctx.match : {}).wagon_wheel_enabled),
    wagonWheelBalls: Array.isArray(ctx.wagon_wheel_balls)
      ? ctx.wagon_wheel_balls.map((b) =>
          b && typeof b === 'object'
            ? {
                type: typeof b.type === 'string' ? b.type : 'runs',
                shotDirection: b.shot_direction ?? b.shotDirection ?? null,
                runs: Number(b.runs ?? 0) || 0,
                strikerId: toNum(b.striker_id ?? b.strikerId),
              }
            : { type: 'runs', shotDirection: null, runs: 0, strikerId: null },
        )
      : [],
  };
}
