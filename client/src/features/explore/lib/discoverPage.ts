export const DISCOVER_SUGGESTIONS_LIMIT = 20;

export const DISCOVER_SECTION_LABEL = 'Players to Follow';

export const DISCOVER_SEARCH_SECTION_LABEL = 'Search Results';

/** Same cadence as shop home search. */
export const DISCOVER_SEARCH_DEBOUNCE_MS = 250;

export function discoverSearchResultsHeading(count: number): string {
  return `${count} result${count === 1 ? '' : 's'}`;
}
