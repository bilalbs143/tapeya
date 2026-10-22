import type { ScoringSession } from '../model/scoringSession';
import type { StoredBallWire } from '../model/storeBallSchemas';

export type WicketSummaryField = 'bowler' | 'fielder' | 'creaseTime' | 'fours' | 'sixes' | 'strikeRate';

export function wicketSummaryVisibleFields(dismissalType: string | null | undefined): WicketSummaryField[] {
  const base: WicketSummaryField[] = ['creaseTime', 'fours', 'sixes', 'strikeRate'];
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

export function wicketSummaryFielderIsBowler(dismissalType: string | null | undefined): boolean {
  return dismissalType === 'mankad';
}

export function resolveCaughtChipLabel(
  context: {
    fielderId?: number | null | undefined;
    bowlerId?: number | null | undefined;
    wicketKeeperId?: number | null | undefined;
  } = {}
): string {
  const fielderId = context.fielderId != null ? Number(context.fielderId) : null;
  if (fielderId == null) return 'CAUGHT';
  const bowlerId = context.bowlerId != null ? Number(context.bowlerId) : null;
  if (bowlerId != null && fielderId === bowlerId) return 'CAUGHT BOWLED';
  const wicketKeeperId = context.wicketKeeperId != null ? Number(context.wicketKeeperId) : null;
  if (wicketKeeperId != null && fielderId === wicketKeeperId) return 'CAUGHT BEHIND';
  return 'CAUGHT';
}

export function wicketSummaryChipLabel(
  dismissalType: string | null | undefined,
  fallbackLabel = '',
  context: {
    fielderId?: number | null | undefined;
    bowlerId?: number | null | undefined;
    wicketKeeperId?: number | null | undefined;
  } = {}
): string {
  if (dismissalType === 'caught') return resolveCaughtChipLabel(context);

  const labels: Record<string, string> = {
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

export function isCountableWicketBall(apiBall: StoredBallWire | null | undefined): boolean {
  if (!apiBall?.is_wicket) return false;
  return apiBall.dismissal_type !== 'retired_hurt';
}

export function formatCreaseTime(seconds: number | null | undefined): string {
  if (seconds == null || Number.isNaN(Number(seconds))) return '—';
  const s = Math.max(0, Math.floor(Number(seconds)));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

function playerName(nameById: Record<string, string>, id: number | null | undefined): string {
  if (id == null) return '—';
  return nameById[String(id)] ?? `Player ${id}`;
}

export type BatterStats = {
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: string;
  creaseTimeSeconds: number | null;
};

export function resolveOutBatterStats(
  apiBall: StoredBallWire | null | undefined,
  fallbackStats: BatterStats | null = null
): BatterStats | null {
  const api = apiBall?.out_player_stats;
  if (api) {
    return {
      runs: api.runs ?? 0,
      balls: api.balls ?? 0,
      fours: api.fours ?? 0,
      sixes: api.sixes ?? 0,
      strikeRate: String(api.strike_rate ?? '0.0'),
      creaseTimeSeconds: apiBall?.out_player_crease_time_seconds ?? null,
    };
  }
  if (fallbackStats) return fallbackStats;
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

export type WicketSummaryModel = {
  chipLabel: string;
  scoreDisplay: string;
  oversDisplay: string;
  battingShort: string;
  chaseLine: string | null;
  batter: {
    name: string;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    strikeRate: string;
    creaseTime: string;
  };
  bowlerName: string | null;
  fielderName: string | null;
  showBowler: boolean;
  showFielder: boolean;
  showCreaseTime: boolean;
  showFours: boolean;
  showSixes: boolean;
  showStrikeRate: boolean;
  howLine: string;
  partnership: { runs: number; balls: number } | null;
  currentRunRate: string | null;
  oversPerSide: number | null;
};

/** Hero score with hyphen wickets separator (e.g. `42-3`). */
export function wicketSummaryScoreHero(scoreDisplay: string): string {
  return scoreDisplay.replace('/', '-');
}

/** Overs · CRR line under the hero score. */
export function wicketSummaryOversLine(
  model: Pick<WicketSummaryModel, 'oversDisplay' | 'oversPerSide' | 'currentRunRate'>
): string {
  return [
    model.oversPerSide != null ? `${model.oversDisplay} / ${model.oversPerSide} overs` : `${model.oversDisplay} overs`,
    model.currentRunRate != null ? `CRR ${model.currentRunRate}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

export function wicketSummaryPartnershipValue(partnership: WicketSummaryModel['partnership']): string {
  return `${partnership?.runs ?? 0}(${partnership?.balls ?? 0})`;
}

export function wicketSummaryBoundariesValue(fours: number, sixes: number): string {
  return `${fours} / ${sixes}`;
}

export function buildWicketSummaryModel({
  apiBall,
  matchState,
  nameById,
  battingShort,
  oversPerSide = null,
  playersPerSide = 11,
  wicketKeeperId = null,
}: {
  apiBall: StoredBallWire;
  matchState: ScoringSession;
  nameById: Record<string, string>;
  battingShort: string;
  oversPerSide?: number | null | undefined;
  playersPerSide?: number | null | undefined;
  wicketKeeperId?: number | null | undefined;
}): WicketSummaryModel {
  const dismissalType = apiBall.dismissal_type ?? null;
  const visible = new Set(wicketSummaryVisibleFields(dismissalType));
  const fielderIsBowler = wicketSummaryFielderIsBowler(dismissalType);
  const showFielder = visible.has('fielder') && (apiBall.fielder_id != null || fielderIsBowler);

  const stats = resolveOutBatterStats(apiBall) ?? {
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    strikeRate: '0.0',
    creaseTimeSeconds: null,
  };

  let chaseLine: string | null = null;
  if (matchState.inningsNumber >= 2 && matchState.runsToWin != null) {
    const maxWickets = Math.max(1, (playersPerSide ?? 11) - 1);
    const wicketsRemaining = Math.max(0, maxWickets - matchState.wickets);
    chaseLine = `${battingShort} need ${matchState.runsToWin} with ${wicketsRemaining} wickets and ${matchState.ballsRemaining ?? '—'} balls`;
  }

  const bowlerName = visible.has('bowler') ? playerName(nameById, apiBall.bowler_id) : null;
  const fielderName = showFielder
    ? fielderIsBowler
      ? playerName(nameById, apiBall.bowler_id)
      : playerName(nameById, apiBall.fielder_id)
    : null;

  const howLine =
    [bowlerName ? `b ${bowlerName}` : null, fielderName ? `c ${fielderName}` : null].filter(Boolean).join(' · ') ||
    apiBall.dismissal_type_label ||
    wicketSummaryChipLabel(dismissalType, apiBall.dismissal_type_label ?? '', {
      fielderId: apiBall.fielder_id,
      bowlerId: apiBall.bowler_id,
      wicketKeeperId,
    });

  return {
    chipLabel: wicketSummaryChipLabel(dismissalType, apiBall.dismissal_type_label ?? '', {
      fielderId: apiBall.fielder_id,
      bowlerId: apiBall.bowler_id,
      wicketKeeperId,
    }),
    scoreDisplay: `${matchState.runs}/${matchState.wickets}`,
    oversDisplay: matchState.oversDisplay ?? '0.0',
    battingShort,
    chaseLine,
    batter: {
      name: apiBall.out_player_name ?? playerName(nameById, apiBall.out_player_id),
      runs: stats.runs,
      balls: stats.balls,
      fours: stats.fours,
      sixes: stats.sixes,
      strikeRate: stats.strikeRate,
      creaseTime: formatCreaseTime(stats.creaseTimeSeconds),
    },
    bowlerName,
    fielderName,
    showBowler: visible.has('bowler'),
    showFielder,
    showCreaseTime: visible.has('creaseTime'),
    showFours: visible.has('fours'),
    showSixes: visible.has('sixes'),
    showStrikeRate: visible.has('strikeRate'),
    howLine,
    partnership: matchState.partnership,
    currentRunRate: matchState.currentRunRate,
    oversPerSide,
  };
}
