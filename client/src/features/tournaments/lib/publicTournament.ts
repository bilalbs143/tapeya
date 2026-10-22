import { formatTournamentDateRange, type Tournament } from '../model/schemas';

export type PublicTournamentTab = 'live' | 'schedule' | 'table' | 'teams' | 'squads' | 'stats';

export const PUBLIC_TOURNAMENT_TABS: { value: PublicTournamentTab; label: string }[] = [
  { value: 'live', label: 'Live' },
  { value: 'schedule', label: 'Schedule' },
  { value: 'table', label: 'Table' },
  { value: 'teams', label: 'Teams' },
  { value: 'squads', label: 'Squads' },
  { value: 'stats', label: 'Stats' },
];

const TAB_VALUES: PublicTournamentTab[] = PUBLIC_TOURNAMENT_TABS.map((t) => t.value);

export function publicTournamentTabFromSearch(params: URLSearchParams): PublicTournamentTab {
  const raw = params.get('tab');
  if (raw === 'fixtures') return 'schedule';
  if (raw && TAB_VALUES.includes(raw as PublicTournamentTab)) return raw as PublicTournamentTab;
  return 'live';
}

export function publicTournamentPlaceLine(tournament: Pick<Tournament, 'startDate' | 'endDate' | 'city'>): string {
  const dates = formatTournamentDateRange(tournament.startDate, tournament.endDate);
  return [dates, tournament.city].filter(Boolean).join(' · ');
}

export function publicTournamentCountsLine(tournament: Pick<Tournament, 'teamsCount' | 'matchesCount'>): string {
  return [
    tournament.teamsCount > 0 ? `${tournament.teamsCount} teams` : null,
    tournament.matchesCount > 0 ? `${tournament.matchesCount} fixtures` : null,
  ]
    .filter(Boolean)
    .join(' · ');
}
