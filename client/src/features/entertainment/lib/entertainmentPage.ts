export const ENTERTAINMENT_MIN_SEARCH = 2;
export const ENTERTAINMENT_SEARCH_DEBOUNCE_MS = 250;

export function seedEntertainmentDebounced(qParam: string | null): string {
  const seed = (qParam ?? '').trim();
  return seed.length >= ENTERTAINMENT_MIN_SEARCH ? seed : '';
}

export function resolveEntertainmentDebounced(trimmedQuery: string): string {
  return trimmedQuery.length >= ENTERTAINMENT_MIN_SEARCH ? trimmedQuery : '';
}

export function applyEntertainmentSearchParams(prev: URLSearchParams, trimmedQuery: string): URLSearchParams {
  const p = new URLSearchParams(prev);
  if (trimmedQuery.length >= ENTERTAINMENT_MIN_SEARCH) p.set('q', trimmedQuery);
  else p.delete('q');
  return p;
}

export function entertainmentSearchEmptyTitle(debounced: string): string {
  return `No shows found for "${debounced}"`;
}

export function entertainmentEpisodesLabel(count: number): string {
  return `${count} ${count === 1 ? 'episode' : 'episodes'}`;
}
