import { z } from 'zod';

import { unwrapList } from '@/shared/api/unwrap';

/** Wire — `GET /tournaments/:id/squad-occupancy`. */

export const squadOccupancyWireSchema = z.object({
  player_id: z.number(),
  player_name: z.string(),
  team_id: z.number(),
  team_name: z.string(),
});
export type SquadOccupancyWire = z.infer<typeof squadOccupancyWireSchema>;

export type SquadOccupancy = {
  playerId: number;
  playerName: string;
  teamId: number;
  teamName: string;
};

export function occupancyToDomain(wire: SquadOccupancyWire): SquadOccupancy {
  return {
    playerId: wire.player_id,
    playerName: wire.player_name,
    teamId: wire.team_id,
    teamName: wire.team_name,
  };
}

export function parseSquadOccupancy(raw: unknown): SquadOccupancy[] {
  return unwrapList(squadOccupancyWireSchema)(raw).map(occupancyToDomain);
}

export const SQUAD_XI = 11;
/** Soft roster cap in the editor UI — API accepts any length. */

export const SQUAD_CAP = 16;

export function shortTeamLabel(name: string): string {
  const parts = String(name).split(/\s+/).filter(Boolean);
  if (parts.length <= 2) return name;
  return parts.slice(0, 2).join(' ');
}

export function playerDisplayName(player: {
  name?: string | null | undefined;
  nickname?: string | null | undefined;
}): string {
  return player.name?.trim() || player.nickname?.trim() || 'Player';
}

export function playerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.charAt(0) ?? ''}${parts[1]?.charAt(0) ?? ''}`.toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase() || '?';
}
