import { z } from 'zod';

/** Wire shape — faithful to `TournamentResource`. UI never consumes this type; `toDomain` is the only bridge (§7.7). */

export const tournamentWireSchema = z.object({
  id: z.number(),
  tournament_name: z.string(),
  short_name: z.string().nullable(),
  tournament_type: z.enum(['open_tournament', 'private_tournament']),
  city: z.string().nullable(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  cover_image: z.string().nullable().optional(),
  display_image: z.string().nullable().optional(),
  teams_count: z.number(),
  matches_count: z.number(),
  can_manage: z.boolean().optional(),
  status: z.string().nullable().optional(),
  status_label: z.string().nullable().optional(),
  venue_name: z.string().nullable().optional(),
  prize: z.string().nullable().optional(),
  number_of_teams: z.number().nullable().optional(),
  number_of_groups: z.number().nullable().optional(),
  country: z.string().nullable().optional(),
  champion: z.string().nullable().optional(),
  likes_count: z.number().optional(),
  dislikes_count: z.number().optional(),
  shares_count: z.number().optional(),
  my_reaction: z.enum(['like', 'dislike']).nullable().optional(),
  interest_campaign_slug: z.string().nullable().optional(),
});
export type TournamentWire = z.infer<typeof tournamentWireSchema>;

export type TournamentType = TournamentWire['tournament_type'];
export type TournamentReaction = 'like' | 'dislike';

export type TournamentHubSection = 'needsYou' | 'previous';

export type Tournament = {
  id: number;
  name: string;
  shortName: string | null;
  type: TournamentType;
  city: string | null;
  startDate: string | null;
  endDate: string | null;
  coverImage: string | null;
  teamsCount: number;
  matchesCount: number;
  teamCap: number | null;
  groupCount: number | null;
  country: string | null;
  canManage?: boolean;
  status: string | null;
  statusLabel: string | null;
  venueName: string | null;
  prize: string | null;
  champion: string | null;
  hubSection: TournamentHubSection;
  likesCount: number;
  dislikesCount: number;
  sharesCount: number;
  myReaction: TournamentReaction | null;
  interestCampaignSlug: string | null;
};

function endDatePassed(endDate: string | null): boolean {
  if (!endDate) return false;
  const end = new Date(`${endDate}T23:59:59`);
  if (Number.isNaN(end.getTime())) return false;
  return end.getTime() < Date.now();
}

/** API `StatusEnum` is active|inactive. Past end dates land in Previous No review queue — create opens the workspace. */

export function tournamentHubSection(status: string | null | undefined, endDate?: string | null): TournamentHubSection {
  if (status === 'inactive' || status === 'previous') return 'previous';
  if (endDatePassed(endDate ?? null)) return 'previous';
  return 'needsYou';
}

export function tournamentCrest(tournament: Pick<Tournament, 'shortName' | 'name'>): string {
  if (tournament.shortName?.trim()) return tournament.shortName.trim().slice(0, 3).toUpperCase();
  const parts = tournament.name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.charAt(0) ?? ''}${parts[1]?.charAt(0) ?? ''}`.toUpperCase();
  }
  return tournament.name.trim().slice(0, 2).toUpperCase() || 'T';
}

export function tournamentMetaLine(tournament: Tournament): string {
  const type =
    tournament.type === 'open_tournament' ? 'Open' : tournament.type === 'private_tournament' ? 'Private' : null;
  const groups = tournament.groupCount != null && tournament.groupCount > 1 ? `Groups: ${tournament.groupCount}` : null;
  return [type, groups, tournament.city].filter(Boolean).join(' · ') || 'Tournament';
}

export function toDomain(wire: TournamentWire): Tournament {
  const status = wire.status ?? null;
  const endDate = wire.end_date ?? null;
  return {
    id: wire.id,
    name: wire.tournament_name,
    shortName: wire.short_name,
    type: wire.tournament_type,
    city: wire.city,
    startDate: wire.start_date,
    endDate,
    coverImage: wire.cover_image ?? wire.display_image ?? null,
    teamsCount: wire.teams_count,
    matchesCount: wire.matches_count,
    teamCap: wire.number_of_teams ?? null,
    groupCount: wire.number_of_groups ?? null,
    country: wire.country ?? null,
    ...(wire.can_manage !== undefined ? { canManage: wire.can_manage } : {}),
    status,
    statusLabel: wire.status_label ?? null,
    venueName: wire.venue_name ?? null,
    prize: wire.prize ?? null,
    champion: wire.champion ?? null,
    hubSection: tournamentHubSection(status, endDate),
    likesCount: wire.likes_count ?? 0,
    dislikesCount: wire.dislikes_count ?? 0,
    sharesCount: wire.shares_count ?? 0,
    myReaction: wire.my_reaction ?? null,
    interestCampaignSlug: wire.interest_campaign_slug ?? null,
  };
}

export function isUpcomingTournament(t: Pick<Tournament, 'endDate'>): boolean {
  if (!t.endDate) return true;
  const end = new Date(`${t.endDate}T23:59:59`);
  if (Number.isNaN(end.getTime())) return true;
  return end.getTime() >= Date.now();
}

export function formatTournamentDateRange(startDate: string | null, endDate: string | null): string {
  const fmt = (iso: string) => {
    const d = new Date(`${iso}T12:00:00`);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };
  if (startDate && endDate) return `${fmt(startDate)} – ${fmt(endDate)}`;
  if (startDate) return fmt(startDate);
  if (endDate) return `Until ${fmt(endDate)}`;
  return 'Dates TBA';
}

/** Create payload — matches StoreUserTournamentRequest / legacy create. */

export const createTournamentInputSchema = z
  .object({
    name: z.string().min(1, 'Tournament name is required').max(60),
    shortName: z.string().min(1, 'Short name is required').max(64),
    city: z.string().min(1, 'City is required').max(100),
    country: z.string().min(1, 'Country is required').max(100),
    venueName: z.string().min(1, 'Venue is required').max(255),
    numberOfTeams: z.number().int().min(2).max(500),
    type: z.enum(['open_tournament', 'private_tournament']),
    structure: z.enum(['single', 'groups']),
    groupCount: z.number().int().min(2).max(16).optional(),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    prize: z.string().max(255).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.structure === 'groups' && (data.groupCount == null || data.groupCount < 2)) {
      ctx.addIssue({
        code: 'custom',
        path: ['groupCount'],
        message: 'Pick how many groups (2–16).',
      });
    }
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: "End date can't be before the start.",
      });
    }
  });

export type CreateTournamentInput = z.infer<typeof createTournamentInputSchema>;

export function toWireBody(input: CreateTournamentInput) {
  const prize = input.prize?.trim();
  return {
    tournament_name: input.name.trim(),
    short_name: input.shortName.trim(),
    city: input.city.trim(),
    country: input.country.trim(),
    venue_name: input.venueName.trim(),
    number_of_teams: input.numberOfTeams,
    tournament_type: input.type,
    start_date: input.startDate,
    end_date: input.endDate,
    ...(prize ? { prize: prize.startsWith('PKR') ? prize : `PKR ${prize}` } : {}),
    ...(input.structure === 'groups' && input.groupCount != null
      ? { number_of_groups: input.groupCount }
      : { number_of_groups: 1 }),
  };
}
