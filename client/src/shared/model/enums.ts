import { z } from 'zod';

/** `GET /enums` wire shapes — extra keys allowed; unknown options fall back to `{ value, label }`. */

export const enumOptionSchema = z.object({
  value: z.union([z.string(), z.number()]).transform(String),
  label: z.string(),
});
export type EnumOption = z.infer<typeof enumOptionSchema>;

export const dismissalOptionSchema = enumOptionSchema.extend({
  requires_fielder: z.boolean(),
  valid_on_free_hit: z.boolean(),
  counts_as_wicket: z.boolean(),
  counts_as_bowler_wicket: z.boolean(),
});
export type DismissalOption = z.infer<typeof dismissalOptionSchema>;

export const extraTypeOptionSchema = enumOptionSchema.extend({
  short_label: z.string(),
});
export type ExtraTypeOption = z.infer<typeof extraTypeOptionSchema>;

export const overthrowDeliveryOptionSchema = enumOptionSchema.extend({
  valid_for_dismissal_delivery_context: z.boolean(),
});
export type OverthrowDeliveryOption = z.infer<typeof overthrowDeliveryOptionSchema>;

export const streamOrientationOptionSchema = enumOptionSchema.extend({
  hint: z.string(),
});
export type StreamOrientationOption = z.infer<typeof streamOrientationOptionSchema>;

const optionList = z.array(enumOptionSchema);
const dismissalList = z.array(dismissalOptionSchema);
const extraList = z.array(extraTypeOptionSchema);
const overthrowList = z.array(overthrowDeliveryOptionSchema);
const streamList = z.array(streamOrientationOptionSchema);

/** Known keys from EnumController — each optional so the client survives older/newer API. */
export const enumsWireSchema = z
  .object({
    tournament_type: optionList.optional(),
    stats_bucket: optionList.optional(),
    group_mode: optionList.optional(),
    cricket_format: optionList.optional(),
    stat_category: optionList.optional(),
    shot_position: optionList.optional(),
    toss_choice: optionList.optional(),
    dismissal_type: dismissalList.optional(),
    extra_type: extraList.optional(),
    no_ball_type: optionList.optional(),
    no_ball_runs_type: optionList.optional(),
    overthrow_delivery_type: overthrowList.optional(),
    penalty_team: optionList.optional(),
    penalty_reason: optionList.optional(),
    innings_end_reason: optionList.optional(),
    match_end_reason: optionList.optional(),
    match_break_type: optionList.optional(),
    match_overs: optionList.optional(),
    players_per_side: optionList.optional(),
    batting_style: optionList.optional(),
    bowling_style: optionList.optional(),
    playing_role: optionList.optional(),
    stream_orientation: streamList.optional(),
    tournament_interest_campaign_status: optionList.optional(),
    tournament_interest_submission_status: optionList.optional(),
  })
  .passthrough();

export type EnumsMap = z.infer<typeof enumsWireSchema>;

export type EnumKey = keyof EnumsMap;

export function enumOptions(enums: EnumsMap | undefined, key: EnumKey): EnumOption[] {
  const list = enums?.[key];
  return Array.isArray(list) ? (list as EnumOption[]) : [];
}

export function enumLabel(enums: EnumsMap | undefined, key: EnumKey, value: string | null | undefined): string {
  if (value == null || value === '') return '—';
  const hit = enumOptions(enums, key).find((o) => o.value === value || o.value === value.toLowerCase());
  return hit?.label ?? value;
}

export function enumValues(enums: EnumsMap | undefined, key: EnumKey): string[] {
  return enumOptions(enums, key).map((o) => o.value);
}

export function dismissalOptions(enums: EnumsMap | undefined): DismissalOption[] {
  const list = enums?.dismissal_type;
  return Array.isArray(list) ? list : [];
}

export function extraTypeOptions(enums: EnumsMap | undefined): ExtraTypeOption[] {
  const list = enums?.extra_type;
  return Array.isArray(list) ? list : [];
}

/** Offline / empty-cache fallback matching ExtraTypeEnum. */
export const FALLBACK_EXTRA_TYPES: ExtraTypeOption[] = [
  { value: 'wd', label: 'Wide', short_label: 'WD' },
  { value: 'nb', label: 'No Ball', short_label: 'NB' },
  { value: 'bye', label: 'Bye', short_label: 'BYE' },
  { value: 'lb', label: 'Leg Bye', short_label: 'LB' },
];

export function resolvedExtraTypes(enums: EnumsMap | undefined): ExtraTypeOption[] {
  const list = extraTypeOptions(enums);
  return list.length > 0 ? list : FALLBACK_EXTRA_TYPES;
}

export function dismissalRequiresFielder(
  type: string,
  enums: EnumsMap | undefined,
  fallback: ReadonlySet<string>
): boolean {
  const hit = dismissalOptions(enums).find((o) => o.value === type);
  if (hit) return hit.requires_fielder;
  return fallback.has(type);
}

export function dismissalsForFreeHit(enums: EnumsMap | undefined): DismissalOption[] {
  return dismissalOptions(enums).filter((o) => o.valid_on_free_hit);
}

/** Stats filter: API buckets plus an app-only `all`. */
export function statsBucketOptions(enums: EnumsMap | undefined): EnumOption[] {
  return [{ value: 'all', label: 'All' }, ...enumOptions(enums, 'stats_bucket')];
}
