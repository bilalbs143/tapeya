import { z } from 'zod';

import { unwrapData } from '@/shared/api/unwrap';
import type { DenseTableColumn } from '@/shared/ui/DenseTable';

const battingRowWireSchema = z.object({
  player_id: z.number(),
  name: z.string(),
  runs: z.number().optional(),
  innings: z.number().optional(),
  average: z.number().nullable().optional(),
  fours: z.number().optional(),
  sixes: z.number().optional(),
});

const bowlingRowWireSchema = z.object({
  player_id: z.number(),
  name: z.string(),
  wickets: z.number().optional(),
  overs: z.number().optional(),
  runs_conceded: z.number().optional(),
  economy: z.number().nullable().optional(),
});

const seasonStatsWireSchema = z.object({
  tournament_id: z.number().optional(),
  total_fours: z.number().optional(),
  total_sixes: z.number().optional(),
  top_run_scorers: z.array(battingRowWireSchema).optional(),
  top_wicket_takers: z.array(bowlingRowWireSchema).optional(),
  most_fours: z.array(battingRowWireSchema).optional(),
  most_sixes: z.array(battingRowWireSchema).optional(),
});

export type SeasonBattingRow = {
  playerId: number;
  name: string;
  runs: number;
  innings: number;
  average: number | null;
  fours: number;
  sixes: number;
};

export type SeasonBowlingRow = {
  playerId: number;
  name: string;
  wickets: number;
  overs: number;
  runsConceded: number;
  economy: number | null;
};

export type TournamentSeasonStats = {
  tournamentId: number;
  totalFours: number;
  totalSixes: number;
  topRunScorers: SeasonBattingRow[];
  topWicketTakers: SeasonBowlingRow[];
  mostFours: SeasonBattingRow[];
  mostSixes: SeasonBattingRow[];
};

export const SEASON_BATTING_COLUMNS: DenseTableColumn[] = [
  { key: 'pos', label: '#', width: '22px' },
  { key: 'player', label: 'Player', width: 'minmax(0,1fr)' },
  { key: 'inns', label: 'I', width: '26px', align: 'right', mono: true },
  { key: 'runs', label: 'R', width: '34px', align: 'right', mono: true, emphasis: 'primary' },
  { key: 'avg', label: 'Avg', width: '42px', align: 'right', mono: true },
  { key: 'fours', label: '4s', width: '28px', align: 'right', mono: true },
  { key: 'sixes', label: '6s', width: '28px', align: 'right', mono: true },
];

export const SEASON_BOWLING_COLUMNS: DenseTableColumn[] = [
  { key: 'pos', label: '#', width: '22px' },
  { key: 'player', label: 'Player', width: 'minmax(0,1fr)' },
  { key: 'wickets', label: 'W', width: '28px', align: 'right', mono: true, emphasis: 'primary' },
  { key: 'overs', label: 'O', width: '36px', align: 'right', mono: true },
  { key: 'runs', label: 'R', width: '34px', align: 'right', mono: true },
  { key: 'econ', label: 'Econ', width: '42px', align: 'right', mono: true },
];

function toBatting(wire: z.infer<typeof battingRowWireSchema>): SeasonBattingRow {
  return {
    playerId: wire.player_id,
    name: wire.name.trim() || `Player ${wire.player_id}`,
    runs: Number(wire.runs ?? 0),
    innings: Number(wire.innings ?? 0),
    average: wire.average ?? null,
    fours: Number(wire.fours ?? 0),
    sixes: Number(wire.sixes ?? 0),
  };
}

function toBowling(wire: z.infer<typeof bowlingRowWireSchema>): SeasonBowlingRow {
  return {
    playerId: wire.player_id,
    name: wire.name.trim() || `Player ${wire.player_id}`,
    wickets: Number(wire.wickets ?? 0),
    overs: Number(wire.overs ?? 0),
    runsConceded: Number(wire.runs_conceded ?? 0),
    economy: wire.economy ?? null,
  };
}

export function formatAvg(avg: number | null): string {
  if (avg == null || !Number.isFinite(avg)) return '—';
  return avg.toFixed(2);
}

export function toTournamentSeasonStats(wire: z.infer<typeof seasonStatsWireSchema>): TournamentSeasonStats {
  return {
    tournamentId: wire.tournament_id ?? 0,
    totalFours: Number(wire.total_fours ?? 0),
    totalSixes: Number(wire.total_sixes ?? 0),
    topRunScorers: (wire.top_run_scorers ?? []).map(toBatting),
    topWicketTakers: (wire.top_wicket_takers ?? []).map(toBowling),
    mostFours: (wire.most_fours ?? []).map(toBatting),
    mostSixes: (wire.most_sixes ?? []).map(toBatting),
  };
}

export function parseTournamentSeasonStats(raw: unknown): TournamentSeasonStats {
  return toTournamentSeasonStats(unwrapData(seasonStatsWireSchema)(raw));
}
