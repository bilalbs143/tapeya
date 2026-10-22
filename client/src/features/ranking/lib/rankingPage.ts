export const RANKING_HUB_TOP_LIMIT = 5;

export const RANKING_HUB_TABS = [
  { value: 'batters', label: 'Top Batters' },
  { value: 'bowlers', label: 'Top Bowlers' },
  { value: 'others', label: 'Others' },
] as const;

export type RankingHubTab = (typeof RANKING_HUB_TABS)[number]['value'];

export function isRankingHubTab(value: string): value is RankingHubTab {
  return RANKING_HUB_TABS.some((t) => t.value === value);
}

export function topRankingSlice<T>(rankings: T[] | undefined, limit = RANKING_HUB_TOP_LIMIT): T[] {
  return (rankings ?? []).slice(0, limit);
}

export const RANKING_HUB_EMPTY = {
  batting: 'No batting rankings yet for open tournaments.',
  bowling: 'No bowling rankings yet for open tournaments.',
  sixes: 'No sixes rankings yet for open tournaments.',
  fours: 'No fours rankings yet for open tournaments.',
} as const;
