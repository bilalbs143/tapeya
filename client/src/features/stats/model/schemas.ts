import { z } from 'zod';

import { formatDecimal } from '../lib/format';

/** Stats filter value — API `stats_bucket` values plus app-only `all`. */

export type StatsBucket = string;

const battingWireSchema = z.object({
  matches: z.number(),
  innings: z.number(),
  not_outs: z.number().optional(),
  runs: z.number(),
  balls_faced: z.number().optional(),
  fours: z.number(),
  sixes: z.number(),
  dots: z.number(),
  highest_score: z.union([z.string(), z.number()]),
  hundreds: z.number(),
  fifties: z.number(),
  average: z.number().nullable(),
  strike_rate: z.number().nullable(),
});

const bowlingWireSchema = z.object({
  matches: z.number(),
  innings: z.number(),
  overs: z.number(),
  maidens: z.number().optional(),
  runs_conceded: z.number().optional(),
  wickets: z.number(),
  no_balls: z.number().optional(),
  wides: z.number().optional(),
  best_bowling_innings: z.union([z.string(), z.number()]).nullable().optional(),
  best_bowling_match: z.union([z.string(), z.number()]).nullable().optional(),
  five_wickets: z.number(),
  ten_wickets: z.number(),
  average: z.number().nullable(),
  economy: z.number().nullable(),
  strike_rate: z.number().nullable(),
});

const fieldingWireSchema = z.object({
  matches: z.number(),
  catches: z.number(),
  run_outs: z.number(),
  stumpings: z.number(),
});

/** Wire — `PlayerStatsController::show`. */

export const playerStatsWireSchema = z.object({
  player_id: z.number(),
  tournament_type: z.string(),
  cricket_format: z.string(),
  batting: battingWireSchema,
  bowling: bowlingWireSchema,
  fielding: fieldingWireSchema,
});
export type PlayerStatsWire = z.infer<typeof playerStatsWireSchema>;

export type BattingStats = {
  matches: number;
  innings: number;
  runs: number;
  fours: number;
  sixes: number;
  dots: number;
  highestScore: string | number;
  hundreds: number;
  fifties: number;
  average: number | null;
  strikeRate: number | null;
};

export type BowlingStats = {
  matches: number;
  innings: number;
  overs: number;
  wickets: number;
  bestBowlingInnings: string | number | null;
  bestBowlingMatch: string | number | null;
  fiveWickets: number;
  tenWickets: number;
  average: number | null;
  economy: number | null;
  strikeRate: number | null;
};

export type FieldingStats = {
  matches: number;
  catches: number;
  runOuts: number;
  stumpings: number;
};

export type PlayerStats = {
  playerId: number;
  tournamentType: string;
  cricketFormat: string;
  batting: BattingStats;
  bowling: BowlingStats;
  fielding: FieldingStats;
};

export function toPlayerStats(wire: PlayerStatsWire): PlayerStats {
  return {
    playerId: wire.player_id,
    tournamentType: wire.tournament_type,
    cricketFormat: wire.cricket_format,
    batting: {
      matches: wire.batting.matches,
      innings: wire.batting.innings,
      runs: wire.batting.runs,
      fours: wire.batting.fours,
      sixes: wire.batting.sixes,
      dots: wire.batting.dots,
      highestScore: wire.batting.highest_score,
      hundreds: wire.batting.hundreds,
      fifties: wire.batting.fifties,
      average: wire.batting.average,
      strikeRate: wire.batting.strike_rate,
    },
    bowling: {
      matches: wire.bowling.matches,
      innings: wire.bowling.innings,
      overs: wire.bowling.overs,
      wickets: wire.bowling.wickets,
      bestBowlingInnings: wire.bowling.best_bowling_innings ?? null,
      bestBowlingMatch: wire.bowling.best_bowling_match ?? null,
      fiveWickets: wire.bowling.five_wickets,
      tenWickets: wire.bowling.ten_wickets,
      average: wire.bowling.average,
      economy: wire.bowling.economy,
      strikeRate: wire.bowling.strike_rate,
    },
    fielding: {
      matches: wire.fielding.matches,
      catches: wire.fielding.catches,
      runOuts: wire.fielding.run_outs,
      stumpings: wire.fielding.stumpings,
    },
  };
}

