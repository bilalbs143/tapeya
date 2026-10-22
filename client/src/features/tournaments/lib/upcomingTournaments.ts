import { isUpcomingTournament, type Tournament } from '../model/schemas';

export function sortUpcomingTournaments<T extends Pick<Tournament, 'endDate' | 'startDate'>>(items: T[]): T[] {
  return items
    .filter(isUpcomingTournament)
    .sort((a, b) => String(a.startDate ?? '').localeCompare(String(b.startDate ?? '')));
}

export function upcomingTournamentPlace(city: string | null | undefined, country: string | null | undefined): string {
  return [city, country].filter(Boolean).join(', ');
}

export function upcomingTournamentFixturesLine(matchesCount: number): string | null {
  return matchesCount > 0 ? `${matchesCount} fixtures — tap for schedule` : null;
}
