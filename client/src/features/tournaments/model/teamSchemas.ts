import { z } from 'zod';

/** Wire — `TeamResource` (list, search, create). */

export const tournamentTeamWireSchema = z.object({
  id: z.number(),
  name: z.string(),
  logo: z.string().nullable().optional(),
  code: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  sponsor: z.string().nullable().optional(),
  icon_players: z.string().nullable().optional(),
  group_index: z.number().nullable().optional(),
});
export type TournamentTeamWire = z.infer<typeof tournamentTeamWireSchema>;

export type TournamentTeam = {
  id: number;
  name: string;
  logo: string | null;
  code: string | null;
  country: string | null;
  city: string | null;
  sponsor: string | null;
  iconPlayers: string | null;
  groupIndex: number | null;
};

export function teamToDomain(wire: TournamentTeamWire): TournamentTeam {
  return {
    id: wire.id,
    name: wire.name,
    logo: wire.logo ?? null,
    code: wire.code ?? null,
    country: wire.country ?? null,
    city: wire.city ?? null,
    sponsor: wire.sponsor ?? null,
    iconPlayers: wire.icon_players ?? null,
    groupIndex: wire.group_index ?? null,
  };
}

export function teamCrest(team: Pick<TournamentTeam, 'code' | 'name'>): string {
  if (team.code?.trim()) return team.code.trim().slice(0, 3).toUpperCase();
  return team.name.trim().slice(0, 3).toUpperCase() || 'TM';
}

/** Create body — POST /teams (logo via POST /media/team/{id}/logo after create). */

export const createTeamInputSchema = z.object({
  name: z.string().trim().min(1, 'Team name is required').max(255),
  code: z.string().trim().min(1, 'Team code is required').max(20),
  country: z.string().trim().min(1, 'Country is required').max(100),
  city: z.string().trim().min(1, 'City is required').max(100),
  sponsor: z.string().trim().max(500).optional(),
  iconPlayers: z.string().trim().max(500).optional(),
});
export type CreateTeamInput = z.infer<typeof createTeamInputSchema>;

export function createTeamToWire(input: CreateTeamInput): Record<string, string | null> {
  return {
    name: input.name.trim(),
    code: input.code.trim().toUpperCase(),
    country: input.country.trim(),
    city: input.city.trim(),
    sponsor: input.sponsor?.trim() ? input.sponsor.trim() : null,
    icon_players: input.iconPlayers?.trim() ? input.iconPlayers.trim() : null,
  };
}

export function canAddTournamentTeams(teamCap: number | null | undefined, teamsCount: number): boolean {
  if (teamCap == null) return true;
  return teamsCount < teamCap;
}

export function teamsComplete(teamCap: number | null | undefined, teamsCount: number): boolean {
  if (teamCap == null) return false;
  return teamsCount >= teamCap;
}
