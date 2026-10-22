export const SHOP_SEARCH_DEBOUNCE_MS = 250;

export function shopSearchResultsHeading(count: number): string {
  return `${count} result${count === 1 ? '' : 's'}`;
}

export function shopHomeRailsBare(popularCount: number, offersCount: number): boolean {
  return popularCount === 0 && offersCount === 0;
}
