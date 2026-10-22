import type { ScorecardBallWire, ScorecardInningsWire } from '../model/scorecardSchemas';
import { type ScorecardFace, toScorecardFace } from './scorecardFace';

const OFF_ZONES = new Set(['third_man', 'deep_point', 'deep_cover', 'long_off']);

const LEG_ZONES = new Set(['deep_fine_leg', 'mid_wicket', 'square_leg', 'long_on']);

export type OverRuns = { n: number; runs: number };

export type InningsPhases = {
  pp: number;
  mid: number;
  death: number;
  extras: number;
};

export type WagonBatter = {
  id: number;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  dots: number;
  placed: number;
  zoneCounts: Record<string, number>;
  zonesUsed: number;
  offRuns: number;
  legRuns: number;
  hasShotData: boolean;
};

export type StatsInnings = {
  face: ScorecardFace;
  overList: OverRuns[];
  phases: InningsPhases;
  wagonWheel: WagonBatter[];
};

function ballRuns(ball: ScorecardBallWire): number {
  return Number(ball.runs ?? 0) + Number(ball.penalty_runs ?? 0) + Number(ball.additional_runs ?? 0);
}

function isExtraOnly(ball: ScorecardBallWire): boolean {
  return (
    Boolean(ball.is_wide || ball.is_no_ball || ball.is_bye || ball.is_leg_bye) ||
    (Number(ball.penalty_runs ?? 0) > 0 && Number(ball.runs ?? 0) === 0) ||
    (Number(ball.additional_runs ?? 0) > 0 && Number(ball.runs ?? 0) === 0)
  );
}

/** Group legal+all deliveries by over index → run totals. */

export function oversFromBalls(balls: ScorecardBallWire[] | undefined): OverRuns[] {
  const map = new Map<number, number>();
  for (const ball of balls ?? []) {
    const over = ball.over ?? 0;
    map.set(over, (map.get(over) ?? 0) + ballRuns(ball));
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]).map(([over, runs]) => ({ n: over + 1, runs }));
}

/** Phase split: PP first 6 (~30%), death last 4 (~20%), mid rest; extras-only → extras bucket. */

export function phasesFromBalls(
  balls: ScorecardBallWire[] | undefined,
  oversPerSide: number | null | undefined,
  extrasTotal: number
): InningsPhases {
  const totalOvers = Math.max(1, oversPerSide ?? 20);
  const ppEnd = Math.min(6, Math.max(1, Math.round(totalOvers * 0.3)));
  const deathStart = Math.max(ppEnd, totalOvers - Math.min(4, Math.max(1, Math.round(totalOvers * 0.2))));

  let pp = 0;
  let mid = 0;
  let death = 0;

  for (const ball of balls ?? []) {
    const runs = ballRuns(ball);
    if (runs === 0) continue;
    if (isExtraOnly(ball) && Number(ball.runs_off_bat ?? 0) === 0) {
      continue;
    }
    const over = (ball.over ?? 0) + 1;
    if (over <= ppEnd) pp += runs;
    else if (over > deathStart) death += runs;
    else mid += runs;
  }

  return { pp, mid, death, extras: extrasTotal };
}

export function wagonBattersFromInnings(inn: ScorecardInningsWire): WagonBatter[] {
  const byId = new Map<number, WagonBatter>();

  for (const row of inn.batting_stats ?? []) {
    const id = row.id ?? row.player_id;
    if (id == null) continue;
    byId.set(id, {
      id,
      name: row.name?.trim() || 'Player',
      runs: row.runs ?? 0,
      balls: row.balls ?? 0,
      fours: row.fours ?? 0,
      sixes: row.sixes ?? 0,
      dots: 0,
      placed: 0,
      zoneCounts: {},
      zonesUsed: 0,
      offRuns: 0,
      legRuns: 0,
      hasShotData: false,
    });
  }

  for (const ball of inn.balls ?? []) {
    const id = ball.striker_id;
    if (id == null) continue;
    let batter = byId.get(id);
    if (!batter) {
      batter = {
        id,
        name: `Player ${id}`,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        dots: 0,
        placed: 0,
        zoneCounts: {},
        zonesUsed: 0,
        offRuns: 0,
        legRuns: 0,
        hasShotData: false,
      };
      byId.set(id, batter);
    }

    const offBat = Number(ball.runs_off_bat ?? ball.runs ?? 0);
    const zone = ball.shot_position;
    if (zone) {
      batter.hasShotData = true;
      batter.zoneCounts[zone] = (batter.zoneCounts[zone] ?? 0) + 1;
      if (OFF_ZONES.has(zone)) batter.offRuns += offBat;
      else if (LEG_ZONES.has(zone)) batter.legRuns += offBat;
    }
    if (!ball.is_wide && !ball.is_no_ball && !ball.is_bye && !ball.is_leg_bye && !ball.is_wicket) {
      if (offBat === 0) batter.dots += 1;
      else if (offBat > 0 && offBat < 4) batter.placed += offBat;
    }
  }

  for (const batter of byId.values()) {
    batter.zonesUsed = Object.values(batter.zoneCounts).filter((n) => n > 0).length;
  }

  return [...byId.values()].filter((b) => b.balls > 0 || b.runs > 0 || b.hasShotData);
}

export function toStatsInnings(
  innings: ScorecardInningsWire[],
  options: {
    oversPerSide?: number | null | undefined;
    homeTeamId?: number | null | undefined;
    awayTeamId?: number | null | undefined;
    homeShort?: string | null | undefined;
    awayShort?: string | null | undefined;
  } = {}
): StatsInnings[] {
  return innings.map((inn) => {
    const face = toScorecardFace(inn, options);
    const extras =
      inn.total_extras ??
      inn.extras_breakdown?.total ??
      (inn.extras_breakdown
        ? (inn.extras_breakdown.wides ?? 0) +
          (inn.extras_breakdown.no_balls ?? 0) +
          (inn.extras_breakdown.byes ?? 0) +
          (inn.extras_breakdown.leg_byes ?? 0) +
          (inn.extras_breakdown.penalty_runs ?? 0)
        : 0);
    return {
      face,
      overList: oversFromBalls(inn.balls),
      phases: phasesFromBalls(inn.balls, options.oversPerSide, extras),
      wagonWheel: wagonBattersFromInnings(inn),
    };
  });
}
