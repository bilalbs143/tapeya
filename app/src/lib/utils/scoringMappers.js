/**
 * scoringMappers.js
 *
 * Convert between API shapes (match, scorecard, balls, enums) and UI shapes.
 * Pure functions — no React, no side effects.
 */

// ─── Dismissal options ────────────────────────────────────────────────────────

/**
 * Build the dismissal pick-list from API enums.
 * Returns [] if API enums are not yet loaded.
 *
 * @param {object[]|undefined} enumOptions  GET /enums → dismissal_type
 * @returns {{ value: string, label: string, requires_fielder: boolean, valid_on_free_hit: boolean }[]}
 */
export function getDismissalOptions(enumOptions) {
  if (!Array.isArray(enumOptions) || enumOptions.length === 0) return [];
  return enumOptions.map((o) => ({
    value: o.value,
    label: o.label,
    requires_fielder: Boolean(o.requires_fielder),
    valid_on_free_hit: Boolean(o.valid_on_free_hit),
    counts_as_wicket: o.counts_as_wicket !== false, // default true unless explicitly false
  }));
}

/**
 * Whether a dismissal option requires a fielder ID.
 * @param {{ requires_fielder: boolean }|string} option
 */
export function dismissalRequiresFielder(option) {
  return Boolean(
    typeof option === 'object' && option !== null
      ? option.requires_fielder
      : false,
  );
}

/**
 * Filter dismissal options to only those valid on a free-hit delivery.
 * Falls back to run_out / obstructing_the_field / hit_ball_twice if
 * the API enum does not carry a valid_on_free_hit flag.
 *
 * @param {object[]} options
 * @returns {object[]}
 */
export function getFreeHitDismissalOptions(options) {
  if (!Array.isArray(options)) return [];
  const FREE_HIT_TYPES = new Set([
    'run_out',
    'obstructing_the_field',
    'hit_ball_twice',
  ]);
  return options.filter((o) =>
    o.valid_on_free_hit !== undefined
      ? o.valid_on_free_hit
      : FREE_HIT_TYPES.has(o.value),
  );
}

/**
 * Dismissal options that do NOT count as a wicket (for retired_hurt).
 * @param {object[]} options
 */
export function getNonWicketDismissalOptions(options) {
  if (!Array.isArray(options)) return [];
  return options.filter((o) => o.counts_as_wicket === false);
}

// ─── Extra type options ───────────────────────────────────────────────────────

/**
 * Build the extras type pick-list (WD / NB / Bye / LB buttons) from API enums.
 *
 * @param {object[]|undefined} enumOptions  GET /enums → extra_type
 * @returns {{ value: string, label: string, short_label: string }[]}
 */
export function getExtraTypeOptions(enumOptions) {
  if (!Array.isArray(enumOptions) || enumOptions.length === 0) return [];
  return enumOptions.map((o) => ({
    value: o.value,
    label: o.label,
    short_label: o.short_label ?? o.value?.toUpperCase() ?? o.value,
  }));
}

// ─── Shot position options ────────────────────────────────────────────────────

/** Split a label into two lines for the stadium SVG. */
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

/**
 * Build shot position options from API enums.
 *
 * @param {object[]|undefined} enumOptions  GET /enums → shot_position
 * @returns {{ id: string, value: string, label: string, labelLine1: string, labelLine2: string }[]}
 */
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

// ─── Start-match form options ─────────────────────────────────────────────────

/** Match overs options from API enums. */
export function getMatchOversOptions(enumOptions) {
  if (!Array.isArray(enumOptions) || enumOptions.length === 0) return [];
  return enumOptions.map((o) => ({
    value: o.value,
    label: String(o.label ?? o.value),
  }));
}

/** Players per side options from API enums. */
export function getPlayersPerSideOptions(enumOptions) {
  if (!Array.isArray(enumOptions) || enumOptions.length === 0) return [];
  return enumOptions.map((o) => ({
    value: o.value,
    label: String(o.label ?? o.value),
  }));
}

/** Get display label for an enum value (e.g. for InfoTab). */
export function getOptionLabel(options, value) {
  if (value == null || value === '') return '—';
  const opt = Array.isArray(options) && options.find((o) => o.value === value);
  return opt ? opt.label : String(value);
}

