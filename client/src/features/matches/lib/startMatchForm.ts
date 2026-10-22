import type { Tournament } from '@/features/tournaments';

export type StartMatchPickSlot = 'home' | 'away' | null;
export type StartMatchBusy = 'start' | 'save' | null;
/** `knockout` = no group_index; otherwise 1-based group (legacy StartMatch). */
export type StartMatchGroupKey = 'knockout' | `${number}`;

export const START_MATCH_THUMB_ACCEPT = 'image/jpeg,image/png,image/webp';
export const START_MATCH_THUMB_MAX_MB = 5;
export const START_MATCH_DEFAULT_OVERS = 6;
export const START_MATCH_DEFAULT_PLAYERS = 11;
export const START_MATCH_OVERS_MIN = 1;
export const START_MATCH_OVERS_MAX = 255;
export const START_MATCH_PLAYERS_MIN = 2;
export const START_MATCH_PLAYERS_MAX = 20;

export function startMatchTodayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

type StartMatchTournamentFilter = Pick<Tournament, 'hubSection' | 'teamsCount'>;

/** Organizer hubs with enough teams for a fixture. */
export function filterStartMatchTournaments<T extends StartMatchTournamentFilter>(items: T[]): T[] {
  return items.filter((t) => t.hubSection === 'needsYou' && t.teamsCount >= 2);
}

export function startMatchGroupIndex(key: StartMatchGroupKey): number | null {
  return key !== 'knockout' && Number(key) > 0 ? Number(key) : null;
}
