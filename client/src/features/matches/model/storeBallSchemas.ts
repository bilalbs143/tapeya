import { z } from 'zod';

import { unwrapData } from '@/shared/api/unwrap';

import { type ScoringSession, scoringStateWireSchema, toScoringSession } from './scoringSession';

const outPlayerStatsSchema = z
  .object({
    runs: z.number().optional(),
    balls: z.number().optional(),
    fours: z.number().optional(),
    sixes: z.number().optional(),
    strike_rate: z.union([z.string(), z.number()]).optional(),
  })
  .passthrough();

export const storedBallWireSchema = z
  .object({
    id: z.number().optional(),
    is_wicket: z.boolean().optional(),
    dismissal_type: z.string().nullable().optional(),
    dismissal_type_label: z.string().nullable().optional(),
    out_player_id: z.number().nullable().optional(),
    out_player_name: z.string().nullable().optional(),
    out_player_crease_time_seconds: z.number().nullable().optional(),
    out_player_stats: outPlayerStatsSchema.nullable().optional(),
    bowler_id: z.number().nullable().optional(),
    fielder_id: z.number().nullable().optional(),
    striker_id: z.number().nullable().optional(),
    shot_position: z.string().nullable().optional(),
  })
  .passthrough();

export type StoredBallWire = z.infer<typeof storedBallWireSchema>;

export const storeBallResponseWireSchema = z.object({
  ball: storedBallWireSchema,
  match_state: scoringStateWireSchema,
});

export type StoreBallResult = {
  ball: StoredBallWire;
  matchState: ScoringSession;
};

export function parseStoreBallResponse(raw: unknown): StoreBallResult {
  const data = unwrapData(storeBallResponseWireSchema)(raw);
  return {
    ball: data.ball,
    matchState: toScoringSession(data.match_state),
  };
}
