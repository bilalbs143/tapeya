import { describe, expect, it } from 'vitest';

import {
  dismissalRequiresFielder,
  dismissalsForFreeHit,
  enumLabel,
  enumOptions,
  enumsWireSchema,
  FALLBACK_EXTRA_TYPES,
  resolvedExtraTypes,
  statsBucketOptions,
} from './enums';

const sample = enumsWireSchema.parse({
  playing_role: [
    { value: 'batsman', label: 'Batsman' },
    { value: 'bowler', label: 'Bowler' },
  ],
  cricket_format: [{ value: 'tape_ball', label: 'Tape Ball' }],
  stats_bucket: [{ value: 'quick', label: 'Quick' }],
  dismissal_type: [
    {
      value: 'caught',
      label: 'Caught',
      requires_fielder: true,
      valid_on_free_hit: false,
      counts_as_wicket: true,
      counts_as_bowler_wicket: true,
    },
    {
      value: 'run_out',
      label: 'Run Out',
      requires_fielder: true,
      valid_on_free_hit: true,
      counts_as_wicket: true,
      counts_as_bowler_wicket: false,
    },
    {
      value: 'bowled',
      label: 'Bowled',
      requires_fielder: false,
      valid_on_free_hit: false,
      counts_as_wicket: true,
      counts_as_bowler_wicket: true,
    },
  ],
});

describe('enums helpers', () => {
  it('reads option lists and labels', () => {
    expect(enumOptions(sample, 'playing_role')).toHaveLength(2);
    expect(enumLabel(sample, 'cricket_format', 'tape_ball')).toBe('Tape Ball');
    expect(enumLabel(sample, 'playing_role', null)).toBe('—');
  });

  it('uses dismissal metadata with a fallback set', () => {
    expect(dismissalRequiresFielder('caught', sample, new Set())).toBe(true);
    expect(dismissalRequiresFielder('bowled', sample, new Set())).toBe(false);
    expect(dismissalRequiresFielder('mankad', undefined, new Set(['mankad']))).toBe(true);
  });

  it('filters free-hit dismissals and prepends all for stats buckets', () => {
    expect(dismissalsForFreeHit(sample).map((o) => o.value)).toEqual(['run_out']);
    expect(statsBucketOptions(sample).map((o) => o.value)).toEqual(['all', 'quick']);
  });

  it('resolves extra types from the API with a pad fallback', () => {
    const withExtras = enumsWireSchema.parse({
      ...sample,
      extra_type: [{ value: 'wd', label: 'Wide', short_label: 'WD' }],
    });
    expect(resolvedExtraTypes(withExtras).map((o) => o.value)).toEqual(['wd']);
    expect(resolvedExtraTypes(undefined)).toEqual(FALLBACK_EXTRA_TYPES);
  });
});