// ─── Dismissal label ↔ value ──────────────────────────────────────────────────

/** UI label → API value.  Falls back to a slugified form of the label. */
export function dismissalLabelToValue(label, enumOptions) {
  const list = Array.isArray(enumOptions) ? enumOptions : [];
  const found = list.find((o) => (o.label || o.value) === label);
  if (found) return found.value;
  return (label || '').toLowerCase().replace(/\s+/g, '_');
}

/** API value → UI label.  Falls back to the raw value. */
export function dismissalValueToLabel(value, enumOptions) {
  if (value == null || value === '') return '—';
  const list = Array.isArray(enumOptions) ? enumOptions : [];
  const found = list.find((o) => o.value === value);
  return found ? found.label : (value ?? '—');
}

// ─── API ball → UI ball ───────────────────────────────────────────────────────

/**
 * Convert a single API ball object to UI-shape.
 *
 * UI shape:
 *   {
 *     type: 'runs'|'out'|'wd'|'nb'|'bye'|'lb'|'retired_hurt',
 *     runs?: number,
 *     isFreeHit?: boolean,
 *     penaltyRuns?: number,
 *     strikerId?, nonStrikerId?, bowlerId?,
 *     shotDirection?,
 *     id?,
 *     // only when type === 'out' or 'retired_hurt':
 *     dismissalType?, dismissalLabel?, fielderId?,
 *     striker?: { id, name, runs, balls, fours, sixes, ... },
 *   }
 *
 * @param {object} apiBall
 * @param {Record<string,string>} playerIdToName  id → display name map
 * @returns {object|null}
 */
