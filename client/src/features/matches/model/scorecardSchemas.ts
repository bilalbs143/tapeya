import { z } from 'zod';

import { unwrapData } from '@/shared/api/unwrap';

const presentationSchema = z
  .object({
    display_token: z.string().optional(),
    label: z.string().optional(),
    chip_type: z.string().optional(),
    runs_total: z.number().optional(),
  })
  .passthrough()
  .optional();

export const scorecardBallWireSchema = z
  .object({
    id: z.number(),
    over: z.number().nullable().optional(),
    ball_in_over: z.number().nullable().optional(),
    striker_id: z.number().nullable().optional(),
    non_striker_id: z.number().nullable().optional(),
    bowler_id: z.number().nullable().optional(),
    runs: z.number().optional(),
    runs_off_bat: z.number().nullable().optional(),
    is_no_ball: z.boolean().optional(),
    is_wide: z.boolean().optional(),
    is_leg_bye: z.boolean().optional(),
    is_bye: z.boolean().optional(),
    is_free_hit: z.boolean().optional(),
    penalty_runs: z.number().nullable().optional(),
    additional_runs: z.number().nullable().optional(),
    is_wicket: z.boolean().optional(),
    dismissal_type: z.string().nullable().optional(),
    dismissal_type_label: z.string().nullable().optional(),
    out_player_id: z.number().nullable().optional(),
    fielder_id: z.number().nullable().optional(),
    shot_position: z.string().nullable().optional(),
    no_ball_type: z.string().nullable().optional(),
    no_ball_runs_type: z.string().nullable().optional(),
    presentation: presentationSchema,
  })
  .passthrough();

export type ScorecardBallWire = z.infer<typeof scorecardBallWireSchema>;

export const battingStatWireSchema = z
  .object({
    id: z.number().optional(),
    player_id: z.number().optional(),
    name: z.string().optional(),
    runs: z.number().optional(),
    balls: z.number().optional(),
    fours: z.number().optional(),
    sixes: z.number().optional(),
    strike_rate: z.union([z.string(), z.number()]).optional(),
    dismissal_type: z.string().nullable().optional(),
    dismissal_label: z.string().nullable().optional(),
    bowler_name: z.string().nullable().optional(),
    fielder_name: z.string().nullable().optional(),
    is_on_crease: z.boolean().optional(),
    is_retired_hurt: z.boolean().optional(),
  })
  .passthrough();

export const bowlingStatWireSchema = z
  .object({
    id: z.number().optional(),
    player_id: z.number().optional(),
    name: z.string().optional(),
    overs: z.union([z.string(), z.number()]).optional(),
    maidens: z.number().optional(),
    runs: z.number().optional(),
    wickets: z.number().optional(),
    economy: z.union([z.string(), z.number()]).optional(),
  })
  .passthrough();

export const fallOfWicketWireSchema = z
  .object({
    wicket_number: z.number().optional(),
    batsman_name: z.string().optional(),
    score: z.number().optional(),
    overs: z.string().optional(),
  })
  .passthrough();

export const partnershipWireSchema = z
  .object({
    player_1_id: z.number().nullable().optional(),
    player_2_id: z.number().nullable().optional(),
    player_1_runs: z.number().optional(),
    player_1_balls: z.number().optional(),
    player_2_runs: z.number().optional(),
    player_2_balls: z.number().optional(),
    runs: z.number().optional(),
    balls: z.number().optional(),
    wicket_number: z.number().nullable().optional(),
  })
  .passthrough();

export type PartnershipWire = z.infer<typeof partnershipWireSchema>;

export const extrasBreakdownWireSchema = z
  .object({
    wides: z.number().optional(),
    no_balls: z.number().optional(),
    byes: z.number().optional(),
    leg_byes: z.number().optional(),
    penalty_runs: z.number().optional(),
    total: z.number().optional(),
  })
  .passthrough();

export const scorecardInningsWireSchema = z
  .object({
    id: z.number(),
    innings_number: z.number(),
    batting_team_id: z.number().nullable().optional(),
    bowling_team_id: z.number().nullable().optional(),
    batting_team: z.object({ id: z.number(), name: z.string() }).nullable().optional(),
    bowling_team: z.object({ id: z.number(), name: z.string() }).nullable().optional(),
    status: z.union([z.string(), z.object({ value: z.string() })]).optional(),
    total_runs: z.number().optional(),
    total_wickets: z.number().optional(),
    total_extras: z.number().optional(),
    extras_breakdown: extrasBreakdownWireSchema.optional(),
    overs_display: z.string().nullable().optional(),
    run_rate: z.union([z.string(), z.number()]).nullable().optional(),
    current_striker_id: z.number().nullable().optional(),
    batting_stats: z.array(battingStatWireSchema).optional(),
    bowling_stats: z.array(bowlingStatWireSchema).optional(),
    fall_of_wickets: z.array(fallOfWicketWireSchema).optional(),
    partnerships: z.array(partnershipWireSchema).optional(),
    balls: z.array(scorecardBallWireSchema).optional(),
  })
  .passthrough();

export type ScorecardInningsWire = z.infer<typeof scorecardInningsWireSchema>;

export const scorecardWireSchema = z
  .object({
    match_id: z.number().optional(),
    innings: z.array(scorecardInningsWireSchema).optional(),
  })
  .passthrough();

export type ScorecardWire = z.infer<typeof scorecardWireSchema>;

export type Scorecard = {
  matchId: number | null;
  innings: ScorecardInningsWire[];
};

export function parseScorecard(raw: unknown): Scorecard {
  const data = unwrapData(scorecardWireSchema)(raw);
  return {
    matchId: data.match_id ?? null,
    innings: data.innings ?? [],
  };
}

function statusValue(status: ScorecardInningsWire['status']): string {
  if (status == null) return '';
  if (typeof status === 'string') return status;
  return status.value ?? '';
}

export function inningsStatus(innings: ScorecardInningsWire): string {
  return statusValue(innings.status);
}
