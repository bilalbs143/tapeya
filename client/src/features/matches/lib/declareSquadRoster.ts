import type { XiPlayer } from '../model/scoringSession';
import type { DeclareSquadPlayer, TeamSquadPlayer } from '../model/squadSchemas';

export type DeclareSquadSideKey = 'home' | 'away';

export type DeclareSquadSideState = Record<DeclareSquadSideKey, DeclareSquadPlayer[]>;

export const EMPTY_DECLARE_SQUAD_SIDES: DeclareSquadSideState = { home: [], away: [] };

/** Seed local draft from team pool + announced match squad + live XI. */
export function buildInitialRoster(input: {
  pool: TeamSquadPlayer[];
  matchIds: number[];
  xi: XiPlayer[];
  captainId: number | null;
  keeperId: number | null;
}): DeclareSquadPlayer[] {
  const byId = new Map<number, TeamSquadPlayer>();
  for (const p of input.pool) byId.set(p.id, p);
  for (const p of input.xi) {
    if (!byId.has(p.id)) byId.set(p.id, { id: p.id, name: p.name, role: null, hand: null });
  }

  const xiIds = new Set(input.xi.map((p) => p.id));
  const orderedIds = input.matchIds.length > 0 ? input.matchIds : input.xi.length > 0 ? input.xi.map((p) => p.id) : [];

  return orderedIds
    .map((id) => {
      const base = byId.get(id);
      if (!base) return null;
      const playing = xiIds.size === 0 ? true : xiIds.has(id);
      return {
        id: base.id,
        name: base.name,
        role: base.role,
        hand: base.hand,
        captain: input.captainId === id,
        keeper: input.keeperId === id,
        playing,
      } satisfies DeclareSquadPlayer;
    })
    .filter((p): p is DeclareSquadPlayer => p != null);
}
