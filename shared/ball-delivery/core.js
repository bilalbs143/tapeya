/**
 * Canonical ball delivery presentation — shared by organizer scoring, broadcast
 * graphics, and backoffice. PHP mirror: BallDeliveryPresenter.
 *
 * @typedef {object} NormalizedBall
 * @property {number} runs
 * @property {number} runs_off_bat
 * @property {boolean} is_wicket
 * @property {boolean} is_wide
 * @property {boolean} is_no_ball
 * @property {boolean} is_bye
 * @property {boolean} is_leg_bye
 * @property {boolean} is_free_hit
 * @property {number} penalty_runs
 * @property {number} additional_runs
 * @property {string|null} dismissal_type
 * @property {boolean} dont_count_ball
 * @property {number|null} [over_number]
 * @property {number|null} [ball_in_over]
 *
 * @typedef {object} BallPresentation
 * @property {string} display_token
 * @property {string} label
 * @property {string} chip_type
 * @property {string} variant
 * @property {boolean} is_free_hit
 * @property {boolean} show_free_hit_badge
 * @property {number} runs_total
 * @property {boolean} is_legal
 * @property {number|null} over_number
 * @property {number|null} ball_in_over
 */

const EMPTY_BALL = {
  runs: 0,
  runs_off_bat: 0,
  is_wicket: false,
  is_wide: false,
  is_no_ball: false,
  is_bye: false,
  is_leg_bye: false,
  is_free_hit: false,
  penalty_runs: 0,
  additional_runs: 0,
  dismissal_type: null,
  dont_count_ball: false,
  over_number: null,
  ball_in_over: null,
};

/** @param {'wd'|'nb'|'bye'|'lb'} type @param {number} runs */
export function extraBallLabel(type, runs) {
  const r = runs ?? 0;
  switch (type) {
    case 'wd': {
      const extra = Math.max(1, r) - 1;
      return extra > 0 ? `${extra}WD` : 'WD';
    }
    case 'nb': {
      const extra = Math.max(1, r) - 1;
      return extra > 0 ? `${extra}NB` : 'NB';
    }
    case 'bye':
      return r > 0 ? `${r}B` : 'B';
    case 'lb':
      return r > 0 ? `${r}LB` : 'LB';
    default:
      return String(type).toUpperCase();
  }
}

/** @param {NormalizedBall} ball */
export function isPenaltyOnlyAward(ball) {
  const pr = Number(ball.penalty_runs ?? 0);
  if (pr === 0 || ball.is_wicket) return false;
  if (ball.is_wide || ball.is_no_ball || ball.is_bye || ball.is_leg_bye) return false;
  if (Number(ball.additional_runs ?? 0) > 0) return false;
  return Number(ball.runs ?? 0) === 0;
}

/** @param {NormalizedBall} ball */
export function isAdditionalRunsOnlyAward(ball) {
  const additional = Number(ball.additional_runs ?? 0);
  if (additional <= 0 || ball.is_wicket) return false;
  if (ball.is_wide || ball.is_no_ball || ball.is_bye || ball.is_leg_bye) return false;
  if (Number(ball.penalty_runs ?? 0) > 0) return false;
  return Number(ball.runs ?? 0) === 0;
}

/** @param {NormalizedBall} ball */
export function isLegalDelivery(ball) {
  if (isPenaltyOnlyAward(ball) || isAdditionalRunsOnlyAward(ball)) return false;
  if (ball.dont_count_ball) return false;
  return !ball.is_wide && !ball.is_no_ball;
}

/** @param {string} chipType */
export function chipTypeToVariant(chipType) {
  switch (chipType) {
    case 'dot':
      return 'dot';
    case 'boundary_four':
      return 'four';
    case 'boundary_six':
      return 'six';
    case 'wicket':
      return 'wicket';
    case 'retired':
      return 'retired';
    case 'wide':
    case 'no_ball':
    case 'other_extra':
    case 'penalty':
      return 'extra';
    default:
      return 'runs';
  }
}

