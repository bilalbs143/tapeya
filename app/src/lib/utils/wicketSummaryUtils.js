/**
 * Wicket Summary screen field visibility (§7.2 / §20).
 */

/** @typedef {'bowler'|'fielder'|'creaseTime'|'fours'|'sixes'|'strikeRate'} WicketSummaryField */

/**
 * @param {string|null|undefined} dismissalType API dismissal_type value
 * @returns {WicketSummaryField[]}
 */
export function wicketSummaryVisibleFields(dismissalType) {
  const base = ['creaseTime', 'fours', 'sixes', 'strikeRate'];
  if (!dismissalType) return ['bowler', ...base];

  switch (dismissalType) {
    case 'caught':
    case 'stumped':
    case 'run_out':
    case 'mankad':
      return ['bowler', 'fielder', ...base];
    case 'bowled':
    case 'lbw':
    case 'hit_wicket':
    case 'hit_ball_twice':
    case 'obstructing_the_field':
      return ['bowler', ...base];
    case 'timed_out':
    case 'retired':
    case 'retired_hurt':
      return base;
    default:
      return ['bowler', ...base];
  }
}

/**
 * Mankaded: fielder row shows the bowler (same player as bowler row).
 *
 * @param {string|null|undefined} dismissalType
 */
export function wicketSummaryFielderIsBowler(dismissalType) {
  return dismissalType === 'mankad';
}

/**
 * Caught sub-types from fielder context (no separate API dismissal_type).
 *
 * @param {{ fielderId?: number|null, bowlerId?: number|null, wicketKeeperId?: number|null }} [context]
 */
export function resolveCaughtChipLabel(context = {}) {
  const fielderId = context.fielderId != null ? Number(context.fielderId) : null;
  if (fielderId == null) return 'CAUGHT';
  const bowlerId = context.bowlerId != null ? Number(context.bowlerId) : null;
  if (bowlerId != null && fielderId === bowlerId) return 'CAUGHT BOWLED';
  const wicketKeeperId = context.wicketKeeperId != null ? Number(context.wicketKeeperId) : null;
  if (wicketKeeperId != null && fielderId === wicketKeeperId) return 'CAUGHT BEHIND';
  return 'CAUGHT';
}

/**
 * Uppercase chip label for the summary header.
 *
 * @param {string|null|undefined} dismissalType
 * @param {string} [fallbackLabel] From API dismissal_type_label
 * @param {{ fielderId?: number|null, bowlerId?: number|null, wicketKeeperId?: number|null }} [context]
 */
export function wicketSummaryChipLabel(dismissalType, fallbackLabel = '', context = {}) {
  if (dismissalType === 'caught') {
    return resolveCaughtChipLabel(context);
  }

  const labels = {
    bowled: 'BOWLED',
    caught: 'CAUGHT',
    stumped: 'STUMPED',
    lbw: 'LEG BEFORE WICKET',
    run_out: 'RUN OUT',
    mankad: 'MANKADED',
    retired: 'RETIRED OUT',
    retired_hurt: 'RETIRED HURT',
    hit_wicket: 'HIT WICKET',
    hit_ball_twice: 'HIT THE BALL TWICE',
    timed_out: 'TIMED OUT',
    obstructing_the_field: 'OBSTRUCTING THE FIELD',
  };
  if (dismissalType && labels[dismissalType]) return labels[dismissalType];
  return (fallbackLabel || dismissalType || 'WICKET').toUpperCase();
}

/**
 * @param {object|null|undefined} apiBall
 */
export function isCountableWicketBall(apiBall) {
  if (!apiBall?.is_wicket) return false;
  return apiBall.dismissal_type !== 'retired_hurt';
}

/**
 * @param {Record<string, string>} nameById
 * @param {number|null|undefined} id
 */
function playerName(nameById, id) {
  if (id == null) return '—';
  return nameById[String(id)] ?? `Player ${id}`;
}

/**
 * @param {number|null|undefined} seconds
 */
