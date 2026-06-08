import { formatDate } from '@/lib/utils/dateUtils';

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
      const timeLabel = formattedDate || matchTime ? [formattedDate, matchTime].filter(Boolean).join(' • ') : '';
      return {
        id: match.id,
        tournament_id: match.tournament_id,
        status,
        matchId: home.name && away.name ? `${home.name} vs ${away.name}` : 'Match',
        team1: {
          name: home.name || 'Home team',
          initial: (home.name || 'H').charAt(0).toUpperCase(),
          logo: home.logo ?? null,
        },
        team2: {
          name: away.name || 'Away team',
          initial: (away.name || 'A').charAt(0).toUpperCase(),
          logo: away.logo ?? null,
        },
        score1: null,
        score2: null,
        meta: status === 'upcoming' && timeLabel ? { time: timeLabel } : {},
        group_index: match.group_index ?? undefined,
      };
    });
  });
}

/**
 * @param {object|null|undefined} inn
 * @returns {string|null}
 */
function formatInningsTotal(inn) {
  if (!inn) return null;
  return `${inn.total_runs ?? 0}/${inn.total_wickets ?? 0}`;
}

/**
 * @param {Array<{ batting_team_id?: number|string }>|undefined} innings
 * @param {number|string|null|undefined} teamId
 */
function findInningsByBattingTeam(innings, teamId) {
  if (!Array.isArray(innings) || teamId == null || teamId === '') return null;
  const tid = Number(teamId);
  if (!Number.isFinite(tid)) return null;
  return innings.find((i) => Number(i?.batting_team_id) === tid) ?? null;
}

/**
 * Match shape for ScorecardStatusDetails (Mock-compatible for MatchHeader).
 *
 * @param {object} apiMatch - Single tournament match from GET /matches/:id
 * @param {object|null} [scorecard] - GET /matches/:id/scorecard (optional)
 */
export function apiTournamentMatchToStatusDetailsMatch(apiMatch, scorecard) {
  if (!apiMatch) return null;

  const home = apiMatch.home_team ?? {};
  const away = apiMatch.away_team ?? {};
  const status = normaliseMatchStatus(apiMatch.status || 'scheduled');
  const team1 = {
    name: home.name || 'Home team',
    initial: String(home.name || 'H')
      .charAt(0)
      .toUpperCase(),
    logo: home.logo ?? null,
  };
  const team2 = {
    name: away.name || 'Away team',
    initial: String(away.name || 'A')
      .charAt(0)
      .toUpperCase(),
    logo: away.logo ?? null,
  };

  const formattedDate = apiMatch.match_date ? formatDate(apiMatch.match_date) : '';
  const timeLabel = [formattedDate, apiMatch.match_time || ''].filter(Boolean).join(' • ');
  const matchIdLabel =
    [apiMatch.venue_name, formattedDate || apiMatch.match_date].filter(Boolean).join(' • ') || `Match ${apiMatch.id}`;

  let score1 = null;
  let score2 = null;
  const innings = scorecard?.innings;
  if (Array.isArray(innings) && innings.length > 0) {
    const homeInn = findInningsByBattingTeam(innings, apiMatch.home_team_id);
    const awayInn = findInningsByBattingTeam(innings, apiMatch.away_team_id);
    score1 = formatInningsTotal(homeInn);
    score2 = formatInningsTotal(awayInn);
  }

  /** @type {Record<string, unknown>} */
  const meta = {};
  if (status === 'upcoming' && timeLabel) meta.time = timeLabel;

  return {
    id: apiMatch.id,
    tournament_id: apiMatch.tournament_id,
    status,
    matchId: matchIdLabel,
    team1,
    team2,
    score1,
    score2,
    meta,
    group_index: apiMatch.group_index,
  };
}

/** Minimal tab details (e.g. result banner) from API match when no mock bundle exists. */
export function minimalStatusDetailsFromApi(apiMatch) {
  if (!apiMatch?.winning_team?.name) return null;
  const name = apiMatch.winning_team.name;
  return {
    resultText: `${name} won`,
    resultHighlight: name,
  };
}

/**
 * @param {Array<{ over?: number, runs?: number, is_wicket?: boolean }>|undefined} balls
 * @returns {Map<number, { runs: number, wickets: number }>}
 */
