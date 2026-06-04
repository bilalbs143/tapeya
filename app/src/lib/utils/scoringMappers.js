/**
 * scoringMappers.js
 *
 * Convert between API shapes (match, scorecard, balls, enums) and UI shapes.
 * Pure functions — no React, no side effects.
 */

import { squadPlayerProfileFields } from '@/lib/utils/playerUtils';

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
  return Boolean(typeof option === 'object' && option !== null ? option.requires_fielder : false);
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
  const FREE_HIT_TYPES = new Set(['run_out', 'obstructing_the_field', 'hit_ball_twice']);
  return options.filter((o) => (o.valid_on_free_hit !== undefined ? o.valid_on_free_hit : FREE_HIT_TYPES.has(o.value)));
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
 *     type: 'runs'|'out'|'wd'|'nb'|'bye'|'lb'|'retired_hurt'|'penalty',
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

  const penaltyOnly =
    !isWicket && !isWide && !isNoBall && !isBye && !isLegBye && (Number(penaltyRuns) || 0) > 0 && (Number(runs) || 0) === 0;

  // Determine UI ball type
  let type = 'runs';
  if (isWicket) {
    type = dismissalType === 'retired_hurt' ? 'retired_hurt' : 'out';
  } else if (penaltyOnly) type = 'penalty';
  else if (isWide) type = 'wd';
  else if (isNoBall) type = 'nb';
  else if (isBye) type = 'bye';
  else if (isLegBye) type = 'lb';

  const ui = {
    type,
    // WD/NB always contribute at least 1 run even if API sends 0.
    runs: type === 'wd' || type === 'nb' ? Math.max(1, runs) : type === 'penalty' ? 0 : runs,
    // Carry runs_off_bat so uiBallToStoreBallPayload round-trips correctly
    // can distinguish batter runs from the implicit NB/WD penalty without arithmetic.
    runsOffBat: Number(apiBall.runs_off_bat ?? 0),
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
 * Name resolution order:
 *   1. playerIdToName (built from squad + playing-eleven)
 *   2. battingStats   (scorecard batting_stats — covers players who came in after
 *      a wicket but were not in the saved playing XI)
 *
 * Per-player runs/balls come from player_1_runs, player_1_balls, player_2_runs,
 * player_2_balls fields that the backend computes in partnershipsForInnings().
 *
 * @param {object[]} partnerships
 * @param {Record<string,string>} playerIdToName
 * @param {object[]} battingStats  scorecard innings batting_stats array
 * @returns {{ completed: object[], current: object|null }}
 */
export function apiPartnershipsToUiState(partnerships, playerIdToName = {}, battingStats = []) {
  const list = Array.isArray(partnerships) ? partnerships : [];

  // Name fallback: batting_stats always has every player who actually batted,
  // regardless of playing-XI status.
  const statsByPlayerId = {};
  for (const s of battingStats) {
    if (s.id != null) statsByPlayerId[String(s.id)] = s;
  }

  const label = (id) => {
    if (id == null) return '—';
    const idStr = String(id);
    return playerIdToName[idStr] ?? statsByPlayerId[idStr]?.name ?? `Player ${id}`;
  };

  const completed = [];
  let current = null;

  list.forEach((p, i) => {
    const row = {
      id: `api-p-${i}-${p.player_1_id}-${p.player_2_id}`,
      batter1: {
        name: label(p.player_1_id),
        runs: p.player_1_runs ?? null,
        balls: p.player_1_balls ?? null,
      },
      batter2: {
        name: label(p.player_2_id),
        runs: p.player_2_runs ?? null,
        balls: p.player_2_balls ?? null,
      },
      runs: p.runs ?? 0,
      balls: p.balls ?? 0,
    };
    if (p.wicket_number != null) {
      completed.push(row);
    } else {
      current = row;
    }
  });

  return { completed, current };
}

// ─── UI ball → API storeBall payload ─────────────────────────────────────────

/**
 * Build the API storeBall request body from a UI ball object.
 * Backend computes over/ball_in_over, is_free_hit, and total runs — we only
 * send the raw inputs.
 *
 * @param {object} params
 * @param {object} params.ball          UI ball being added
 * @param {number} params.nonStrikerId  non-striker player ID
 * @param {number} [params.fielderId]   required for caught / run_out / stumped
 */
export function uiBallToStoreBallPayload({ ball, nonStrikerId, fielderId }) {
  const type = ball.type;
  const isWide = type === 'wd';
  const isNoBall = type === 'nb';
  const isBye = type === 'bye';
  const isLegBye = type === 'lb';
  const isWicket = type === 'out';
  const isRetiredHurt = type === 'retired_hurt';

  // runs_off_bat: batter-scored runs only (0 for all extras).
  // extra_runs: byes/leg-byes/overthrows on top of the mandatory WD/NB penalty.
  let runsOffBat = 0;
  let extraRuns = 0;

  if (type === 'runs') {
    runsOffBat = ball.runs ?? 0;
  } else if (isNoBall) {
    // ball.runsOffBat is set explicitly by handleSpecial (new ball) and apiBallToUiBall
    // (round-trip from API). Prefer it; fall back to subtracting the implicit 1-run
    // penalty from the total only when the field is absent (legacy data).
    runsOffBat = ball.runsOffBat != null ? Number(ball.runsOffBat) : Math.max(0, (ball.runs ?? 1) - 1);
  } else if (isWide) {
    // ball.extraRuns is set explicitly by handleSpecial (new ball) as the overthrow/extra
    // runs selected in the dialog. Fall back to total-minus-penalty for the update path
    // (apiBallToUiBall does not set extraRuns for wides since all WD runs are extras).
    extraRuns = ball.extraRuns != null ? Number(ball.extraRuns) : Math.max(0, (ball.runs ?? 1) - 1);
  } else if (isBye || isLegBye) {
    extraRuns = ball.runs ?? 0;
  }

  const rawDismissal = isWicket || isRetiredHurt ? (ball.dismissalType ?? null) : null;
  const dismissalValue = rawDismissal
    ? typeof rawDismissal === 'string' && rawDismissal.includes('_')
      ? rawDismissal
      : dismissalLabelToValue(rawDismissal)
    : null;

  const outPlayerId = isWicket || isRetiredHurt ? Number(ball.striker?.id ?? ball.strikerId) : null;

  const resolvedFielderId =
    (isWicket || isRetiredHurt) && (fielderId ?? ball.fielderId) != null ? Number(fielderId ?? ball.fielderId) : null;

  return {
    striker_id: Number(ball.strikerId ?? ball.striker?.id),
    non_striker_id: Number(nonStrikerId),
    bowler_id: Number(ball.bowlerId),
    runs_off_bat: runsOffBat,
    extra_runs: extraRuns,
    is_no_ball: isNoBall,
    is_wide: isWide,
    is_leg_bye: isLegBye,
    is_bye: isBye,
    penalty_runs: Number(ball.penaltyRuns ?? 0),
    // retired_hurt uses is_wicket=true to signal a player left the crease;
    // MatchCompletionService and InningsStatsService exclude it from wicket counts.
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
  if (apiMatch.toss_winner_team_id != null) return Number(apiMatch.toss_winner_team_id);
  if (apiMatch.status !== 'completed') {
    return apiMatch.winning_team_id != null ? Number(apiMatch.winning_team_id) : null;
  }
  const inn1 = scorecard?.innings?.[0];
  if (inn1?.batting_team_id != null && apiMatch.chose_to_bat_or_bowl) {
    const choseBat = apiMatch.chose_to_bat_or_bowl === 'bat';
    return choseBat ? Number(inn1.batting_team_id) : Number(inn1.bowling_team_id);
  }
  return apiMatch.winning_team_id != null ? Number(apiMatch.winning_team_id) : null;
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
export function apiMatchToUiMatchConfig(apiMatch, battingPlayers = [], bowlingPlayers = [], scorecard = null) {
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

  const battingTeam = battingTeamId != null && hid != null && Number(battingTeamId) === hid ? home : away;
  const bowlingTeam = bowlingTeamId != null && hid != null && Number(bowlingTeamId) === hid ? home : away;

  return {
    id: apiMatch.id,
    teamA: {
      name: battingTeam.name ?? '',
      id: battingTeam.id,
      logo: battingTeam.logo ?? null,
      players: battingPlayers.map((p) => ({
        id: p.id,
        name: p.name ?? p.nickname ?? '',
      })),
    },
    teamB: {
      name: bowlingTeam.name ?? '',
      id: bowlingTeam.id,
      logo: bowlingTeam.logo ?? null,
      players: bowlingPlayers.map((p) => ({
        id: p.id,
        name: p.name ?? p.nickname ?? '',
      })),
    },
    homeTeam: {
      name: home.name ?? '',
      id: home.id,
      logo: home.logo ?? null,
    },
    awayTeam: {
      name: away.name ?? '',
      id: away.id,
      logo: away.logo ?? null,
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
  const ids = new Set(Array.isArray(playingElevenIds) ? playingElevenIds.map(String) : []);
  for (const p of squadList) {
    const id = p.id ?? p.user_id;
    if (id && ids.has(String(id))) {
      map[String(id)] = p.name ?? p.nickname ?? '';
    }
  }
  return map;
}

// ─── Squad role helpers ───────────────────────────────────────────────────────

/**
 * Build a squad array with correct playing/bench roles.
 * Roles are ALWAYS re-derived from playingIds — never trusted from the input
 * object — so team-flip re-mapping is safe.
 *
 * @param {object[]} squadList    Array of { id, name, ... } objects.
 * @param {number[]} playingIds   IDs that should be marked 'playing'.
 * @returns {{ id, name, role }[]}
 */
export function buildRoleSquad(squadList, playingIds) {
  const playingSet = new Set((playingIds ?? []).map(String));
  return (squadList ?? [])
    .filter((p) => p.id != null)
    .map((p) => {
      const id = p.id ?? p.user_id;
      return {
        ...squadPlayerProfileFields(p),
        id,
        name: p.name ?? p.nickname ?? `Player ${id}`,
        role: playingSet.has(String(id)) ? 'playing' : 'bench',
      };
    });
}

// ─── Live scoring UI helpers (backend-first) ─────────────────────────────────

export const INITIAL_PARTNERSHIP = { runs: 0, balls: 0 };

/** Map match_state batter slice → UI batter shape. */
function stateBatterToUi(b) {
  if (!b) return null;
  return {
    id: b.id,
    name: b.name ?? '',
    runs: b.runs ?? 0,
    balls: b.balls ?? 0,
    fours: b.fours ?? 0,
    sixes: b.sixes ?? 0,
    partnerRunsAtStart: 0,
    partnerBallsAtStart: 0,
  };
}

/** Map match_state bowler slice → UI bowler shape. */
function stateBowlerToUi(b) {
  if (!b) return null;
  return {
    id: b.id,
    name: b.name ?? '',
    overs: b.overs ?? '0',
    maidens: b.maidens ?? 0,
    runs: b.runs ?? 0,
    wickets: b.wickets ?? 0,
    balls: 0,
  };
}

/** Striker + non-striker array from `active_innings` (striker always index 0). */
export function batsmenOnCreaseFromMatchState(activeInnings) {
  if (!activeInnings) return [];
  return [stateBatterToUi(activeInnings.striker), stateBatterToUi(activeInnings.non_striker)].filter(Boolean);
}

/** Legal balls bowled from an overs display string (e.g. "3.2" → 20). */
export function oversDisplayToLegalBalls(oversDisplay) {
  if (oversDisplay == null || oversDisplay === '') return 0;
  const parts = String(oversDisplay).split('.');
  const whole = parseInt(parts[0], 10) || 0;
  const partial = parseInt(parts[1], 10) || 0;
  return whole * 6 + Math.min(Math.max(partial, 0), 5);
}

/** Completed full overs only (integer part of overs display). */
export function oversDisplayToCompletedOvers(oversDisplay) {
  const whole = parseInt(String(oversDisplay ?? '0').split('.')[0], 10);
  return Number.isFinite(whole) ? whole : 0;
}

/** Scorecard `bowling_stats` row → UI bowler shape for the live table. */
export function scorecardBowlerToUi(row) {
  if (!row?.id) return null;
  return {
    id: row.id,
    name: row.name ?? '',
    overs: row.overs ?? '0',
    maidens: row.maidens ?? 0,
    runs: row.runs ?? 0,
    wickets: row.wickets ?? 0,
    balls: oversDisplayToLegalBalls(row.overs),
  };
}

/**
 * Live bowler table (max 2): current bowler from match_state; previous from scorecard
 * bowling_stats (most completed overs among others).
 */
export function bowlersInTableForLiveScoring(activeInnings, bowlingStats = []) {
  const current = stateBowlerToUi(activeInnings?.bowler);
  if (!current) return [];

  const currentId = String(current.id);
  const others = (bowlingStats ?? []).filter((b) => b?.id != null && String(b.id) !== currentId);

  if (others.length === 0) return [current];

  const previousRow = others.reduce((best, b) => {
    if (!best) return b;
    const bestOvers = oversDisplayToCompletedOvers(best.overs);
    const bOvers = oversDisplayToCompletedOvers(b.overs);
    if (bOvers !== bestOvers) return bOvers > bestOvers ? b : best;
    return oversDisplayToLegalBalls(b.overs) > oversDisplayToLegalBalls(best.overs) ? b : best;
  }, null);

  const previous = scorecardBowlerToUi(previousRow);
  return previous ? [previous, current] : [current];
}

/** Current bowler only (e.g. pre-ball PATCH /crease sync). */
export function bowlersInTableFromMatchState(activeInnings) {
  const bowler = stateBowlerToUi(activeInnings?.bowler);
  return bowler ? [bowler] : [];
}

/** Index of the active bowler in a `bowlersInTable` array (defaults to last slot). */
export function currentBowlerIndexInTable(bowlersInTable, activeInnings) {
  const currentId = activeInnings?.bowler?.id;
  if (currentId == null) return 0;
  const idx = bowlersInTable.findIndex((b) => b?.id != null && String(b.id) === String(currentId));
  return idx >= 0 ? idx : Math.max(0, bowlersInTable.length - 1);
}

/**
 * Squads + name map for one innings (batting/bowling team IDs from scorecard).
 */
export function buildInningsSquads({
  battingTeamId,
  bowlingTeamId,
  homeTeamId,
  squadHome = [],
  squadAway = [],
  playingElevenHome,
  playingElevenAway,
}) {
  const homeSquadArr = Array.isArray(squadHome) ? squadHome : [];
  const awaySquadArr = Array.isArray(squadAway) ? squadAway : [];
  const batSquadArr = battingTeamId === homeTeamId ? homeSquadArr : awaySquadArr;
  const bowlSquadArr = bowlingTeamId === homeTeamId ? homeSquadArr : awaySquadArr;
  const batIds = battingTeamId === homeTeamId ? (playingElevenHome?.player_ids ?? []) : (playingElevenAway?.player_ids ?? []);
  const bowlIds = bowlingTeamId === homeTeamId ? (playingElevenHome?.player_ids ?? []) : (playingElevenAway?.player_ids ?? []);
  const battingSquad = buildRoleSquad(batSquadArr, batIds);
  const bowlingSquad = buildRoleSquad(bowlSquadArr, bowlIds);
  const nameMap = {
    ...buildPlayerIdToName(batSquadArr, batIds),
    ...buildPlayerIdToName(bowlSquadArr, bowlIds),
  };
  return { battingSquad, bowlingSquad, nameMap };
}

/** Default innings-1 batting/bowling team IDs from toss when scorecard is empty. */
export function getDefaultInnings1TeamIds(apiMatch, scorecard) {
  if (!apiMatch) return { battingTeamId: null, bowlingTeamId: null };
  const homeId = apiMatch.home_team_id;
  const awayId = apiMatch.away_team_id;
  const tossWinnerId = getTossWinnerTeamId(apiMatch, scorecard);
  const choseBat = apiMatch.chose_to_bat_or_bowl === 'bat';
  const tw = tossWinnerId != null ? Number(tossWinnerId) : null;
  const hid = homeId != null ? Number(homeId) : null;
  const aid = awayId != null ? Number(awayId) : null;
  const battingTeamId = tw != null && choseBat ? tw : tw === hid ? aid : hid;
  const bowlingTeamId = battingTeamId === hid ? aid : hid;
  return { battingTeamId, bowlingTeamId };
}
