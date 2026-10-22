/** UI ball → POST balls body. Rules stay on the server. */

import { dismissalRequiresFielder, type EnumsMap } from '@/shared/model/enums';

export type UiBallType = 'runs' | 'wd' | 'nb' | 'bye' | 'lb' | 'out' | 'overthrow' | 'penalty' | 'retired_hurt';

export type UiBall = {
  type: UiBallType;
  runs?: number | undefined;
  strikerId?: number | undefined;
  bowlerId?: number | undefined;
  nonStrikerId?: number | undefined;
  extraRuns?: number | undefined;
  runsOffBat?: number | undefined;
  dismissalType?: string | null | undefined;
  isWide?: boolean | undefined;
  isNoBall?: boolean | undefined;
  fielderId?: number | null | undefined;
  outPlayerId?: number | null | undefined;
  penaltyRuns?: number | undefined;
  penaltyTeam?: string | undefined;
  penaltyReason?: string | null | undefined;
  shotDirection?: string | null | undefined;
  noBallType?: string | null | undefined;
  noBallRunsType?: string | null | undefined;
  byeOnNoBall?: boolean | undefined;
  legByeOnNoBall?: boolean | undefined;
  overthrowDeliveryType?: string | null | undefined;
  overthrowRuns?: number | undefined;
  runoutExtraRuns?: number | undefined;
  runoutRunType?: string | null | undefined;
  batterCrossed?: boolean | null | undefined;
  dontCountBall?: boolean | null | undefined;
  dismissalDeliveryType?: string | null | undefined;
};

export type StoreBallPayload = {
  striker_id: number;
  non_striker_id: number;
  bowler_id: number;
  runs_off_bat: number;
  extra_runs: number;
  is_no_ball: boolean;
  no_ball_type: string | null;
  no_ball_runs_type: string | null;
  overthrow_delivery_type: string | null;
  is_wide: boolean;
  is_leg_bye: boolean;
  is_bye: boolean;
  penalty_runs: number;
  penalty_team?: string | undefined;
  penalty_reason?: string | null | undefined;
  is_wicket: boolean;
  dismissal_type: string | null;
  out_player_id: number | null;
  fielder_id: number | null;
  runout_extra_runs: number | null;
  runout_run_type: string | null;
  batter_crossed: boolean | null;
  dont_count_ball: boolean | null;
  dismissal_delivery_type: string | null;
  shot_position: string | null;
};

function dismissalValue(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (raw.includes('_')) return raw;
  return raw.toLowerCase().replace(/\s+/g, '_');
}

