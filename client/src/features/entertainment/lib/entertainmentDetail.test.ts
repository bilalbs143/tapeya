import { describe, expect, it } from 'vitest';

import {
  entertainmentEpisodeBadge,
  entertainmentEpisodeViewsLabel,
  parseEntertainmentSerialId,
} from './entertainmentDetail';

describe('parseEntertainmentSerialId', () => {
  it('accepts positive ids only', () => {
    expect(parseEntertainmentSerialId('12')).toBe(12);
    expect(parseEntertainmentSerialId('0')).toBeNull();
    expect(parseEntertainmentSerialId('abc')).toBeNull();
    expect(parseEntertainmentSerialId(undefined)).toBeNull();
  });
});

describe('entertainmentEpisodeViewsLabel', () => {
  it('formats views', () => {
    expect(entertainmentEpisodeViewsLabel(42)).toBe('42 views');
  });
});

describe('entertainmentEpisodeBadge', () => {
  it('prefixes episode number', () => {
    expect(entertainmentEpisodeBadge(3)).toBe('EP 3');
  });
});
