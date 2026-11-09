import { describe, expect, it } from 'vitest';

import {
  DISCOVER_SEARCH_DEBOUNCE_MS,
  DISCOVER_SEARCH_SECTION_LABEL,
  DISCOVER_SECTION_LABEL,
  DISCOVER_SUGGESTIONS_LIMIT,
  discoverSearchResultsHeading,
} from './discoverPage';

describe('discoverPage constants', () => {
  it('exposes the suggestions limit and section label', () => {
    expect(DISCOVER_SUGGESTIONS_LIMIT).toBe(20);
    expect(DISCOVER_SECTION_LABEL).toBe('Players to Follow');
    expect(DISCOVER_SEARCH_SECTION_LABEL).toBe('Search Results');
    expect(DISCOVER_SEARCH_DEBOUNCE_MS).toBe(250);
  });

  it('formats search result counts', () => {
    expect(discoverSearchResultsHeading(0)).toBe('0 results');
    expect(discoverSearchResultsHeading(1)).toBe('1 result');
    expect(discoverSearchResultsHeading(4)).toBe('4 results');
  });
});
