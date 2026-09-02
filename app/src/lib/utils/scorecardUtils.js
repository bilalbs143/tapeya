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

/** Tab details for ScorecardStatusDetails (result banner, scorecard, overs, playing XI). */
export function buildFanMatchDetails(apiMatch, scorecard, playingXI) {
  /** @type {Record<string, unknown>} */
  const out = {};

  const summary = apiMatch?.result_summary;
  if (summary) {
    out.resultText = summary;
    if (apiMatch?.winning_team?.name) {
      out.resultHighlight = apiMatch.winning_team.name;
    }
  }

  const overs = oversDetailsFromScorecard(scorecard, apiMatch?.home_team_id, apiMatch?.away_team_id);
  if (overs.length > 0) out.overs = overs;

  const teams = battingTeamsFromScorecard(scorecard, apiMatch);
  if (teams.length > 0) out.teams = teams;

  if (playingXI) out.playingXI = playingXI;

  return Object.keys(out).length > 0 ? out : null;
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

function formatBatterDismissal(row) {
  if (row?.is_on_crease) return 'not out';
  if (row?.dismissal_label) return String(row.dismissal_label);
  if (row?.dismissal_type) return String(row.dismissal_type).replace(/_/g, ' ');
  return '';
}

function formatExtrasDetail(extras) {
  if (!extras || typeof extras !== 'object') return '-';
  const parts = [];
  if (extras.wides) parts.push(`w ${extras.wides}`);
  if (extras.no_balls) parts.push(`nb ${extras.no_balls}`);
  if (extras.byes) parts.push(`b ${extras.byes}`);
  if (extras.leg_byes) parts.push(`lb ${extras.leg_byes}`);
  if (extras.penalty_runs) parts.push(`p ${extras.penalty_runs}`);
  return parts.length ? parts.join(', ') : '-';
}

/**
 * Map GET /matches/:id/scorecard innings into fan scorecard tab `teams` shape.
 *
 * @param {object|null|undefined} scorecard
 * @param {object|null|undefined} apiMatch
 */
export function battingTeamsFromScorecard(scorecard, apiMatch) {
  const innings = scorecard?.innings;
  if (!Array.isArray(innings) || innings.length === 0 || !apiMatch) return [];

  const hid = apiMatch.home_team_id != null ? Number(apiMatch.home_team_id) : NaN;
  const aid = apiMatch.away_team_id != null ? Number(apiMatch.away_team_id) : NaN;

  const mapInnings = (inn, fallbackName) => {
    if (!inn) return null;
    const hasBatting = Array.isArray(inn.batting_stats) && inn.batting_stats.length > 0;
    const hasBalls = Number(inn.balls_count) > 0;
    if (!hasBatting && !hasBalls) return null;
    const batting = (inn.batting_stats ?? []).map((row) => ({
      name: row.name ?? 'Player',
      dismissal: formatBatterDismissal(row),
      r: row.runs ?? 0,
      b: row.balls ?? 0,
      fours: row.fours ?? 0,
      sixes: row.sixes ?? 0,
      sr: typeof row.strike_rate === 'number' ? row.strike_rate.toFixed(1) : String(row.strike_rate ?? '0.0'),
    }));

    const extras = inn.extras_breakdown ?? {};
    const totalExtras = inn.total_extras ?? extras.total ?? 0;

    return {
      name: fallbackName ?? inn.batting_team?.name ?? 'Team',
      batting,
      extras: { runs: totalExtras, detail: formatExtrasDetail(extras) },
      total: {
        score: `${inn.total_runs ?? 0}/${inn.total_wickets ?? 0}`,
        summary: `${inn.overs_display ?? '0.0'} Ov (RR: ${inn.run_rate ?? '0.00'})`,
      },
    };
  };

  const homeInn = Number.isFinite(hid) ? innings.find((i) => Number(i?.batting_team_id) === hid) : null;
  const awayInn = Number.isFinite(aid) ? innings.find((i) => Number(i?.batting_team_id) === aid) : null;

  const homeName = apiMatch.home_team?.name ?? homeInn?.batting_team?.name;
  const awayName = apiMatch.away_team?.name ?? awayInn?.batting_team?.name;

  return [mapInnings(homeInn, homeName), mapInnings(awayInn, awayName)].filter(Boolean);
}

/**
 * Playing XI payload for StatusDetailsPlayingXITab from GET playing-eleven (home + away).
 */
export function playingXIFromPlayingElevenResponses(xiHome, xiAway) {
  const mapRow = (p) => ({
    name: String(p?.name ?? 'Player').trim() || 'Player',
    role: String(p?.role ?? 'Player'),
  });

  const team1 = (xiHome?.players ?? []).map(mapRow);
  const team2 = (xiAway?.players ?? []).map(mapRow);
  if (team1.length === 0 && team2.length === 0) return null;
  return { team1, team2 };
}