export function formatCreaseTime(seconds) {
  if (seconds == null || Number.isNaN(Number(seconds))) return '—';
  const s = Math.max(0, Math.floor(Number(seconds)));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

/**
 * Final batting line for the dismissed player — prefer storeBall API payload.
 *
 * @param {object|null|undefined} apiBall
 * @param {object|null|undefined} [fallbackStats]
 */
export function resolveOutBatterStats(apiBall, fallbackStats = null) {
  const api = apiBall?.out_player_stats;
  if (api) {
    return {
      runs: api.runs ?? 0,
      balls: api.balls ?? 0,
      fours: api.fours ?? 0,
      sixes: api.sixes ?? 0,
      strikeRate: api.strike_rate ?? '0.0',
      creaseTimeSeconds: apiBall?.out_player_crease_time_seconds ?? null,
    };
  }
  if (fallbackStats) {
    return {
      runs: fallbackStats.runs ?? 0,
      balls: fallbackStats.balls ?? 0,
      fours: fallbackStats.fours ?? 0,
      sixes: fallbackStats.sixes ?? 0,
      strikeRate: fallbackStats.strikeRate ?? '0.0',
      creaseTimeSeconds: fallbackStats.creaseTimeSeconds ?? apiBall?.out_player_crease_time_seconds ?? null,
    };
  }
  if (apiBall?.out_player_crease_time_seconds != null) {
    return {
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      strikeRate: '0.0',
      creaseTimeSeconds: apiBall.out_player_crease_time_seconds,
    };
  }
  return null;
}

/**
 * @param {object} params.matchState Authoritative match_state from storeBall response
 * @param {object[]} params.battingSquad
 * @param {object[]} params.bowlingSquad
 * @param {string} [params.battingTeamName]
 * @param {string} [params.bowlingTeamName]
 * @param {string} [params.inningsNumber]
 * @param {number} [params.playersPerSide]
 * @param {object|null} [params.batterStats] { runs, balls, fours, sixes, strikeRate }
 * @param {number|null} [params.wicketKeeperId] Bowling team wicket keeper (Caught Behind label)
 */
export function buildWicketSummaryModel({
  apiBall,
  matchState,
  battingSquad = [],
  bowlingSquad = [],
  battingTeamName = '',
  bowlingTeamName: _bowlingTeamName = '',
  inningsNumber = '1',
  playersPerSide = 11,
  batterStats = null,
  wicketKeeperId = null,
}) {
  const ai = matchState?.active_innings ?? {};
  const dismissalType = apiBall?.dismissal_type ?? null;
  const dismissalLabel = apiBall?.dismissal_type_label ?? '';
  const outId = apiBall?.out_player_id;
  const bowlerId = apiBall?.bowler_id;
  const fielderId = apiBall?.fielder_id;

  const nameById = {};
  for (const p of [...battingSquad, ...bowlingSquad]) {
    if (p?.id != null) nameById[String(p.id)] = p.name ?? '';
  }

  const visible = new Set(wicketSummaryVisibleFields(dismissalType));
  const fielderIsBowler = wicketSummaryFielderIsBowler(dismissalType);
  const showFielder = visible.has('fielder') && (fielderId != null || fielderIsBowler);

  const maxWickets = Math.max(1, Number(playersPerSide) - 1);
  const wicketsRemaining = Math.max(0, maxWickets - (ai.total_wickets ?? 0));

  let chaseLine = null;
  if (inningsNumber === '2' && ai.runs_to_win != null) {
    const runs = ai.runs_to_win ?? 0;
    const balls = ai.balls_remaining ?? 0;
    chaseLine = `${battingTeamName || 'Batting side'} requires ${runs} runs with ${wicketsRemaining} wickets and ${balls} balls`;
  }

  const creaseTimeSeconds = batterStats?.creaseTimeSeconds ?? apiBall?.out_player_crease_time_seconds ?? null;

  const resolvedBatterStats = batterStats ?? resolveOutBatterStats(apiBall);
  const runs = resolvedBatterStats?.runs ?? 0;
  const balls = resolvedBatterStats?.balls ?? 0;
  const sr = resolvedBatterStats?.strikeRate ?? (!balls ? '0.0' : ((Number(runs) / Number(balls)) * 100).toFixed(1));

  return {
    dismissalType,
    chipLabel: wicketSummaryChipLabel(dismissalType, dismissalLabel, {
      fielderId,
      bowlerId,
      wicketKeeperId,
    }),
    scoreDisplay: `${ai.total_runs ?? 0}/${ai.total_wickets ?? 0}`,
    oversDisplay: ai.overs_display ?? '0.0',
    chaseLine,
    batter: {
      name: apiBall?.out_player_name ?? playerName(nameById, outId),
      runs,
      balls,
      fours: resolvedBatterStats?.fours ?? 0,
      sixes: resolvedBatterStats?.sixes ?? 0,
      strikeRate: sr,
      creaseTime: formatCreaseTime(resolvedBatterStats?.creaseTimeSeconds ?? creaseTimeSeconds),
    },
    bowlerName: visible.has('bowler') ? playerName(nameById, bowlerId) : null,
    fielderName: showFielder ? (fielderIsBowler ? playerName(nameById, bowlerId) : playerName(nameById, fielderId)) : null,
    showBowler: visible.has('bowler'),
    showFielder,
    showCreaseTime: visible.has('creaseTime'),
    showFours: visible.has('fours'),
    showSixes: visible.has('sixes'),
    showStrikeRate: visible.has('strikeRate'),
    needsNewBatter: Boolean(matchState?.needs_new_batter),
    ballId: apiBall?.id ?? null,
  };
}
