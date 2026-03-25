/**
 * Scoring mappers – convert between API (match, scorecard, balls) and UI shape.
 * Keeps API enum values (dismissal_type, shot_position) aligned with backend.
 */

// -----------------------------------------------------------------------------
// Dismissal type: API GET /enums (dismissal_type) only – no fallback list
// API returns { value, label, requires_fielder } per option.
// -----------------------------------------------------------------------------

/** Dismissal options from API enums only. Returns [] if API not loaded or empty. */
export function getDismissalOptions(enumOptions) {
  if (!Array.isArray(enumOptions) || enumOptions.length === 0) return [];
  return enumOptions.map((o) => ({
    value: o.value,
    label: o.label,
    requires_fielder: Boolean(o.requires_fielder),
  }));
}

/** Whether this dismissal option requires a fielder (from API enum). */
export function dismissalRequiresFielder(option) {
  return Boolean(option?.requires_fielder);
}

// -----------------------------------------------------------------------------
// Extra type: API GET /enums (extra_type) for WD, NB, BYE, LB buttons
// API returns { value, label, short_label } per option. value = ball type ('wd', 'nb', etc.).
// -----------------------------------------------------------------------------

/** Extra type options from API only. Returns [] if not loaded or empty. */
export function getExtraTypeOptions(enumOptions) {
  if (!Array.isArray(enumOptions) || enumOptions.length === 0) return [];
  return enumOptions.map((o) => ({
    value: o.value,
    label: o.label,
    short_label: o.short_label ?? o.value?.toUpperCase() ?? o.value,
  }));
}

// -----------------------------------------------------------------------------
// Shot position: API GET /enums (shot_position) for shot-direction picker
// -----------------------------------------------------------------------------

/** Split label into two lines for stadium SVG (e.g. "Deep Fine Leg" -> "DEEP FINE", "LEG"). */
function labelToTwoLines(label) {
  if (!label || typeof label !== 'string') return { line1: '', line2: '' };
  const upper = label.toUpperCase().trim();
  const parts = upper.split(/\s+/);
  if (parts.length <= 1) return { line1: upper, line2: '' };
  const mid = Math.ceil(parts.length / 2);
  return {
    line1: parts.slice(0, mid).join(' '),
    line2: parts.slice(mid).join(' '),
  };
}

/** Shot position options from API; each zone has id (value), label, labelLine1, labelLine2. */
export function getShotPositionOptions(enumOptions) {
  if (!Array.isArray(enumOptions) || enumOptions.length === 0) return [];
  return enumOptions.map((o) => {
    const { line1, line2 } = labelToTwoLines(o.label);
    return {
      id: o.value,
      value: o.value,
      label: o.label?.toUpperCase() ?? o.value,
      labelLine1: line1,
      labelLine2: line2,
    };
  });
}

// -----------------------------------------------------------------------------
// Start Match form: match_overs, players_per_side
// -----------------------------------------------------------------------------

/** Options from API only. Value may be number (overs, players) or string. */
export function getMatchOversOptions(enumOptions) {
  if (!Array.isArray(enumOptions) || enumOptions.length === 0) return [];
  return enumOptions.map((o) => ({
    value: o.value,
    label: String(o.label ?? o.value),
  }));
}

export function getPlayersPerSideOptions(enumOptions) {
  if (!Array.isArray(enumOptions) || enumOptions.length === 0) return [];
  return enumOptions.map((o) => ({
    value: o.value,
    label: String(o.label ?? o.value),
  }));
}

/** Get label for a value from options list (e.g. for InfoTab display). */
export function getOptionLabel(options, value) {
  if (value == null || value === '') return '—';
  const opt = Array.isArray(options) && options.find((o) => o.value === value);
  return opt ? opt.label : String(value);
}

/** UI label -> API value. Uses API enum only; if not found returns slugified label. */
export function dismissalLabelToValue(label, enumOptions) {
  const list = Array.isArray(enumOptions) ? enumOptions : [];
  const found = list.find((o) => (o.label || o.value) === label);
  if (found) return found.value;
  return (label || '').toLowerCase().replace(/\s+/g, '_');
}

/** API value -> UI label. Uses API enum only; if not found returns value or '—'. */
export function dismissalValueToLabel(value, enumOptions) {
  if (value == null || value === '') return '—';
  const list = Array.isArray(enumOptions) ? enumOptions : [];
  const found = list.find((o) => o.value === value);
  return found ? found.label : (value ?? '—');
}

// -----------------------------------------------------------------------------
// API ball -> UI ball (for ballHistory, getRunsFromBall, etc.)
// -----------------------------------------------------------------------------

/**
 * Convert a single API ball to UI ball shape.
 * UI shape: { type: 'runs'|'out'|'wd'|'nb'|'bye'|'lb', runs?, strikerId?, bowlerId?, striker?, dismissalType?, dismissalLabel?, fielderId?, id? }
 * dismissalLabel comes from API dismissal_type_label (display only).
 */
