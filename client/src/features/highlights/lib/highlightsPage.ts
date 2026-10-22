export const HIGHLIGHTS_MIN_SEARCH = 2;
export const HIGHLIGHTS_SEARCH_DEBOUNCE_MS = 250;

export function seedHighlightsDebounced(qParam: string | null): string {
  const seed = (qParam ?? '').trim();
  return seed.length >= HIGHLIGHTS_MIN_SEARCH ? seed : '';
}

export function resolveHighlightsDebounced(trimmedQuery: string): string {
  return trimmedQuery.length >= HIGHLIGHTS_MIN_SEARCH ? trimmedQuery : '';
}

export function applyHighlightsSearchParams(prev: URLSearchParams, trimmedQuery: string): URLSearchParams {
  const p = new URLSearchParams(prev);
  if (trimmedQuery.length >= HIGHLIGHTS_MIN_SEARCH) p.set('q', trimmedQuery);
  else p.delete('q');
  return p;
}

export function highlightsSearchEmptyTitle(debounced: string): string {
  return `No highlights found for "${debounced}"`;
}
