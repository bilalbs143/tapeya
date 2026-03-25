import { baseApi } from './baseApi';

/**
 * Enum API – options for app forms (tournament, profile, etc.).
 * GET /enums is public; response shape: { data: { tournament_type, cricket_format, match_timings, batting_style, bowling_style, ... } }.
 */
export const enumApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEnums: builder.query({
      query: () => ({ url: '/enums' }),
      transformResponse: (response) => response?.data ?? {},
    }),
  }),
});

export const { useGetEnumsQuery } = enumApi;

export function usePlayerProfileEnums() {
  const { data: enums = {}, isLoading } = useGetEnumsQuery();
  return {
    battingStyleOptions: Array.isArray(enums.batting_style)
      ? enums.batting_style
      : [],
    bowlingStyleOptions: Array.isArray(enums.bowling_style)
      ? enums.bowling_style
      : [],
    playingRoleOptions: Array.isArray(enums.playing_role)
      ? enums.playing_role
      : [],
    isLoading,
  };
}

export function getBattingStyleLabel(value, options = []) {
  if (!value) return '—';
  const n = typeof value === 'string' ? value.toLowerCase() : value;
  const opt = (options || []).find((o) => o.value === n || o.value === value);
  return opt ? opt.label : value;
}

export function getBowlingStyleLabel(value, options = []) {
  if (!value) return '—';
  const n = typeof value === 'string' ? value.toLowerCase() : value;
  const opt = (options || []).find((o) => o.value === n || o.value === value);
  return opt ? opt.label : value;
}

export function getPlayingRoleLabel(value, options = []) {
  if (!value) return '—';
  const n = typeof value === 'string' ? value.toLowerCase() : value;
  const opt = (options || []).find((o) => o.value === n || o.value === value);
  return opt ? opt.label : value;
}