export function apiBallToUiBall(apiBall, playerIdToName = {}) {
  if (!apiBall) return null;
  const id = apiBall.id;
  const runs = apiBall.runs ?? 0;
  const isWicket = apiBall.is_wicket === true;
  const isWide = apiBall.is_wide === true;
  const isNoBall = apiBall.is_no_ball === true;
  const isBye = apiBall.is_bye === true;
  const isLegBye = apiBall.is_leg_bye === true;

  let type = 'runs';
  if (isWicket) type = 'out';
  else if (isWide) type = 'wd';
  else if (isNoBall) type = 'nb';
  else if (isBye) type = 'bye';
  else if (isLegBye) type = 'lb';

  const ui = {
    type,
    runs: type === 'wd' || type === 'nb' ? (runs > 0 ? runs : 1) : runs,
    strikerId: apiBall.striker_id,
    nonStrikerId: apiBall.non_striker_id,
    bowlerId: apiBall.bowler_id,
    shotDirection: apiBall.shot_position ?? undefined,
    id,
  };

  if (type === 'out') {
    const outPlayerId = apiBall.out_player_id ?? apiBall.striker_id;
    ui.dismissalType = apiBall.dismissal_type ?? null;
    ui.dismissalLabel = apiBall.dismissal_type_label ?? undefined;
    ui.fielderId = apiBall.fielder_id ?? undefined;
    ui.striker = {
      id: outPlayerId,
      name: playerIdToName[outPlayerId] ?? '',
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      partnerRunsAtStart: 0,
      partnerBallsAtStart: 0,
    };
  }

  return ui;
}

/**
 * Convert scorecard innings balls to UI ballHistory.
 * Optionally pass a map striker_id/bowler_id/out_player_id -> name for display.
 */
export function scorecardInningsToBallHistory(innings, playerIdToName = {}) {
  const balls = innings?.balls ?? [];
  return balls.map((b) => apiBallToUiBall(b, playerIdToName));
}

// -----------------------------------------------------------------------------
// UI ball -> API payload (for storeBall)
// -----------------------------------------------------------------------------

/**
 * Compute over and ball_in_over from current ballHistory (only valid deliveries count).
 * Valid = not wide, not no-ball. ball_in_over is 1-6.
 */
export function computeOverAndBallInOver(ballHistory) {
  let validCount = 0;
  for (const b of ballHistory) {
    if (b.type !== 'wd' && b.type !== 'nb') validCount += 1;
  }
  const over = Math.floor(validCount / 6);
  const ballInOver = validCount % 6 || 6;
  return { over, ball_in_over: ballInOver };
}

/**
 * Build API storeBall payload from UI state.
 * @param {Object} params
 * @param {Array} params.ballHistory - current UI ballHistory (before appending this ball)
 * @param {Object} params.ball - UI ball being added (type, runs, strikerId, bowlerId, etc.)
 * @param {number} params.nonStrikerId - non-striker user id
 * @param {number} [params.fielderId] - required for caught, run_out, stumped
 */
export function uiBallToStoreBallPayload({
  ballHistory,
  ball,
  nonStrikerId,
  fielderId,
}) {
  const { over, ball_in_over } = computeOverAndBallInOver(ballHistory);
  const type = ball.type;
  const isWide = type === 'wd';
  const isNoBall = type === 'nb';
  const isBye = type === 'bye';
  const isLegBye = type === 'lb';
  const isWicket = type === 'out';

  let runs = 0;
  let runsOffBat = 0;
  if (type === 'runs') {
    runs = ball.runs ?? 0;
    runsOffBat = runs;
  } else if (isWide || isNoBall) {
    runs = Math.max(0, Number(ball.runs) || 1);
    runsOffBat = isNoBall ? Math.max(0, runs - 1) : 0;
  } else if (isBye || isLegBye) {
    runs = Math.max(0, Number(ball.runs) || 0);
    runsOffBat = 0;
  }

  const dismissalValue =
    isWicket && ball.dismissalType
      ? typeof ball.dismissalType === 'string' &&
        ball.dismissalType.includes('_')
        ? ball.dismissalType
        : dismissalLabelToValue(ball.dismissalType)
      : null;

  const payload = {
    over,
    ball_in_over: Math.min(ball_in_over, 7),
    striker_id: Number(ball.strikerId ?? ball.striker?.id),
    non_striker_id: Number(nonStrikerId),
    bowler_id: Number(ball.bowlerId),
    runs,
    runs_off_bat: runsOffBat,
    is_no_ball: isNoBall,
    is_wide: isWide,
    is_leg_bye: isLegBye,
    is_bye: isBye,
    penalty_runs: 0,
    is_wicket: isWicket,
    dismissal_type: dismissalValue,
    out_player_id: isWicket ? Number(ball.striker?.id ?? ball.strikerId) : null,
    fielder_id:
      isWicket && (fielderId ?? ball.fielderId) != null
        ? Number(fielderId ?? ball.fielderId)
        : null,
    shot_position: ball.shotDirection ?? null,
  };

  return payload;
}

