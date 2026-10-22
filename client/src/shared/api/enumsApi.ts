import { baseApi } from '@/shared/api/baseApi';
import { unwrapData } from '@/shared/api/unwrap';
import {
  dismissalOptions,
  enumOptions,
  type EnumsMap,
  enumsWireSchema,
  resolvedExtraTypes,
} from '@/shared/model/enums';

/** Public `GET /enums` — prefetch at boot; long cache (changes on deploy). */
export const enumsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- RTK Query no-arg query
    getEnums: builder.query<EnumsMap, void>({
      query: () => '/enums',
      transformResponse: unwrapData(enumsWireSchema),
      keepUnusedDataFor: 60 * 60,
      providesTags: ['Enums'],
    }),
  }),
});

export const { useGetEnumsQuery, useLazyGetEnumsQuery } = enumsApi;

export function usePlayerProfileEnums() {
  const { data: enums, isLoading, isError, refetch } = useGetEnumsQuery();
  return {
    playingRoleOptions: enumOptions(enums, 'playing_role'),
    battingStyleOptions: enumOptions(enums, 'batting_style'),
    bowlingStyleOptions: enumOptions(enums, 'bowling_style'),
    isLoading,
    isError,
    refetch,
  };
}

export function useCricketFormatOptions() {
  const { data: enums, isLoading, isError, refetch } = useGetEnumsQuery();
  return {
    options: enumOptions(enums, 'cricket_format'),
    isLoading,
    isError,
    refetch,
  };
}

export function useDismissalOptions() {
  const { data: enums, isLoading, isError, refetch } = useGetEnumsQuery();
  return {
    options: dismissalOptions(enums),
    enums,
    isLoading,
    isError,
    refetch,
  };
}

export function useStatsBucketOptions() {
  const { data: enums, isLoading, isError, refetch } = useGetEnumsQuery();
  return {
    options: enumOptions(enums, 'stats_bucket'),
    isLoading,
    isError,
    refetch,
  };
}

export function useTournamentTypeOptions() {
  const { data: enums, isLoading, isError, refetch } = useGetEnumsQuery();
  return {
    options: enumOptions(enums, 'tournament_type'),
    isLoading,
    isError,
    refetch,
  };
}

export function useMatchOversOptions() {
  const { data: enums, isLoading, isError, refetch } = useGetEnumsQuery();
  return {
    options: enumOptions(enums, 'match_overs'),
    isLoading,
    isError,
    refetch,
  };
}

export function usePlayersPerSideOptions() {
  const { data: enums, isLoading, isError, refetch } = useGetEnumsQuery();
  return {
    options: enumOptions(enums, 'players_per_side'),
    isLoading,
    isError,
    refetch,
  };
}

export function useExtraTypeOptions() {
  const { data: enums, isLoading, isError, refetch } = useGetEnumsQuery();
  return {
    options: resolvedExtraTypes(enums),
    isLoading,
    isError,
    refetch,
  };
}

export function useTossChoiceOptions() {
  const { data: enums, isLoading, isError, refetch } = useGetEnumsQuery();
  return {
    options: enumOptions(enums, 'toss_choice'),
    isLoading,
    isError,
    refetch,
  };
}

export function useNoBallOptions() {
  const { data: enums, isLoading, isError, refetch } = useGetEnumsQuery();
  return {
    typeOptions: enumOptions(enums, 'no_ball_type'),
    runsTypeOptions: enumOptions(enums, 'no_ball_runs_type'),
    isLoading,
    isError,
    refetch,
  };
}

export function useStreamOrientationOptions() {
  const { data: enums, isLoading, isError, refetch } = useGetEnumsQuery();
  const list = enums?.stream_orientation ?? [];
  return {
    options: list,
    isLoading,
    isError,
    refetch,
  };
}
