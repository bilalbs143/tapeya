export type ScorecardHubTournamentFilter = number | 'all';

export function filterScorecardHubMatches<T extends { tournamentId: number }>(
  matches: T[] | undefined,
  tournamentId: ScorecardHubTournamentFilter
): T[] {
  const list = matches ?? [];
  if (tournamentId === 'all') return list;
  return list.filter((m) => m.tournamentId === tournamentId);
}

export function scorecardHubShowsTournamentChips(tournamentCount: number): boolean {
  return tournamentCount > 1;
}