/** Minimal team row for the profile Teams band — `GET /users/{id}/teams`. */

export const playerTeamWireSchema = z.object({
  id: z.number(),
  name: z.string(),
});
export type PlayerTeamWire = z.infer<typeof playerTeamWireSchema>;

export type PlayerTeam = { id: number; name: string };

export function toPlayerTeam(wire: PlayerTeamWire): PlayerTeam {
  return { id: wire.id, name: wire.name };
}

export type StatCell = { label: string; value: string | number };

export function hasBattingActivity(stats: BattingStats | null | undefined): boolean {
  return stats != null && (stats.innings > 0 || stats.runs > 0);
}

export function hasBowlingActivity(stats: BowlingStats | null | undefined): boolean {
  return stats != null && (stats.innings > 0 || stats.wickets > 0 || stats.overs > 0);
}

export function hasFieldingActivity(stats: FieldingStats | null | undefined): boolean {
  return stats != null && (stats.catches > 0 || stats.runOuts > 0 || stats.stumpings > 0);
}

export function buildSummaryStats(batting: BattingStats | null | undefined): StatCell[] {
  if (batting == null || !hasBattingActivity(batting)) return [];
  return [
    { label: 'Runs', value: batting.runs },
    { label: 'Centuries', value: batting.hundreds },
    { label: 'Sixes', value: batting.sixes },
  ];
}

export function buildBattingCareer(batting: BattingStats | null | undefined): StatCell[] {
  if (batting == null || !hasBattingActivity(batting)) return [];
  return [
    { label: 'MAT', value: batting.matches },
    { label: 'INNS', value: batting.innings },
    { label: 'RUNS', value: batting.runs },
    { label: 'HS', value: batting.highestScore },
    { label: 'AVG', value: batting.average != null ? formatDecimal(batting.average) : '—' },
    { label: 'SR', value: batting.strikeRate != null ? formatDecimal(batting.strikeRate) : '—' },
    { label: '100S', value: batting.hundreds },
    { label: '50S', value: batting.fifties },
    { label: 'DOTS', value: batting.dots },
    { label: '4S', value: batting.fours },
    { label: '6S', value: batting.sixes },
  ];
}

export function buildBowlingCareer(bowling: BowlingStats | null | undefined): StatCell[] {
  if (bowling == null || !hasBowlingActivity(bowling)) return [];
  return [
    { label: 'MAT', value: bowling.matches },
    { label: 'INNS', value: bowling.innings },
    { label: 'OVERS', value: formatDecimal(bowling.overs, 1) },
    { label: 'WKTS', value: bowling.wickets },
    { label: 'BBI', value: bowling.bestBowlingInnings ?? '—' },
    { label: 'BBM', value: bowling.bestBowlingMatch ?? '—' },
    { label: 'AVG', value: bowling.average != null ? formatDecimal(bowling.average) : '—' },
    { label: 'ECON', value: bowling.economy != null ? formatDecimal(bowling.economy) : '—' },
    { label: 'SR', value: bowling.strikeRate != null ? formatDecimal(bowling.strikeRate) : '—' },
    { label: '5W', value: bowling.fiveWickets },
    { label: '10W', value: bowling.tenWickets },
  ];
}

export function buildFieldingCareer(fielding: FieldingStats | null | undefined): StatCell[] {
  if (fielding == null || !hasFieldingActivity(fielding)) return [];
  return [
    { label: 'MAT', value: fielding.matches },
    { label: 'CT', value: fielding.catches },
    { label: 'RO', value: fielding.runOuts },
    { label: 'ST', value: fielding.stumpings },
  ];
}