export function uiBallToStoreBallPayload({
  ball,
  nonStrikerId,
  fielderId,
}: {
  ball: UiBall;
  nonStrikerId: number;
  fielderId?: number | null | undefined;
}): StoreBallPayload {
  const type = ball.type;
  const isWide = type === 'wd';
  const isNoBall = type === 'nb';
  const isBye = type === 'bye';
  const isLegBye = type === 'lb';
  const isOverthrow = type === 'overthrow';
  const isPenalty = type === 'penalty';
  const isWicket = type === 'out';
  const isRetiredHurt = type === 'retired_hurt';

  if (isPenalty) {
    return {
      striker_id: Number(ball.strikerId),
      non_striker_id: Number(nonStrikerId),
      bowler_id: Number(ball.bowlerId),
      runs_off_bat: 0,
      extra_runs: 0,
      is_no_ball: false,
      no_ball_type: null,
      no_ball_runs_type: null,
      overthrow_delivery_type: null,
      is_wide: false,
      is_leg_bye: false,
      is_bye: false,
      penalty_runs: Number(ball.penaltyRuns ?? 0),
      penalty_team: ball.penaltyTeam ?? 'batting',
      penalty_reason: ball.penaltyReason ?? null,
      is_wicket: false,
      dismissal_type: null,
      out_player_id: null,
      fielder_id: null,
      runout_extra_runs: null,
      runout_run_type: null,
      batter_crossed: null,
      dont_count_ball: null,
      dismissal_delivery_type: null,
      shot_position: null,
    };
  }

  let runsOffBat = 0;
  let extraRuns = 0;

  if (type === 'runs') {
    runsOffBat = ball.runs ?? 0;
  } else if (isNoBall) {
    if (ball.byeOnNoBall || ball.noBallRunsType === 'bye') {
      extraRuns = ball.extraRuns != null ? Number(ball.extraRuns) : Math.max(0, (ball.runs ?? 1) - 1);
    } else if (ball.legByeOnNoBall || ball.noBallRunsType === 'leg_bye') {
      extraRuns = ball.extraRuns != null ? Number(ball.extraRuns) : Math.max(0, (ball.runs ?? 1) - 1);
    } else {
      runsOffBat = ball.runsOffBat != null ? Number(ball.runsOffBat) : Math.max(0, (ball.runs ?? 1) - 1);
    }
  } else if (isWide) {
    extraRuns = ball.extraRuns != null ? Number(ball.extraRuns) : Math.max(0, (ball.runs ?? 1) - 1);
  } else if (isBye || isLegBye) {
    extraRuns = ball.runs ?? 0;
  } else if (isOverthrow) {
    extraRuns = ball.overthrowRuns != null ? Number(ball.overthrowRuns) : 0;
  }

  const rawDismissal = isWicket || isRetiredHurt ? (ball.dismissalType ?? null) : null;
  const dismissal = dismissalValue(rawDismissal);
  const isRunOut = dismissal === 'run_out';
  const isObstruct = dismissal === 'obstructing_the_field';
  const isRetiredHurtDismissal = dismissal === 'retired_hurt';
  const isRetiredOut = dismissal === 'retired';
  const isMankad = dismissal === 'mankad';
  const isTimedOut = dismissal === 'timed_out';
  const usesExplicitOutPlayer =
    isRunOut || isObstruct || isRetiredHurtDismissal || isRetiredOut || isMankad || isTimedOut;
  const usesDismissalDeliveryMeta = isObstruct || isRetiredHurtDismissal || isRetiredOut;
  const combinedWideWicket = isWicket && Boolean(ball.isWide);
  const combinedNoBallWicket = isWicket && Boolean(ball.isNoBall);

  const rawOutPlayerId =
    isWicket || isRetiredHurt ? (ball.outPlayerId ?? (usesExplicitOutPlayer ? ball.strikerId : ball.strikerId)) : null;

  if ((isWicket || isRetiredHurt) && (rawOutPlayerId == null || Number.isNaN(Number(rawOutPlayerId)))) {
    throw new Error('Cannot determine dismissed batter — select who is out before submitting.');
  }

  const outPlayerId = rawOutPlayerId != null ? Number(rawOutPlayerId) : null;

  let resolvedFielderId =
    (isWicket || isRetiredHurt) && (fielderId ?? ball.fielderId) != null ? Number(fielderId ?? ball.fielderId) : null;
  if (isMankad) {
    resolvedFielderId = Number(ball.fielderId ?? ball.bowlerId);
  }

  const resolvedNonStrikerId = ball.nonStrikerId != null ? Number(ball.nonStrikerId) : Number(nonStrikerId);

  return {
    striker_id: Number(ball.strikerId),
    non_striker_id: resolvedNonStrikerId,
    bowler_id: Number(ball.bowlerId),
    runs_off_bat: runsOffBat,
    extra_runs: extraRuns,
    is_no_ball: isNoBall || combinedNoBallWicket,
    no_ball_type: isNoBall || combinedNoBallWicket ? (ball.noBallType ?? null) : null,
    no_ball_runs_type: isNoBall || combinedNoBallWicket ? (ball.noBallRunsType ?? null) : null,
    overthrow_delivery_type: isOverthrow ? (ball.overthrowDeliveryType ?? null) : null,
    is_wide: isWide || combinedWideWicket,
    is_leg_bye: isLegBye,
    is_bye: isBye,
    penalty_runs: Number(ball.penaltyRuns ?? 0),
    is_wicket: isWicket || isRetiredHurt,
    dismissal_type: dismissal,
    out_player_id: outPlayerId,
    fielder_id: resolvedFielderId,
    runout_extra_runs: isRunOut ? Number(ball.runoutExtraRuns ?? 0) : null,
    runout_run_type: isRunOut ? (ball.runoutRunType ?? 'from_bat') : null,
    batter_crossed: isRunOut && ball.batterCrossed != null ? Boolean(ball.batterCrossed) : null,
    dont_count_ball:
      (usesDismissalDeliveryMeta || isTimedOut) && ball.dontCountBall != null ? Boolean(ball.dontCountBall) : null,
    dismissal_delivery_type: usesDismissalDeliveryMeta ? (ball.dismissalDeliveryType ?? null) : null,
    shot_position: ball.shotDirection ?? null,
  };
}

/** Fallback when enums cache is empty — DismissalTypeEnum::requiresFielder. */

export const FIELDER_DISMISSALS = new Set(['caught', 'stumped', 'run_out', 'mankad']);

export function dismissalNeedsFielder(type: string, enums?: EnumsMap | undefined): boolean {
  return dismissalRequiresFielder(type, enums, FIELDER_DISMISSALS);
}