/** Graphics overlay data-variant slug. */
export function chipTypeToOverlayVariant(chipType) {
  switch (chipType) {
    case 'wicket':
      return 'w';
    case 'boundary_four':
      return '4';
    case 'boundary_six':
      return '6';
    case 'dot':
      return 'dot';
    default:
      return 'run';
  }
}

/** @param {NormalizedBall} ball @param {string} displayToken */
function resolveChipType(ball, displayToken) {
  if (displayToken === 'W' || displayToken === 'M' || displayToken.endsWith('+W')) return 'wicket';
  if (displayToken === 'RH' || displayToken === 'RO' || displayToken === 'TO') return 'retired';
  if (ball.is_wide) return 'wide';
  if (ball.is_no_ball) return 'no_ball';
  if (isPenaltyOnlyAward(ball)) return 'penalty';
  if (ball.is_bye || ball.is_leg_bye || isAdditionalRunsOnlyAward(ball)) return 'other_extra';

  const rob = Number(ball.runs_off_bat ?? ball.runs ?? 0);
  if (rob === 0) return 'dot';
  if (rob === 4) return 'boundary_four';
  if (rob === 6) return 'boundary_six';
  return 'single';
}

/** @param {NormalizedBall} ball */
export function buildDisplayToken(ball) {
  const runs = Number(ball.runs ?? 0);
  const dismissal = ball.dismissal_type ?? null;

  if (ball.is_wicket) {
    if (dismissal === 'retired_hurt') return 'RH';
    if (dismissal === 'retired') return 'RO';
    if (dismissal === 'mankad') return 'M';
    if (dismissal === 'timed_out') return 'TO';
    if (ball.is_wide) {
      return `${extraBallLabel('wd', runs)}+W`;
    }
    if (ball.is_no_ball) {
      return `${extraBallLabel('nb', runs)}+W`;
    }
    return 'W';
  }

  if (isPenaltyOnlyAward(ball)) {
    return `P${Number(ball.penalty_runs ?? 0)}`;
  }

  if (isAdditionalRunsOnlyAward(ball)) {
    return `+${Number(ball.additional_runs ?? 0)}`;
  }

  if (ball.is_wide) return extraBallLabel('wd', runs);
  if (ball.is_no_ball) return extraBallLabel('nb', runs);
  if (ball.is_bye) return extraBallLabel('bye', runs);
  if (ball.is_leg_bye) return extraBallLabel('lb', runs);

  const rob = Number(ball.runs_off_bat ?? runs);
  if (rob === 4) return '4';
  if (rob === 6) return '6';
  if (rob > 0) return String(rob);
  return '0';
}

/**
 * @param {Record<string, unknown>|null|undefined} raw
 * @returns {NormalizedBall}
 */
export function normalizeBall(raw) {
  if (!raw) return { ...EMPTY_BALL };

  if (raw.type != null) {
    return normalizeUiBall(raw);
  }

  return {
    runs: Number(raw.runs ?? 0),
    runs_off_bat: Number(raw.runs_off_bat ?? raw.runsOffBat ?? raw.runs ?? 0),
    is_wicket: Boolean(raw.is_wicket ?? raw.isWicket),
    is_wide: Boolean(raw.is_wide ?? raw.isWide),
    is_no_ball: Boolean(raw.is_no_ball ?? raw.isNoBall),
    is_bye: Boolean(raw.is_bye ?? raw.isBye),
    is_leg_bye: Boolean(raw.is_leg_bye ?? raw.isLegBye),
    is_free_hit: Boolean(raw.is_free_hit ?? raw.isFreeHit),
    penalty_runs: Number(raw.penalty_runs ?? raw.penaltyRuns ?? 0),
    additional_runs: Number(raw.additional_runs ?? raw.additionalRuns ?? 0),
    dismissal_type: raw.dismissal_type ?? raw.dismissalType ?? null,
    dont_count_ball: Boolean(raw.dont_count_ball ?? raw.dontCountBall),
    over_number: raw.over_number ?? raw.over ?? raw.overNumber ?? null,
    ball_in_over: raw.ball_in_over ?? raw.ballInOver ?? null,
  };
}

