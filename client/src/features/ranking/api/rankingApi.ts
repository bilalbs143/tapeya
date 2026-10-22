import { baseApi } from '@/shared/api/baseApi';
import { unwrapData } from '@/shared/api/unwrap';

import { RANKING_CRICKET_FORMAT, RANKING_TOURNAMENT_TYPE } from '../lib/constants';
import { type RankingsPayload, rankingsPayloadWireSchema, toRankingsPayload } from '../model/schemas';

export type GetRankingsArg = {
  category?: 'batting' | 'bowling' | 'fielding' | undefined;
  sort?: string | undefined;
  tournamentType?: string | undefined;
  cricketFormat?: string | undefined;
  minInnings?: number | undefined;
};

function mapRankings(raw: unknown): RankingsPayload {
  return toRankingsPayload(unwrapData(rankingsPayloadWireSchema)(raw));
}

export const rankingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRankings: builder.query<RankingsPayload, GetRankingsArg>({
      query: (arg = {}) => ({
        url: '/rankings',
        params: {
          tournament_type: arg.tournamentType ?? RANKING_TOURNAMENT_TYPE,
          cricket_format: arg.cricketFormat ?? RANKING_CRICKET_FORMAT,
          category: arg.category ?? 'batting',
          ...(arg.sort ? { sort: arg.sort } : {}),
          ...(arg.minInnings != null ? { min_innings: arg.minInnings } : {}),
        },
      }),
      transformResponse: mapRankings,
    }),
  }),
});

export const { useGetRankingsQuery } = rankingApi;
