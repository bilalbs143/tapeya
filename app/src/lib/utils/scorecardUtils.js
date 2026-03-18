import { formatDate } from '@/lib/format';

/**
 * Maps raw API status to internal status union ('live' | 'result' | 'upcoming').
 *
 * @param {string} statusRaw
 * @returns {'live'|'result'|'upcoming'}
 */
export function normaliseMatchStatus(statusRaw) {
  if (statusRaw === 'in_progress' || statusRaw === 'live') return 'live';
  if (statusRaw === 'completed' || statusRaw === 'finished') return 'result';
  return 'upcoming';
}

/**
 * Flattens tournament + match API data into a normalised match list for ScorecardTabs.
 *
 * @param {Array<{ matches?: Array }>} [tournaments]
 * @returns {Array<{ id, tournament_id, status, matchId, team1, team2, score1, score2, meta }>}
 */
export function normaliseTournamentMatches(tournaments) {
  return (tournaments ?? []).flatMap((tournament) => {
    const tMatches = tournament.matches ?? [];
    return tMatches.map((match) => {
      const home = match.home_team ?? match.homeTeam ?? {};
      const away = match.away_team ?? match.awayTeam ?? {};
      const status = normaliseMatchStatus(match.status || 'scheduled');
      const matchDate = match.match_date || null;
      const matchTime = match.match_time || '';
      const formattedDate = matchDate ? formatDate(matchDate) : '';
      const timeLabel =
        formattedDate || matchTime
          ? [formattedDate, matchTime].filter(Boolean).join(' • ')
          : '';
      return {
        id: match.id,
        tournament_id: match.tournament_id,
        status,
        matchId:
          home.name && away.name ? `${home.name} vs ${away.name}` : 'Match',
        team1: {
          name: home.name || 'Home team',
          initial: (home.name || 'H').charAt(0).toUpperCase(),
        },
        team2: {
          name: away.name || 'Away team',
          initial: (away.name || 'A').charAt(0).toUpperCase(),
        },
        score1: null,
        score2: null,
        meta: status === 'upcoming' && timeLabel ? { time: timeLabel } : {},
        group_index: match.group_index ?? undefined,
      };
    });
  });
}
