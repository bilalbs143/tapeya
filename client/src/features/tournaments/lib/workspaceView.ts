import type { SquadOccupancy } from '../model/squadSchemas';
import { SQUAD_XI } from '../model/squadSchemas';
import type { TournamentTeam } from '../model/teamSchemas';

export type WorkspaceStageTone = 'locked' | 'active' | 'progress' | 'done';

/** 1-based group index → “Group A”. */

export function groupName(groupIndex: number): string {
  return `Group ${String.fromCharCode(64 + groupIndex)}`;
}

export function iconPlayerCount(iconPlayers: string | null | undefined): number {
  if (!iconPlayers?.trim()) return 0;
  return iconPlayers
    .split(/[,;/|]/)
    .map((s) => s.trim())
    .filter(Boolean).length;
}

export function squadCountsByTeam(occupancy: SquadOccupancy[]): Map<number, number> {
  const map = new Map<number, number>();
  for (const row of occupancy) {
    map.set(row.teamId, (map.get(row.teamId) ?? 0) + 1);
  }
  return map;
}

export function squadState(squadSize: number): { label: string; tone: 'empty' | 'short' | 'ready' } {
  if (!squadSize) return { label: 'No squad', tone: 'empty' };
  if (squadSize < SQUAD_XI) return { label: `Needs ${SQUAD_XI - squadSize}`, tone: 'short' };
  return { label: `${squadSize} players`, tone: 'ready' };
}

export function squadsReadyCount(teams: TournamentTeam[], counts: Map<number, number>): number {
  return teams.filter((t) => (counts.get(t.id) ?? 0) >= SQUAD_XI).length;
}

export function stageTone(
  key: 'teams' | 'squads' | 'fixtures',
  {
    teamsCount,
    atCap,
    ready,
    fixtures,
  }: {
    teamsCount: number;
    atCap: boolean;
    ready: number;
    fixtures: number;
  }
): WorkspaceStageTone {
  if (key === 'teams') {
    if (!teamsCount) return 'active';
    return 'done';
  }
  if (key === 'squads') {
    if (!teamsCount) return 'locked';
    if (!atCap) return 'active';
    if (fixtures > 0 && ready === teamsCount) return 'done';
    if (atCap && !fixtures) return ready === teamsCount ? 'done' : 'progress';
    return ready === teamsCount ? 'done' : 'active';
  }
  if (!teamsCount || !atCap) return 'locked';
  if (fixtures > 0) return 'done';
  return 'active';
}

export function teamsInGroup(teams: TournamentTeam[], groupIndex: number): TournamentTeam[] {
  return teams.filter((t) => (t.groupIndex ?? 1) === groupIndex);
}

export type WorkspaceStage = {
  key: 'teams' | 'squads' | 'fixtures';
  label: string;
  value: string;
  tone: WorkspaceStageTone;
};

export function buildWorkspaceStages(opts: {
  teamsCount: number;
  teamCap: number | null;
  atCap: boolean;
  ready: number;
  fixtures: number;
}): WorkspaceStage[] {
  const { teamsCount, teamCap, atCap, ready, fixtures } = opts;
  const toneArgs = { teamsCount, atCap, ready, fixtures };
  return [
    {
      key: 'teams',
      label: '1 · Teams',
      value: teamCap != null ? `${teamsCount} / ${teamCap}` : String(teamsCount),
      tone: stageTone('teams', toneArgs),
    },
    {
      key: 'squads',
      label: '2 · Squads',
      value: teamsCount ? `${ready} / ${teamsCount}` : '—',
      tone: stageTone('squads', toneArgs),
    },
    {
      key: 'fixtures',
      label: '3 · Fixtures',
      value: teamsCount ? String(fixtures) : '—',
      tone: stageTone('fixtures', toneArgs),
    },
  ];
}

export type NeediestGroup = { g: number; n: number; left: number };

/** Group with the most open slots (for “add team” default). */
export function findNeediestGroup(
  teams: TournamentTeam[],
  groupCount: number,
  groupCap: number,
  hasGroups: boolean,
  teamCap: number | null
): NeediestGroup | null {
  if (!hasGroups || teamCap == null) return null;
  return (
    Array.from({ length: groupCount }, (_, i) => i + 1)
      .map((g) => {
        const n = teamsInGroup(teams, g).length;
        return { g, n, left: groupCap - n };
      })
      .filter((x) => x.left > 0)
      .sort((a, b) => b.left - a.left)[0] ?? null
  );
}
