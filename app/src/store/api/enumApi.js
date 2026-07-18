import { baseApi } from './baseApi';

/**
 * Enum API – options for app forms (tournament, profile, go-live, etc.).
 * GET /enums is public; response shape: { data: { tournament_type, stream_orientation, ... } }.
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

/** @param {object|undefined} enums — GET /enums payload */
export function getStreamOrientationOptions(enums) {
  return Array.isArray(enums?.stream_orientation) ? enums.stream_orientation : [];
}

/**
 * Full-width radio rows from GET /enums → stream_orientation, with the hint appended
 * to the label (e.g. "Portrait · 9:16 — hold your phone upright").
 * @param {Array<{ value: string, label: string, hint?: string }>} [options]
 */
export function toGoLiveOrientationPickerOptions(options = []) {
  return (Array.isArray(options) ? options : []).map((opt) => ({
    value: opt.value,
    label: opt.hint ? `${opt.label} — ${opt.hint}` : opt.label,
  }));
}

/** Same pattern as getPlayingRoleLabel — label comes from GET /enums options. */
export function getStreamOrientationLabel(value, options = []) {
  if (!value) return '—';
  const opt = (options || []).find((o) => o.value === value);
  return opt ? opt.label : value;
}

export function usePlayerProfileEnums() {
  const { data: enums = {}, isLoading } = useGetEnumsQuery();
  return {
    battingStyleOptions: Array.isArray(enums.batting_style) ? enums.batting_style : [],
    bowlingStyleOptions: Array.isArray(enums.bowling_style) ? enums.bowling_style : [],
    playingRoleOptions: Array.isArray(enums.playing_role) ? enums.playing_role : [],
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
