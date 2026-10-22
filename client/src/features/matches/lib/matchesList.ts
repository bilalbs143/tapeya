export function matchesListScorerFirstName(
  nickname: string | null | undefined,
  name: string | null | undefined
): string {
  return (nickname || name || 'You').split(/\s+/)[0] ?? 'You';
}

export function matchesListSubtitle(scorerFirstName: string): string {
  return `Scoring as ${scorerFirstName}`;
}

export function filterSectionedMatches<T extends { section: unknown }>(items: T[] | undefined): T[] {
  return (items ?? []).filter((m) => m.section != null);
}
