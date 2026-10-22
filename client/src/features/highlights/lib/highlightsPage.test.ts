import { describe, expect, it } from 'vitest';

import {
  applyHighlightsSearchParams,
  highlightsSearchEmptyTitle,
  resolveHighlightsDebounced,
  seedHighlightsDebounced,
} from './highlightsPage';

describe('seedHighlightsDebounced', () => {
  it('requires at least 2 chars', () => {
    expect(seedHighlightsDebounced('a')).toBe('');
    expect(seedHighlightsDebounced(' ab ')).toBe('ab');
  });
});

describe('resolveHighlightsDebounced', () => {
  it('gates on min length', () => {
    expect(resolveHighlightsDebounced('x')).toBe('');
    expect(resolveHighlightsDebounced('six')).toBe('six');
  });
});

describe('applyHighlightsSearchParams', () => {
  it('sets or clears q', () => {
    const withQ = applyHighlightsSearchParams(new URLSearchParams('q=old'), 'new');
    expect(withQ.get('q')).toBe('new');
    const cleared = applyHighlightsSearchParams(new URLSearchParams('q=old'), 'x');
    expect(cleared.get('q')).toBeNull();
  });
});

describe('highlightsSearchEmptyTitle', () => {
  it('embeds the query', () => {
    expect(highlightsSearchEmptyTitle('six')).toBe('No highlights found for "six"');
  });
});