// -----------------------------------------------------------------------------
// API match + scorecard -> UI match config and initial state
// -----------------------------------------------------------------------------

/**
 * Toss winner team id. After a match is completed, `winning_team_id` is the match winner;
 * use `toss_winner_team_id` when present. Legacy completed rows may infer from innings 1 + chose_to.
 *
 * @param {object|null} apiMatch
 * @param {object|null} [scorecard]
 * @returns {number|null}
 */
export function getTossWinnerTeamId(apiMatch, scorecard) {
  if (!apiMatch) return null;
  if (apiMatch.toss_winner_team_id != null) {
    return Number(apiMatch.toss_winner_team_id);
  }
  if (apiMatch.status !== 'completed') {
    return apiMatch.winning_team_id != null
      ? Number(apiMatch.winning_team_id)
      : null;
  }
  const inn1 = scorecard?.innings?.[0];
  const choseBat = apiMatch.chose_to_bat_or_bowl === 'bat';
  if (
    inn1?.batting_team_id != null &&
    inn1?.bowling_team_id != null &&
    apiMatch.chose_to_bat_or_bowl
  ) {
    return choseBat
      ? Number(inn1.batting_team_id)
      : Number(inn1.bowling_team_id);
  }
  return apiMatch.winning_team_id != null
    ? Number(apiMatch.winning_team_id)
    : null;
}

/**
 * Build UI match config from API match response.
 * API match must include overs (required). Other fields: home_team, away_team,
 * toss_winner_team_id / winning_team_id, chose_to_bat_or_bowl, venue_name, match_date, match_time, players_per_side.
 *
 * @param {object|null} [scorecard] optional; used to infer toss winner on legacy completed matches.
 */
export function apiMatchToUiMatchConfig(
  apiMatch,
  battingPlayers = [],
  bowlingPlayers = [],
  scorecard = null,
) {
  if (!apiMatch) return null;
  const home = apiMatch.home_team ?? {};
  const away = apiMatch.away_team ?? {};
  const winningId = getTossWinnerTeamId(apiMatch, scorecard);
  const choseBat = apiMatch.chose_to_bat_or_bowl === 'bat';
  const hid = home.id != null ? Number(home.id) : null;
  const aid = away.id != null ? Number(away.id) : null;
  const wid = winningId != null ? Number(winningId) : null;
  const battingTeamId =
    wid != null && choseBat
      ? wid
      : wid === hid
        ? aid
        : hid;
  const bowlingTeamId = battingTeamId === hid ? aid : hid;

  const battingTeam =
    battingTeamId != null && hid != null && Number(battingTeamId) === hid
      ? home
      : away;
  const bowlingTeam =
    bowlingTeamId != null && hid != null && Number(bowlingTeamId) === hid
      ? home
      : away;

  const teamA = {
    name: battingTeam.name ?? '',
    id: battingTeam.id,
    players: battingPlayers.length
      ? battingPlayers.map((p) => ({
          id: p.id,
          name: p.name ?? p.nickname ?? '',
        }))
      : [],
  };
  const teamB = {
    name: bowlingTeam.name ?? '',
    id: bowlingTeam.id,
    players: bowlingPlayers.length
      ? bowlingPlayers.map((p) => ({
          id: p.id,
          name: p.name ?? p.nickname ?? '',
        }))
      : [],
  };

  return {
    id: apiMatch.id,
    teamA,
    teamB,
    venue: apiMatch.venue_name ?? '',
    matchDate: apiMatch.match_date ?? '',
    matchTime: apiMatch.match_time ?? '',
    overs: apiMatch.overs,
    playersPerSide: apiMatch.players_per_side,
    toss: wid != null
      ? {
          winner: wid === hid ? 'A' : 'B',
          decision: apiMatch.chose_to_bat_or_bowl === 'bat' ? 'bat' : 'bowl',
        }
      : null,
    battingTeamId,
    bowlingTeamId,
  };
}

/**
 * Build playerId -> name map from team squad (UserResource list) and playing eleven ids.
 */
export function buildPlayerIdToName(squadList = [], playingElevenIds = []) {
  const map = {};
  const ids = new Set(Array.isArray(playingElevenIds) ? playingElevenIds : []);
  for (const p of squadList) {
    const id = p.id ?? p.user_id;
    if (id && ids.has(id)) map[id] = p.name ?? p.nickname ?? '';
  }
  return map;
}
