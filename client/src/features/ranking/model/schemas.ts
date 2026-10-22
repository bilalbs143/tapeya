import { z } from 'zod';

import { formatDecimal } from '@/features/stats';

const rankingPlayerWireSchema = z
  .object({
    id: z.number().optional(),
    name: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

const rankingStatsWireSchema = z
  .object({
    matches: z.number().optional(),
    innings: z.number().optional(),
    runs: z.number().optional(),
    average: z.number().nullable().optional(),
    strike_rate: z.number().nullable().optional(),
    fours: z.number().optional(),
    sixes: z.number().optional(),
    wickets: z.number().optional(),
    economy: z.number().nullable().optional(),
    overs: z.number().optional(),
  })
  .passthrough();

export const rankingRowWireSchema = z.object({
  rank: z.number().optional(),
  player_id: z.number(),
  player: rankingPlayerWireSchema,
  stats: rankingStatsWireSchema.optional(),
});
export type RankingRowWire = z.infer<typeof rankingRowWireSchema>;

export const rankingsPayloadWireSchema = z.object({
  tournament_type: z.string().optional(),
  cricket_format: z.string().optional(),
  category: z.string().optional(),
  sort: z.string().optional(),
  rankings: z.array(rankingRowWireSchema),
});
export type RankingsPayloadWire = z.infer<typeof rankingsPayloadWireSchema>;

export type RankingRow = {
  rank: number;
  playerId: number;
  playerName: string;
  matches: number | null;
  innings: number | null;
  runs: number | null;
  average: number | null;
  fours: number | null;
  sixes: number | null;
  wickets: number | null;
  economy: number | null;
};

export type RankingsPayload = {
  tournamentType: string | null;
  cricketFormat: string | null;
  category: string | null;
  sort: string | null;
  rankings: RankingRow[];
};

export function toRankingRow(wire: RankingRowWire, index: number): RankingRow {
  const stats = wire.stats ?? {};
  return {
    rank: wire.rank ?? index + 1,
    playerId: wire.player_id,
    playerName: wire.player?.name?.trim() || 'Player',
    matches: stats.matches ?? null,
    innings: stats.innings ?? null,
    runs: stats.runs ?? null,
    average: stats.average ?? null,
    fours: stats.fours ?? null,
    sixes: stats.sixes ?? null,
    wickets: stats.wickets ?? null,
    economy: stats.economy ?? null,
  };
}

export function toRankingsPayload(wire: RankingsPayloadWire): RankingsPayload {
  return {
    tournamentType: wire.tournament_type ?? null,
    cricketFormat: wire.cricket_format ?? null,
    category: wire.category ?? null,
    sort: wire.sort ?? null,
    rankings: wire.rankings.map(toRankingRow),
  };
}

export type RankingCardVariant = 'batter' | 'bowler' | 'other';

export type RankingCard = {
  playerId: number;
  name: string;
  role: string;
  primary: string | number;
  detail: string;
};

export function toBatterCard(row: RankingRow): RankingCard {
  return {
    playerId: row.playerId,
    name: row.playerName,
    role: 'BAT',
    primary: row.runs ?? 0,
    detail: `Innings: ${row.innings ?? 0} Average: ${formatDecimal(row.average, 2)}`,
  };
}

export function toBowlerCard(row: RankingRow): RankingCard {
  return {
    playerId: row.playerId,
    name: row.playerName,
    role: 'BOWL',
    primary: row.wickets ?? 0,
    detail: `Innings: ${row.innings ?? 0} Economy: ${formatDecimal(row.economy, 2)}`,
  };
}

export function toOtherCard(row: RankingRow, key: 'sixes' | 'fours'): RankingCard {
  return {
    playerId: row.playerId,
    name: row.playerName,
    role: 'BAT',
    primary: (key === 'sixes' ? row.sixes : row.fours) ?? 0,
    detail: `Innings: ${row.innings ?? 0} Average: ${formatDecimal(row.average, 2)}`,
  };
}

const NO_VALUE = '—';

export type StatsTotalColumn = { key: string; header: string; width?: string };

export function statsTotalColumns(statType: string): StatsTotalColumn[] {
  switch (statType) {
    case 'wicket-takers':
      return [
        { key: 'player', header: 'Player', width: 'min-w-[7.5rem]' },
        { key: 'mat', header: 'Mat' },
        { key: 'wkts', header: 'Wkts' },
        { key: 'inns', header: 'Inns' },
        { key: 'econ', header: 'Econ' },
      ];
    case 'sixes':
      return [
        { key: 'player', header: 'Player', width: 'min-w-[7.5rem]' },
        { key: 'mat', header: 'Mat' },
        { key: 'inns', header: 'Inns' },
        { key: 'six', header: 'Six' },
      ];
    case 'fours':
      return [
        { key: 'player', header: 'Player', width: 'min-w-[7.5rem]' },
        { key: 'mat', header: 'Mat' },
        { key: 'inns', header: 'Inns' },
        { key: 'four', header: 'Fours' },
      ];
    default:
      return [
        { key: 'player', header: 'Player', width: 'min-w-[7.5rem]' },
        { key: 'mat', header: 'Mat' },
        { key: 'runs', header: 'Runs' },
        { key: 'inns', header: 'Inns' },
        { key: 'avg', header: 'Avg' },
      ];
  }
}

export type StatsTotalRow = Record<string, string | number> & {
  rank: number;
  playerName: string;
  playerId: number;
};

export function buildStatsTotalRows(statType: string, rankings: RankingRow[]): StatsTotalRow[] {
  return rankings.map((row) => {
    const base = {
      rank: row.rank,
      playerId: row.playerId,
      playerName: row.playerName,
      mat: row.matches ?? row.innings ?? NO_VALUE,
      inns: row.innings ?? NO_VALUE,
    };

    if (statType === 'wicket-takers') {
      return {
        ...base,
        wkts: row.wickets ?? NO_VALUE,
        econ: formatDecimal(row.economy, 2),
      };
    }
    if (statType === 'sixes') {
      return { ...base, six: row.sixes ?? NO_VALUE };
    }
    if (statType === 'fours') {
      return { ...base, four: row.fours ?? NO_VALUE };
    }
    return {
      ...base,
      runs: row.runs ?? NO_VALUE,
      avg: formatDecimal(row.average, 2),
    };
  });
}

export function formatRankIndex(rank: number): string {
  return `${rank}.`;
}
