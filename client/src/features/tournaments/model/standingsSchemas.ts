import { z } from 'zod';

import { unwrapData } from '@/shared/api/unwrap';
import type { DenseTableColumn } from '@/shared/ui/DenseTable';

const standingsRowWireSchema = z.object({
  team_id: z.number(),
  team_name: z.string(),
  played: z.number().optional(),
  won: z.number().optional(),
  lost: z.number().optional(),
  tied: z.number().optional(),
  no_result: z.number().optional(),
  points: z.number().optional(),
  nrr: z.number().nullable().optional(),
});

const standingsGroupWireSchema = z.object({
  group_index: z.number(),
  group_name: z.string().optional(),
  standings: z.array(standingsRowWireSchema),
});

const standingsPayloadWireSchema = z.object({
  tournament_id: z.number().optional(),
  number_of_groups: z.number().optional(),
  standings: z.array(standingsRowWireSchema).optional(),
  groups: z.array(standingsGroupWireSchema).optional(),
});

export type StandingsRow = {
  teamId: number;
  teamName: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  noResult: number;
  points: number;
  nrr: number | null;
};

export type StandingsGroup = {
  groupIndex: number;
  groupName: string;
  standings: StandingsRow[];
};

export type TournamentStandings = {
  tournamentId: number;
  /** Flat table when the tournament has a single group (or no groups). */
  standings: StandingsRow[];
  /** Multi-group tournaments; empty when flat. */
  groups: StandingsGroup[];
};

export const STANDINGS_COLUMNS: DenseTableColumn[] = [
  { key: 'pos', label: '#', width: '22px' },
  { key: 'team', label: 'Team', width: 'minmax(0,1fr)' },
  { key: 'played', label: 'P', width: '26px', align: 'right', mono: true },
  { key: 'won', label: 'W', width: '26px', align: 'right', mono: true },
  { key: 'lost', label: 'L', width: '26px', align: 'right', mono: true },
  { key: 'points', label: 'Pts', width: '34px', align: 'right', mono: true, emphasis: 'primary' },
  { key: 'nrr', label: 'NRR', width: '46px', align: 'right', mono: true },
];

export const STANDINGS_COLUMNS_COMPACT: DenseTableColumn[] = [
  { key: 'pos', label: '#', width: '22px' },
  { key: 'team', label: 'Team', width: 'minmax(0,1fr)' },
  { key: 'played', label: 'P', width: '26px', align: 'right', mono: true },
  { key: 'won', label: 'W', width: '26px', align: 'right', mono: true },
  { key: 'nrr', label: 'NRR', width: '46px', align: 'right', mono: true },
];

function toRow(wire: z.infer<typeof standingsRowWireSchema>): StandingsRow {
  return {
    teamId: wire.team_id,
    teamName: wire.team_name,
    played: Number(wire.played ?? 0),
    won: Number(wire.won ?? 0),
    lost: Number(wire.lost ?? 0),
    tied: Number(wire.tied ?? 0),
    noResult: Number(wire.no_result ?? 0),
    points: Number(wire.points ?? 0),
    nrr: wire.nrr ?? null,
  };
}

export function formatNrr(nrr: number | null): string {
  if (nrr == null || !Number.isFinite(nrr)) return '—';
  const sign = nrr > 0 ? '+' : '';
  return `${sign}${nrr.toFixed(3)}`;
}

export function nrrToneClass(nrr: number | null): string {
  if (nrr == null || !Number.isFinite(nrr) || nrr === 0) return 'text-dim';
  return nrr > 0 ? 'text-positive' : 'text-danger-soft';
}

export function toTournamentStandings(wire: z.infer<typeof standingsPayloadWireSchema>): TournamentStandings {
  const groups = (wire.groups ?? []).map((g) => ({
    groupIndex: g.group_index,
    groupName: g.group_name?.trim() || `Group ${g.group_index}`,
    standings: g.standings.map(toRow),
  }));

  return {
    tournamentId: wire.tournament_id ?? 0,
    standings: (wire.standings ?? []).map(toRow),
    groups,
  };
}

export function parseTournamentStandings(raw: unknown): TournamentStandings {
  return toTournamentStandings(unwrapData(standingsPayloadWireSchema)(raw));
}

/** Group table for a match — prefer both sides, else either side, else flat. */

export function selectStandingsForMatch(
  data: TournamentStandings,
  homeTeamId: number | null,
  awayTeamId: number | null
): { groupName: string | null; rows: StandingsRow[] } {
  if (data.groups.length === 0) {
    return { groupName: null, rows: data.standings };
  }

  const ids = [homeTeamId, awayTeamId].filter((id): id is number => id != null && id > 0);

  const both = data.groups.find((g) => {
    const set = new Set(g.standings.map((r) => r.teamId));
    return ids.length >= 2 && ids.every((id) => set.has(id));
  });
  if (both) return { groupName: both.groupName, rows: both.standings };

  const either = data.groups.find((g) => {
    const set = new Set(g.standings.map((r) => r.teamId));
    return ids.some((id) => set.has(id));
  });
  if (either) return { groupName: either.groupName, rows: either.standings };

  const first = data.groups[0];
  return { groupName: first?.groupName ?? null, rows: first?.standings ?? [] };
}
