import { toNum } from '../utils';

/**
 * @param {Record<string, any>} ctx
 * @returns {import('../types.js').GraphicSessionSnapshot['match']}
 */
export function normalizeMatch(ctx) {
  const m = ctx.match && typeof ctx.match === 'object' ? ctx.match : {};

  const off = m.officials && typeof m.officials === 'object' ? m.officials : {};

  return {
    status: m.status ?? '',
    homeTeamId: toNum(m.home_team_id),
    awayTeamId: toNum(m.away_team_id),
    homeTeamName: m.home_team_name ?? '',
    awayTeamName: m.away_team_name ?? '',
    homeTeamShortCode: m.home_team_short_code ?? '',
    awayTeamShortCode: m.away_team_short_code ?? '',
    homeTeamLogoUrl: m.home_team_logo_url ?? null,
    awayTeamLogoUrl: m.away_team_logo_url ?? null,
    tossWinnerSide: m.toss_winner_side === 'home' || m.toss_winner_side === 'away' ? m.toss_winner_side : null,
    choseToBatOrBowl: m.chose_to_bat_or_bowl === 'bat' || m.chose_to_bat_or_bowl === 'bowl' ? m.chose_to_bat_or_bowl : null,
    resultSummary: m.result_summary ?? null,
    winningTeam: m.winning_team ?? null,
    isCompleted: Boolean(m.is_completed),
    playerOfMatchUserId: toNum(m.player_of_match_user_id),
    playerOfMatchName: m.player_of_match_name ?? null,
    number: m.number != null ? String(m.number) : '',
    venue: m.venue ?? '',
    venueDisplayLine: m.venue_display_line ?? '',
    maxOversPerInnings: toNum(m.max_overs_per_innings),
    playersPerSide: toNum(m.players_per_side) || 11,
    officials: {
      umpires: { text: off.umpires?.text ?? '', lines: Array.isArray(off.umpires?.lines) ? off.umpires.lines : [] },
      scorers: { text: off.scorers?.text ?? '', lines: Array.isArray(off.scorers?.lines) ? off.scorers.lines : [] },
      commentators: {
        text: off.commentators?.text ?? '',
        lines: Array.isArray(off.commentators?.lines) ? off.commentators.lines : [],
      },
    },
  };
}

/**
 * @param {Record<string, any>} ctx
 * @returns {import('../types.js').GraphicSessionSnapshot['tournament']}
 */
export function normalizeTournament(ctx) {
  const t = ctx.tournament && typeof ctx.tournament === 'object' ? ctx.tournament : {};

  const aggregates = ctx.tournament_aggregates && typeof ctx.tournament_aggregates === 'object' ? ctx.tournament_aggregates : {};

  return {
    name: t.name ?? '',
    shortCode: t.short ?? t.short_name ?? '',
    logoUrl: t.logo_url ?? null,
    aggregates: {
      totalRuns: aggregates.total_runs ?? 0,
      totalFours: aggregates.total_fours ?? 0,
      totalSixes: aggregates.total_sixes ?? 0,
      totalFifties: aggregates.total_fifties ?? 0,
      totalCenturies: aggregates.total_centuries ?? 0,
      totalWickets: aggregates.total_wickets ?? 0,
    },
  };
}
