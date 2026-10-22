import { z } from 'zod';

import { unwrapData } from '@/shared/api/unwrap';

/** Live card overlay from GET /matches/:id/match-state ( ScorerLiveCard). */

export type MatchLiveSnapshot = {
  batting: 'home' | 'away';
  homeScore: string | null;
  awayScore: string | null;
  oversDisplay: string | null;
  inningsNumber: number;
  inningsBreak: boolean;
  chase: { need: number; ballsLeft: number | null } | null;
};

/** Done row overlay from GET /matches/:id. */

export type MatchResultDetail = {
  resultSummary: string | null;
  motmName: string | null;
};

const activeInningsWireSchema = z
  .object({
    innings_number: z.number().optional(),
    innings_status: z.union([z.string(), z.object({ value: z.string() })]).optional(),
    batting_team_id: z.number().nullable().optional(),
    total_runs: z.number().optional(),
    total_wickets: z.number().optional(),
    overs_display: z.string().nullable().optional(),
    target: z.number().nullable().optional(),
    runs_to_win: z.number().nullable().optional(),
    balls_remaining: z.number().nullable().optional(),
    innings_complete: z.boolean().optional(),
  })
  .passthrough();

export const matchStateWireSchema = z
  .object({
    match_id: z.number().optional(),
    match_status: z.string().optional(),
    active_innings: activeInningsWireSchema.nullable().optional(),
    match_complete: z.boolean().optional(),
  })
  .passthrough();

export type MatchStateWire = z.infer<typeof matchStateWireSchema>;

export const matchDetailWireSchema = z
  .object({
    id: z.number(),
    result_summary: z.string().nullable().optional(),
    player_of_match: z
      .object({
        id: z.number().optional(),
        name: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
  })
  .passthrough();

export type MatchDetailWire = z.infer<typeof matchDetailWireSchema>;

function plainScore(runs: number | undefined, wickets: number | undefined, overs?: string | null): string {
  const base = `${runs ?? 0}/${wickets ?? 0}`;
  if (overs) return `${base} (${overs})`;
  return base;
}

function inningsStatusValue(raw: unknown): string {
  if (typeof raw === 'string') return raw;
  if (raw && typeof raw === 'object' && 'value' in raw && typeof (raw as { value: unknown }).value === 'string') {
    return (raw as { value: string }).value;
  }
  return '';
}

/** Map match-state + list sides → ScorerLiveCard scores / chase. */

export function toLiveSnapshot(
  wire: MatchStateWire,
  sides: { homeId: number | null; awayId: number | null }
): MatchLiveSnapshot | null {
  const ai = wire.active_innings;
  if (!ai) return null;

  const homeId = sides.homeId;
  const awayId = sides.awayId;
  const battingId = ai.batting_team_id != null ? Number(ai.batting_team_id) : null;

  let batting: 'home' | 'away' = 'home';
  if (battingId != null && awayId != null && battingId === awayId) batting = 'away';
  else if (battingId != null && homeId != null && battingId === homeId) batting = 'home';

  const battingScore = plainScore(ai.total_runs, ai.total_wickets);
  const inningsNumber = Number(ai.innings_number) || 1;
  const status = inningsStatusValue(ai.innings_status);
  const inningsBreak = Boolean(ai.innings_complete) || status === 'completed' || wire.match_status === 'break';

  let homeScore: string | null = null;
  let awayScore: string | null = null;

  if (inningsNumber <= 1) {
    if (batting === 'home') homeScore = battingScore;
    else awayScore = battingScore;
  } else {
    // Second innings — opponent’s first-innings total is typically target − 1.
    const prior =
      ai.target != null && Number.isFinite(Number(ai.target)) ? String(Math.max(0, Number(ai.target) - 1)) : null;
    if (batting === 'home') {
      homeScore = battingScore;
      awayScore = prior;
    } else {
      awayScore = battingScore;
      homeScore = prior;
    }
  }

  let chase: MatchLiveSnapshot['chase'] = null;
  if (inningsNumber >= 2 && ai.runs_to_win != null && Number(ai.runs_to_win) > 0) {
    chase = {
      need: Number(ai.runs_to_win),
      ballsLeft: ai.balls_remaining != null ? Number(ai.balls_remaining) : null,
    };
  }

  return {
    batting,
    homeScore,
    awayScore,
    oversDisplay: ai.overs_display ?? null,
    inningsNumber,
    inningsBreak,
    chase,
  };
}

export function toResultDetail(wire: MatchDetailWire): MatchResultDetail {
  return {
    resultSummary: wire.result_summary?.trim() || null,
    motmName: wire.player_of_match?.name?.trim() || null,
  };
}

export function parseMatchState(raw: unknown): MatchStateWire {
  return unwrapData(matchStateWireSchema)(raw);
}

export function parseMatchDetail(raw: unknown): MatchDetailWire {
  return unwrapData(matchDetailWireSchema)(raw);
}
