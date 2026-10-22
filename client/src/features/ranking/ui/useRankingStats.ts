import { useNavigate } from 'react-router-dom';

import { useGetRankingsQuery } from '../api/rankingApi';
import { RANKING_CRICKET_FORMAT, RANKING_TOURNAMENT_TYPE } from '../lib/constants';
import { rankingQueryForStatType, rankingStatTitle, resolveRankingStatsParam } from '../lib/rankingStats';
import { buildStatsTotalRows, statsTotalColumns } from '../model/schemas';
import { rankingRoutes } from '../routes';

/** Full ranking table query for one stats category. */
export function useRankingStats(rawType: string | undefined) {
  const navigate = useNavigate();
  const { valid, statType } = resolveRankingStatsParam(rawType);
  const query = rankingQueryForStatType(statType);

  const { data, isLoading, isError, refetch } = useGetRankingsQuery(
    {
      tournamentType: RANKING_TOURNAMENT_TYPE,
      cricketFormat: RANKING_CRICKET_FORMAT,
      category: query.category,
      sort: query.sort,
    },
    { skip: !valid }
  );

  const rows = buildStatsTotalRows(statType, data?.rankings ?? []);
  const columns = statsTotalColumns(statType);
  const subtitle = rankingStatTitle(statType);

  function goList() {
    navigate(rankingRoutes.list());
  }

  return {
    valid,
    statType,
    subtitle,
    rows,
    columns,
    isLoading,
    isError,
    refetch,
    goList,
  };
}
