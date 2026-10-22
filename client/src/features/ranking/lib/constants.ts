/** Product scope for public leaderboards (matches `app/` ranking constants). */

export const RANKING_TOURNAMENT_TYPE = 'open_tournament' as const;
export const RANKING_CRICKET_FORMAT = 'all' as const;

export const RANKING_STAT_TYPES = ['run-scorers', 'wicket-takers', 'sixes', 'fours'] as const;
export type RankingStatType = (typeof RANKING_STAT_TYPES)[number];

export function isRankingStatType(value: string | undefined): value is RankingStatType {
  return RANKING_STAT_TYPES.includes(value as RankingStatType);
}

/** Map hub “View More” stat type → GET /rankings category + sort. */

export function rankingQueryForStatType(statType: RankingStatType): {
  category: 'batting' | 'bowling';
  sort: string;
} {
  switch (statType) {
    case 'wicket-takers':
      return { category: 'bowling', sort: 'wickets' };
    case 'sixes':
      return { category: 'batting', sort: 'sixes' };
    case 'fours':
      return { category: 'batting', sort: 'fours' };
    default:
      return { category: 'batting', sort: 'runs' };
  }
}

export function rankingStatTitle(statType: RankingStatType): string {
  switch (statType) {
    case 'wicket-takers':
      return 'Top Wicket Takers';
    case 'sixes':
      return 'Most Sixes';
    case 'fours':
      return 'Most Fours';
    default:
      return 'Top Run Scorers';
  }
}