export function apiBallToUiBall(apiBall, playerIdToName = {}) {
  if (!apiBall) return null;

  const {
    id,
    runs = 0,
    is_wicket: isWicket = false,
    is_wide: isWide = false,
    is_no_ball: isNoBall = false,
    is_bye: isBye = false,
    is_leg_bye: isLegBye = false,
    is_free_hit: isFreeHit = false,
    penalty_runs: penaltyRuns = 0,
    dismissal_type: dismissalType = null,
    dismissal_type_label: dismissalLabel,
    fielder_id: fielderId,
    shot_position: shotPosition,
    striker_id: strikerId,
    non_striker_id: nonStrikerId,
    bowler_id: bowlerId,
    out_player_id: outPlayerId,
  } = apiBall;

  // Determine UI ball type
  let type = 'runs';
  if (isWicket) {
    type = dismissalType === 'retired_hurt' ? 'retired_hurt' : 'out';
  } else if (isWide) type = 'wd';
  else if (isNoBall) type = 'nb';
  else if (isBye) type = 'bye';
  else if (isLegBye) type = 'lb';

  const ui = {
    type,
    // WD/NB always contribute at least 1 run even if API sends 0.
    runs: type === 'wd' || type === 'nb' ? Math.max(1, runs) : runs,
    isFreeHit: Boolean(isFreeHit),
    penaltyRuns: penaltyRuns || 0,
    strikerId,
    nonStrikerId,
    bowlerId,
    shotDirection: shotPosition ?? undefined,
    id,
  };

  if (type === 'out' || type === 'retired_hurt') {
    const outId = outPlayerId ?? strikerId;
    ui.dismissalType = dismissalType ?? null;
    ui.dismissalLabel = dismissalLabel ?? undefined;
    ui.fielderId = fielderId ?? undefined;
    ui.striker = {
      id: outId,
      name: playerIdToName[outId] ?? '',
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
 * Convert scorecard innings balls array to UI ball history.
 *
 * @param {object|null}            innings         API innings object (has .balls)
 * @param {Record<string,string>}  playerIdToName  id → name map
 * @returns {object[]}
 */
export function scorecardInningsToBallHistory(innings, playerIdToName = {}) {
  const balls = innings?.balls ?? [];
  return balls.map((b) => apiBallToUiBall(b, playerIdToName)).filter(Boolean);
}

// ─── API partnerships → UI state ──────────────────────────────────────────────

/**
 * Convert API partnerships array to UI state.
 * wicket_number === null → open (current) partnership.
 *
 * @param {object[]} partnerships
 * @param {Record<string,string>} playerIdToName
 * @returns {{ completed: object[], current: { runs: number, balls: number }|null }}
 */
export function apiPartnershipsToUiState(partnerships, playerIdToName = {}) {
  const list = Array.isArray(partnerships) ? partnerships : [];
  const label = (id) =>
    playerIdToName[String(id)] ?? (id != null ? `Player ${id}` : '—');
  const completed = [];
  let current = null;

  list.forEach((p, i) => {
    const row = {
      id: `api-p-${i}-${p.player_1_id}-${p.player_2_id}`,
      batter1: { name: label(p.player_1_id), runs: null, balls: null },
      batter2: { name: label(p.player_2_id), runs: null, balls: null },
      runs: p.runs ?? 0,
      balls: p.balls ?? 0,
    };
    if (p.wicket_number != null) {
      completed.push(row);
    } else {
      current = { runs: p.runs ?? 0, balls: p.balls ?? 0 };
    }
  });

  return { completed, current };
}

// ─── Ball position helpers ────────────────────────────────────────────────────

/**
 * Compute over number and ball-in-over from ball history (for storeBall payload).
 * Only legal deliveries count. ball_in_over is 1-based (1-6).
 *
 * @param {object[]} ballHistory  current history BEFORE appending this ball
 * @returns {{ over: number, ball_in_over: number }}
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

// ─── UI ball → API storeBall payload ─────────────────────────────────────────

/**
 * Build the API storeBall request body from a UI ball object.
 *
 * @param {object} params
 * @param {object[]} params.ballHistory     history BEFORE this ball
 * @param {object}   params.ball            UI ball being added
 * @param {number}   params.nonStrikerId    non-striker player ID
 * @param {number}   [params.fielderId]     required for caught / run_out / stumped
 * @param {boolean}  [params.isFreeHit]     whether this is a free-hit delivery
 */
export function uiBallToStoreBallPayload({
  ballHistory,
  ball,
  nonStrikerId,
  fielderId,
  isFreeHit = false,
}) {
  const { over, ball_in_over } = computeOverAndBallInOver(ballHistory);
  const type = ball.type;
  const isWide = type === 'wd';
  const isNoBall = type === 'nb';
  const isBye = type === 'bye';
  const isLegBye = type === 'lb';
  const isWicket = type === 'out';
  const isRetiredHurt = type === 'retired_hurt';

  let runs = 0;
  let runsOffBat = 0;

  if (type === 'runs') {
    runs = ball.runs ?? 0;
    runsOffBat = runs;
  } else if (isWide || isNoBall) {
    // ball.runs is the TOTAL (batting/overthrow runs + mandatory 1 penalty),
    // as computed by useScoringEngine.  Minimum is always 1.
    runs = Math.max(1, Number(ball.runs) || 1);
    // For NB: runs_off_bat = total − 1 penalty. For WD: 0 (runs_off_bat stay 0).
    runsOffBat = isNoBall ? Math.max(0, runs - 1) : 0;
  } else if (isBye || isLegBye) {
    runs = Math.max(0, Number(ball.runs) || 0);
    runsOffBat = 0;
  } else if (isRetiredHurt) {
    runs = 0;
    runsOffBat = 0;
  }

  // Resolve dismissal value (API expects snake_case value, not a label).
  const rawDismissal =
    isWicket || isRetiredHurt ? (ball.dismissalType ?? null) : null;
  const dismissalValue = rawDismissal
    ? typeof rawDismissal === 'string' && rawDismissal.includes('_')
      ? rawDismissal
      : dismissalLabelToValue(rawDismissal)
    : null;

  const outPlayerId =
    isWicket || isRetiredHurt
      ? Number(ball.striker?.id ?? ball.strikerId)
      : null;

  const resolvedFielderId =
    (isWicket || isRetiredHurt) && (fielderId ?? ball.fielderId) != null
      ? Number(fielderId ?? ball.fielderId)
      : null;

  return {
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
    is_free_hit: Boolean(isFreeHit || ball.isFreeHit),
    penalty_runs: Number(ball.penaltyRuns ?? 0),
    // retired_hurt is stored as is_wicket=true with dismissal_type='retired_hurt'.
    // This is the API convention: isRetiredHurt() on the model checks the dismissal_type.
    is_wicket: isWicket || isRetiredHurt,
    dismissal_type: dismissalValue,
    out_player_id: outPlayerId,
    fielder_id: resolvedFielderId,
    shot_position: ball.shotDirection ?? null,
  };
}

// ─── Toss winner resolution ───────────────────────────────────────────────────

/**
 * Resolve the toss winner team ID from match data.
 * Handles the legacy case where completed matches don't have toss_winner_team_id.
 *
 * @param {object|null} apiMatch
 * @param {object|null} [scorecard]
 * @returns {number|null}
 */
export function getTossWinnerTeamId(apiMatch, scorecard) {
  if (!apiMatch) return null;
  if (apiMatch.toss_winner_team_id != null)
    return Number(apiMatch.toss_winner_team_id);
  if (apiMatch.status !== 'completed') {
    return apiMatch.winning_team_id != null
      ? Number(apiMatch.winning_team_id)
      : null;
  }
  const inn1 = scorecard?.innings?.[0];
  if (inn1?.batting_team_id != null && apiMatch.chose_to_bat_or_bowl) {
    const choseBat = apiMatch.chose_to_bat_or_bowl === 'bat';
    return choseBat
      ? Number(inn1.batting_team_id)
      : Number(inn1.bowling_team_id);
  }
  return apiMatch.winning_team_id != null
    ? Number(apiMatch.winning_team_id)
    : null;
}

// ─── API match → UI match config ──────────────────────────────────────────────

/**
 * Build UI match config from an API match response + optional playing XI data.
 *
 * @param {object|null} apiMatch
 * @param {object[]} battingPlayers   [{ id, name }] for batting team in innings 1
 * @param {object[]} bowlingPlayers   [{ id, name }] for bowling team in innings 1
 * @param {object|null} [scorecard]   Used to infer toss on legacy completed matches
 * @returns {object|null}
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
  const battingTeamId = wid != null && choseBat ? wid : wid === hid ? aid : hid;
  const bowlingTeamId = battingTeamId === hid ? aid : hid;

  const battingTeam =
    battingTeamId != null && hid != null && Number(battingTeamId) === hid
      ? home
      : away;
  const bowlingTeam =
    bowlingTeamId != null && hid != null && Number(bowlingTeamId) === hid
      ? home
      : away;

  return {
    id: apiMatch.id,
    teamA: {
      name: battingTeam.name ?? '',
      id: battingTeam.id,
      players: battingPlayers.map((p) => ({
        id: p.id,
        name: p.name ?? p.nickname ?? '',
      })),
    },
    teamB: {
      name: bowlingTeam.name ?? '',
      id: bowlingTeam.id,
      players: bowlingPlayers.map((p) => ({
        id: p.id,
        name: p.name ?? p.nickname ?? '',
      })),
    },
    venue: apiMatch.venue_name ?? '',
    matchDate: apiMatch.match_date ?? '',
    matchTime: apiMatch.match_time ?? '',
    overs: apiMatch.overs,
    playersPerSide: apiMatch.players_per_side,
    toss:
      wid != null
        ? {
            winner: wid === hid ? 'A' : 'B',
            decision: choseBat ? 'bat' : 'bowl',
          }
        : null,
    battingTeamId,
    bowlingTeamId,
  };
}

// ─── Player ID → name map ─────────────────────────────────────────────────────

/**
 * Build a { id → name } map from a squad list filtered by playing XI IDs.
 *
 * @param {object[]} squadList         Array of { id, name, nickname, ... }
 * @param {number[]} playingElevenIds  Only IDs in this set are included
 * @returns {Record<string, string>}
 */
export function buildPlayerIdToName(squadList = [], playingElevenIds = []) {
  const map = {};
  const ids = new Set(
    Array.isArray(playingElevenIds) ? playingElevenIds.map(String) : [],
  );
  for (const p of squadList) {
    const id = p.id ?? p.user_id;
    if (id && ids.has(String(id))) {
      map[String(id)] = p.name ?? p.nickname ?? '';
    }
  }
  return map;
}
