import { z } from 'zod';

import { unwrapData } from '@/shared/api/unwrap';

const playerSchema = z.object({
  id: z.number(),
  name: z.string(),
  role: z.string().optional(),
});

const batterSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    runs: z.number().optional(),
    balls: z.number().optional(),
    fours: z.number().optional(),
    sixes: z.number().optional(),
  })
  .nullable();

const bowlerSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    overs: z.string().optional(),
    maidens: z.number().optional(),
    runs: z.number().optional(),
    wickets: z.number().optional(),
  })
  .nullable();

const deliverySchema = z.object({
  display_token: z.string(),
  chip_type: z.string().optional(),
});

const statusSchema = z.union([z.string(), z.object({ value: z.string() })]);

export const scoringStateWireSchema = z
  .object({
    match_id: z.number().optional(),
    match_status: z.string().optional(),
    match_complete: z.boolean().optional(),
    match_result: z.string().nullable().optional(),
    needs_new_batter: z.boolean().optional(),
    needs_new_bowler: z.boolean().optional(),
    vacant_end: z.enum(['striker', 'non_striker']).nullable().optional(),
    active_innings: z
      .object({
        innings_id: z.number(),
        innings_number: z.number(),
        innings_status: statusSchema.optional(),
        batting_team_id: z.number().nullable().optional(),
        bowling_team_id: z.number().nullable().optional(),
        striker: batterSchema.optional(),
        non_striker: batterSchema.optional(),
        bowler: bowlerSchema.optional(),
        total_runs: z.number().optional(),
        total_wickets: z.number().optional(),
        overs_display: z.string().nullable().optional(),
        over_number: z.number().optional(),
        balls_in_current_over: z.number().optional(),
        next_is_free_hit: z.boolean().optional(),
        innings_complete: z.boolean().optional(),
        target: z.number().nullable().optional(),
        runs_to_win: z.number().nullable().optional(),
        balls_remaining: z.number().nullable().optional(),
        current_run_rate: z.union([z.string(), z.number()]).nullable().optional(),
        required_run_rate: z.union([z.string(), z.number()]).nullable().optional(),
        current_over_deliveries: z.array(deliverySchema).optional(),
        current_partnership: z
          .object({
            runs: z.number().optional(),
            balls: z.number().optional(),
          })
          .nullable()
          .optional(),
        extras_breakdown: z
          .object({
            wides: z.number().optional(),
            no_balls: z.number().optional(),
            byes: z.number().optional(),
            leg_byes: z.number().optional(),
            penalty_runs: z.number().optional(),
          })
          .optional(),
        total_extras: z.number().optional(),
      })
      .nullable()
      .optional(),
    playing_eleven: z
      .object({
        home: z.object({ team_id: z.number(), players: z.array(playerSchema) }).optional(),
        away: z.object({ team_id: z.number(), players: z.array(playerSchema) }).optional(),
      })
      .optional(),
    analytics_settings: z
      .object({
        wagon_wheel_enabled: z.boolean().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export type ScoringStateWire = z.infer<typeof scoringStateWireSchema>;

export type CreasePlayer = {
  id: number;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
};

export type BowlerLine = {
  id: number;
  name: string;
  overs: string;
  maidens: number;
  runs: number;
  wickets: number;
  econ: string;
};

export type PartnershipLine = {
  runs: number;
  balls: number;
};

export type XiPlayer = { id: number; name: string; role?: string | undefined };

export type ScoringSession = {
  matchStatus: string;
  matchComplete: boolean;
  resultSummary: string | null;
  needsNewBatter: boolean;
  needsNewBowler: boolean;
  vacantEnd: 'striker' | 'non_striker' | null;
  inningsId: number | null;
  inningsNumber: number;
  battingTeamId: number | null;
  bowlingTeamId: number | null;
  striker: CreasePlayer | null;
  nonStriker: CreasePlayer | null;
  bowler: BowlerLine | null;
  runs: number;
  wickets: number;
  oversDisplay: string | null;
  overNumber: number;
  ballsInOver: number;
  freeHit: boolean;
  inningsComplete: boolean;
  target: number | null;
  runsToWin: number | null;
  ballsRemaining: number | null;
  currentRunRate: string | null;
  requiredRunRate: string | null;
  deliveries: { token: string; chip: string | null }[];
  extras: number;
  partnership: PartnershipLine | null;
  homeXi: XiPlayer[];
  awayXi: XiPlayer[];
  wagonWheelEnabled: boolean;
};

function rate(value: string | number | null | undefined): string | null {
  if (value == null || value === '') return null;
  return String(value);
}

function toBatter(wire: z.infer<typeof batterSchema> | undefined): CreasePlayer | null {
  if (!wire) return null;
  return {
    id: wire.id,
    name: wire.name || 'Player',
    runs: wire.runs ?? 0,
    balls: wire.balls ?? 0,
    fours: wire.fours ?? 0,
    sixes: wire.sixes ?? 0,
  };
}

function bowlerEcon(overs: string, runs: number): string {
  const parts = overs.split('.').map((n) => Number(n) || 0);
  const whole = parts[0] ?? 0;
  const part = parts[1] ?? 0;
  const balls = whole * 6 + part;
  if (balls <= 0) return '—';
  return ((runs * 6) / balls).toFixed(2);
}

function extrasTotal(
  breakdown:
    | {
        wides?: number | undefined;
        no_balls?: number | undefined;
        byes?: number | undefined;
        leg_byes?: number | undefined;
        penalty_runs?: number | undefined;
      }
    | undefined,
  totalExtras: number | undefined
): number {
  if (typeof totalExtras === 'number') return totalExtras;
  if (!breakdown) return 0;
  return (
    (breakdown.wides ?? 0) +
    (breakdown.no_balls ?? 0) +
    (breakdown.byes ?? 0) +
    (breakdown.leg_byes ?? 0) +
    (breakdown.penalty_runs ?? 0)
  );
}

export function toScoringSession(wire: ScoringStateWire): ScoringSession {
  const inn = wire.active_innings ?? null;
  const overs = inn?.bowler?.overs ?? '0.0';
  const bowlRuns = inn?.bowler?.runs ?? 0;
  return {
    matchStatus: wire.match_status ?? '',
    matchComplete: Boolean(wire.match_complete),
    resultSummary: wire.match_result?.trim() || null,
    needsNewBatter: Boolean(wire.needs_new_batter),
    needsNewBowler: Boolean(wire.needs_new_bowler),
    vacantEnd: wire.vacant_end ?? null,
    inningsId: inn?.innings_id ?? null,
    inningsNumber: inn?.innings_number ?? 1,
    battingTeamId: inn?.batting_team_id ?? null,
    bowlingTeamId: inn?.bowling_team_id ?? null,
    striker: toBatter(inn?.striker),
    nonStriker: toBatter(inn?.non_striker),
    bowler: inn?.bowler
      ? {
          id: inn.bowler.id,
          name: inn.bowler.name || 'Bowler',
          overs,
          maidens: inn.bowler.maidens ?? 0,
          runs: bowlRuns,
          wickets: inn.bowler.wickets ?? 0,
          econ: bowlerEcon(overs, bowlRuns),
        }
      : null,
    runs: inn?.total_runs ?? 0,
    wickets: inn?.total_wickets ?? 0,
    oversDisplay: inn?.overs_display ?? null,
    overNumber: inn?.over_number ?? 0,
    ballsInOver: inn?.balls_in_current_over ?? 0,
    freeHit: Boolean(inn?.next_is_free_hit),
    inningsComplete: Boolean(inn?.innings_complete),
    target: inn?.target ?? null,
    runsToWin: inn?.runs_to_win ?? null,
    ballsRemaining: inn?.balls_remaining ?? null,
    currentRunRate: rate(inn?.current_run_rate),
    requiredRunRate: rate(inn?.required_run_rate),
    deliveries: (inn?.current_over_deliveries ?? []).map((d) => ({
      token: d.display_token,
      chip: d.chip_type ?? null,
    })),
    extras: extrasTotal(inn?.extras_breakdown, inn?.total_extras),
    partnership: inn?.current_partnership
      ? { runs: inn.current_partnership.runs ?? 0, balls: inn.current_partnership.balls ?? 0 }
      : null,
    homeXi: (wire.playing_eleven?.home?.players ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      ...(p.role ? { role: p.role } : {}),
    })),
    awayXi: (wire.playing_eleven?.away?.players ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      ...(p.role ? { role: p.role } : {}),
    })),
    wagonWheelEnabled: Boolean(wire.analytics_settings?.wagon_wheel_enabled),
  };
}

export function parseScoringState(raw: unknown): ScoringSession {
  return toScoringSession(unwrapData(scoringStateWireSchema)(raw));
}

export function creaseReady(session: ScoringSession): boolean {
  return (
    creaseSlot(session) === 'ready' && !session.inningsComplete && !session.matchComplete && session.inningsId != null
  );
}

export type CreaseSlot = 'ready' | 'openers' | 'striker' | 'non_striker' | 'bowler';

/** Which crease picker to open. `ready` means the pad may accept a ball. */

export function creaseSlot(session: ScoringSession): CreaseSlot {
  if (!session.inningsId || session.matchComplete || session.inningsComplete) return 'ready';
  if (!session.striker && !session.nonStriker) return 'openers';
  if (!session.striker || (session.needsNewBatter && session.vacantEnd !== 'non_striker')) return 'striker';
  if (!session.nonStriker || session.needsNewBatter) return 'non_striker';
  if (!session.bowler || session.needsNewBowler) return 'bowler';
  return 'ready';
}

export function xiForTeam(session: ScoringSession, teamId: number | null, homeTeamId: number | null): XiPlayer[] {
  if (teamId == null || homeTeamId == null) return [];
  return teamId === homeTeamId ? session.homeXi : session.awayXi;
}
