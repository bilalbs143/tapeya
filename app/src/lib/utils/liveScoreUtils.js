/**
 * Home Live Score slider — API → MatchCard shape + WS patch helpers.
 */

/**
 * @param {object|null|undefined} team
 * @param {string} fallbackName
 */
function normaliseTeam(team, fallbackName = 'Team') {
  const name = team?.name || fallbackName;
  return {
    id: team?.id ?? null,
    name,
    initial: String(name).charAt(0).toUpperCase(),
    logo: team?.logo ?? null,
  };
}

/**
 * @param {{
 *   total_runs?: number,
 *   total_wickets?: number,
 *   overs_display?: string,
 *   target?: number|null,
 *   annotate?: boolean,
 *   overs_limit?: number,
 * }} args
 */
export function formatAnnotatedScore({
  total_runs = 0,
  total_wickets = 0,
  overs_display = '0.0',
  target = null,
  annotate = false,
  overs_limit = 20,
}) {
  const base = `${total_runs}/${total_wickets}`;
  if (!annotate) return base;

  const parts = [`${overs_display}/${overs_limit} OV`];
  if (target != null) parts.push(`T:${target}`);
  return `${base} (${parts.join(', ')})`;
}

/**
 * Map one API live-score row into MatchCard props.
 *
 * @param {object} row
 */
export function normaliseLiveScoreRow(row) {
  if (!row || typeof row !== 'object') return null;

  const home = normaliseTeam(row.home_team, 'Home team');
  const away = normaliseTeam(row.away_team, 'Away team');
  const oversLimit = Number(row.overs_limit) || 20;
  const innings = Array.isArray(row.innings) ? row.innings : [];
  const active = row.active_innings ?? null;
  const battingTeamId = active?.batting_team_id != null ? Number(active.batting_team_id) : null;
  const homeId = home.id != null ? Number(home.id) : null;
  const awayId = away.id != null ? Number(away.id) : null;

  const homeInn = innings.find((i) => Number(i?.batting_team_id) === homeId) ?? null;
  const awayInn = innings.find((i) => Number(i?.batting_team_id) === awayId) ?? null;
  const commentary =
    row.commentary || (Number(active?.innings_number) === 1 ? `Current run rate: ${active?.current_run_rate ?? '0.00'}.` : null);

  const scoreForTeam = (inn, teamId) => {
    if (!inn) return null;
    const isBatting = battingTeamId != null && Number(teamId) === battingTeamId;
    return formatAnnotatedScore({
      total_runs: inn.total_runs,
      total_wickets: inn.total_wickets,
      overs_display: inn.overs_display,
      target: isBatting ? (active?.target ?? null) : null,
      annotate: isBatting,
      overs_limit: oversLimit,
    });
  };

  return {
    id: row.id,
    tournament_id: row.tournament_id,
    status: 'live',
    matchId: row.match_label || row.tournament?.short_name || row.tournament?.name || 'Live Match',
    team1: home,
    team2: away,
    score1: scoreForTeam(homeInn, homeId),
    score2: scoreForTeam(awayInn, awayId),
    meta: commentary ? { commentary } : {},
    batting_team_id: battingTeamId,
    active_innings: active,
    raw: row,
  };
}

/**
 * @param {Array<object>|undefined|null} rows
 */
export function normaliseLiveScores(rows) {
  return (rows ?? []).map(normaliseLiveScoreRow).filter(Boolean);
}

/**
 * Apply a MatchStateUpdated payload onto one API live-score row (immutable).
 *
 * @param {object} row
 * @param {object} matchState
 * @returns {object|null} updated row, or null when the match should leave the feed
 */
export function applyMatchStateToLiveScoreRow(row, matchState) {
  if (!row || !matchState) return row;

  const status = matchState.match_status;
  if (status === 'completed' || status === 'cancelled' || matchState.match_complete) {
    return null;
  }

  const ai = matchState.active_innings;
  if (!ai) return row;

  const oversLimit = Number(row.overs_limit) || 20;
  const battingTeamId = ai.batting_team_id != null ? Number(ai.batting_team_id) : null;
  const nextActive = {
    innings_number: Number(ai.innings_number) || 1,
    innings_status: ai.innings_status ?? 'in_progress',
    batting_team_id: battingTeamId,
    bowling_team_id: ai.bowling_team_id != null ? Number(ai.bowling_team_id) : null,
    total_runs: Number(ai.total_runs) || 0,
    total_wickets: Number(ai.total_wickets) || 0,
    legal_balls: Number(ai.legal_balls) || 0,
    overs_display: ai.overs_display ?? '0.0',
    current_run_rate: ai.current_run_rate ?? '0.00',
    target: ai.target ?? null,
    runs_to_win: ai.runs_to_win ?? null,
    balls_remaining: ai.balls_remaining ?? null,
  };

  const innings = Array.isArray(row.innings) ? [...row.innings] : [];
  const idx = innings.findIndex((i) => Number(i?.innings_number) === nextActive.innings_number);
  if (idx === -1) {
    innings.push(nextActive);
  } else {
    innings[idx] = { ...innings[idx], ...nextActive };
  }

  let commentary =
    nextActive.innings_number === 1 ? `Current run rate: ${nextActive.current_run_rate}.` : (row.commentary ?? null);
  if (nextActive.innings_number === 2 && nextActive.runs_to_win != null && nextActive.balls_remaining != null) {
    const battingName =
      battingTeamId != null && Number(row.home_team?.id) === battingTeamId
        ? row.home_team?.name
        : battingTeamId != null && Number(row.away_team?.id) === battingTeamId
          ? row.away_team?.name
          : null;
    if (battingName) {
      const balls = nextActive.balls_remaining;
      if (balls <= 0) {
        commentary = `${battingName} need ${nextActive.runs_to_win} runs.`;
      } else if (balls % 6 === 0) {
        commentary = `${battingName} need ${nextActive.runs_to_win} runs from ${balls / 6} overs.`;
      } else {
        commentary = `${battingName} need ${nextActive.runs_to_win} runs from ${balls} balls.`;
      }
    }
  }

  return {
    ...row,
    overs_limit: oversLimit,
    innings,
    active_innings: nextActive,
    commentary,
  };
}