function aggregateBallsByOver(balls) {
  /** @type {Map<number, { runs: number, wickets: number }>} */
  const map = new Map();
  if (!Array.isArray(balls)) return map;
  for (const ball of balls) {
    const o = Number(ball?.over);
    if (!Number.isFinite(o)) continue;
    if (!map.has(o)) map.set(o, { runs: 0, wickets: 0 });
    const cell = map.get(o);
    cell.runs += Number(ball?.runs) || 0;
    if (ball?.is_wicket) cell.wickets += 1;
  }
  return map;
}

/**
 * Over-by-over rows for StatusDetailsOversTab (team1 = home batting, team2 = away batting).
 *
 * @param {object|null|undefined} scorecard - GET /matches/:id/scorecard
 * @param {number|string|null|undefined} homeTeamId
 * @param {number|string|null|undefined} awayTeamId
 * @returns {Array<{ over: number, team1: { runs: number, wickets: number }, team2: { runs: number, wickets: number } }>}
 */
export function oversDetailsFromScorecard(scorecard, homeTeamId, awayTeamId) {
  const innings = scorecard?.innings;
  if (!Array.isArray(innings) || innings.length === 0) return [];

  const hid = homeTeamId != null && homeTeamId !== '' ? Number(homeTeamId) : NaN;
  const aid = awayTeamId != null && awayTeamId !== '' ? Number(awayTeamId) : NaN;

  const homeInn = Number.isFinite(hid) ? innings.find((i) => Number(i?.batting_team_id) === hid) : null;
  const awayInn = Number.isFinite(aid) ? innings.find((i) => Number(i?.batting_team_id) === aid) : null;

  const homeMap = aggregateBallsByOver(homeInn?.balls);
  const awayMap = aggregateBallsByOver(awayInn?.balls);

  const allOvers = new Set([...homeMap.keys(), ...awayMap.keys()]);
  if (allOvers.size === 0) return [];

  const sorted = [...allOvers].sort((a, b) => a - b);
  return sorted.map((over) => ({
    over,
    team1: homeMap.get(over) ?? { runs: 0, wickets: 0 },
    team2: awayMap.get(over) ?? { runs: 0, wickets: 0 },
  }));
}

/**
 * Playing XI payload for StatusDetailsPlayingXITab from GET playing-eleven (home + away).
 *
 * @param {object|null|undefined} xiHome - { players?: Array<{ name?: string, role?: string }>, player_ids?: number[] }
 * @param {object|null|undefined} xiAway
 * @returns {{ team1: Array<{ name: string, role: string }>, team2: Array<{ name: string, role: string }> } | null}
 */
export function playingXIFromPlayingElevenResponses(xiHome, xiAway) {
  const mapRow = (p) => ({
    name: String(p?.name ?? 'Player').trim() || 'Player',
    role: String(p?.role ?? p?.playing_role ?? 'Player'),
  });

  const fromPayload = (payload) => {
    if (payload?.players?.length) return payload.players.map(mapRow);
    const ids = payload?.player_ids;
    if (Array.isArray(ids) && ids.length > 0)
      return ids.map((id) => ({
        name: `Player #${id}`,
        role: 'Player',
      }));
    return [];
  };

  const team1 = fromPayload(xiHome);
  const team2 = fromPayload(xiAway);
  if (team1.length === 0 && team2.length === 0) return null;
  return { team1, team2 };
}

/**
 * Merge tab detail fragments for ScorecardStatusDetails.
 *
 * @param {object|null|undefined} resultDetails - from minimalStatusDetailsFromApi
 * @param {Array<{ over: number, team1: object, team2: object }>} overs
 * @param {{ team1: Array<{ name: string, role: string }>, team2: Array<{ name: string, role: string }> }|null} playingXI
 * @returns {Record<string, unknown>|null}
 */
export function buildMatchStatusDetails(resultDetails, overs, playingXI) {
  /** @type {Record<string, unknown>} */
  const out = {};
  if (resultDetails && typeof resultDetails === 'object') Object.assign(out, resultDetails);
  if (overs.length > 0) out.overs = overs;
  if (playingXI) out.playingXI = playingXI;
  return Object.keys(out).length > 0 ? out : null;
}
