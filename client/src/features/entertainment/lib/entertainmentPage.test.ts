import { describe, expect, it } from 'vitest';

import {
  applyEntertainmentSearchParams,
  entertainmentEpisodesLabel,
  entertainmentSearchEmptyTitle,
  resolveEntertainmentDebounced,
  seedEntertainmentDebounced,
} from './entertainmentPage';

describe('seedEntertainmentDebounced', () => {
  it('requires at least 2 chars', () => {
    expect(seedEntertainmentDebounced('a')).toBe('');
    expect(seedEntertainmentDebounced(' ab ')).toBe('ab');
  });
});

describe('resolveEntertainmentDebounced', () => {
  it('gates on min length', () => {
    expect(resolveEntertainmentDebounced('x')).toBe('');
    expect(resolveEntertainmentDebounced('show')).toBe('show');
  });
});

describe('applyEntertainmentSearchParams', () => {
  it('sets or clears q', () => {
    expect(applyEntertainmentSearchParams(new URLSearchParams('q=old'), 'new').get('q')).toBe('new');
    expect(applyEntertainmentSearchParams(new URLSearchParams('q=old'), 'x').get('q')).toBeNull();
  });
});

describe('entertainmentSearchEmptyTitle', () => {
  it('embeds the query', () => {
    expect(entertainmentSearchEmptyTitle('show')).toBe('No shows found for "show"');
  });
});

describe('entertainmentEpisodesLabel', () => {
  it('pluralizes', () => {
    expect(entertainmentEpisodesLabel(1)).toBe('1 episode');
    expect(entertainmentEpisodesLabel(3)).toBe('3 episodes');
  });
});
