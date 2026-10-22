import { isRankingStatType, type RankingStatType } from './constants';

export type { RankingStatType };
export { rankingQueryForStatType, rankingStatTitle } from './constants';

export function resolveRankingStatsParam(rawType: string | undefined): {
  valid: boolean;
  statType: RankingStatType;
} {
  const valid = isRankingStatType(rawType);
  return { valid, statType: valid ? rawType : 'run-scorers' };
}