/** @param {Record<string, unknown>} ui */
function normalizeUiBall(ui) {
  const type = String(ui.type ?? 'runs');
  const runs = Number(ui.runs ?? 0);
  const base = {
    runs,
    runs_off_bat: Number(ui.runsOffBat ?? ui.runs ?? 0),
    is_wicket: false,
    is_wide: false,
    is_no_ball: false,
    is_bye: false,
    is_leg_bye: false,
    is_free_hit: Boolean(ui.isFreeHit),
    penalty_runs: Number(ui.penaltyRuns ?? 0),
    additional_runs: Number(ui.additionalRuns ?? 0),
    dismissal_type: ui.dismissalType ?? null,
    dont_count_ball: Boolean(ui.dontCountBall),
    over_number: ui.over ?? ui.overNumber ?? null,
    ball_in_over: ui.ballInOver ?? null,
  };

  switch (type) {
    case 'out':
      return {
        ...base,
        is_wicket: true,
        is_wide: Boolean(ui.isWide),
        is_no_ball: Boolean(ui.isNoBall),
        runs: ui.isWide || ui.isNoBall ? Math.max(1, runs) : runs,
      };
    case 'retired_hurt':
      return { ...base, is_wicket: true, dismissal_type: 'retired_hurt' };
    case 'wd':
      return { ...base, is_wide: true, runs: Math.max(1, runs) };
    case 'nb':
      return { ...base, is_no_ball: true, runs: Math.max(1, runs) };
    case 'bye':
      return { ...base, is_bye: true };
    case 'lb':
      return { ...base, is_leg_bye: true };
    case 'penalty':
      return { ...base, penalty_runs: Number(ui.penaltyRuns ?? 0), runs: 0, runs_off_bat: 0 };
    case 'additional_runs':
      return { ...base, additional_runs: Number(ui.additionalRuns ?? 0), runs: 0, runs_off_bat: 0 };
    default:
      return base;
  }
}

/**
 * @param {Record<string, unknown>|null|undefined} raw
 * @param {{ dotStyle?: 'zero'|'bullet' }} [options]
 * @returns {BallPresentation}
 */
export function presentBall(raw, options = {}) {
  const ball = normalizeBall(raw);
  const displayToken = buildDisplayToken(ball);
  const chipType = resolveChipType(ball, displayToken);
  const variant = chipTypeToVariant(chipType);
  const dotStyle = options.dotStyle ?? 'zero';
  const label = displayToken === '0' && dotStyle === 'bullet' ? '•' : displayToken;
  const isFreeHit = Boolean(ball.is_free_hit);

  return {
    display_token: displayToken,
    label,
    chip_type: chipType,
    variant,
    is_free_hit: isFreeHit,
    show_free_hit_badge: isFreeHit,
    runs_total:
      Number(ball.runs ?? 0) + Number(ball.penalty_runs ?? 0) + Number(ball.additional_runs ?? 0),
    is_legal: isLegalDelivery(ball),
    over_number: ball.over_number != null ? Number(ball.over_number) : null,
    ball_in_over: ball.ball_in_over != null ? Number(ball.ball_in_over) : null,
  };
}

/** Organizer / legacy getBallDisplay shape. */
export function getBallDisplay(raw, options = {}) {
  const p = presentBall(raw, options);
  return { label: p.label, variant: p.variant, chipType: p.chip_type, ...p };
}

/** @param {BallPresentation|string} input */
export function overlayVariantFor(input) {
  if (typeof input === 'string') {
    if (input === 'W' || input === 'M' || input.endsWith('+W')) return 'w';
    if (input === '4') return '4';
    if (input === '6') return '6';
    if (input === '0' || input === '•') return 'dot';
    return 'run';
  }
  return chipTypeToOverlayVariant(input.chip_type);
}
