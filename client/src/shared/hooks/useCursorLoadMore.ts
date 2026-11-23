import { useCursorSentinel } from './useCursorSentinel';

type PageCursor = {
  hasMore: boolean;
  nextCursor: string | null;
};

type Options = {
  /** Shelf/tab active — false disables the sentinel. */
  enabled: boolean;
  /** Current query cursor (owned by the caller). */
  cursor: string | undefined;
  onCursorChange: (cursor: string | undefined) => void;
  page: PageCursor | undefined;
  itemCount: number;
  isFetching: boolean;
  refetch: () => unknown;
  pageRoot?: boolean | undefined;
  shellRoot?: boolean | undefined;
};

/**
 * Intersection sentinel for RTK cursor queries.
 * Caller owns `cursor` state and passes it into the query args (same pattern as the home feed).
 */
export function useCursorLoadMore({
  enabled,
  cursor,
  onCursorChange,
  page,
  itemCount,
  isFetching,
  refetch,
  pageRoot = false,
  shellRoot = false,
}: Options) {
  const nextCursor = page?.nextCursor ?? null;
  const canLoadMore = Boolean(enabled && itemCount > 0 && page?.hasMore && nextCursor);
  const loadingMore = Boolean(enabled && isFetching && cursor);

  const loadMoreRef = useCursorSentinel({
    enabled: canLoadMore,
    pageRoot,
    shellRoot,
    recheckKey: isFetching ? 'busy' : (nextCursor ?? 'done'),
    onIntersect: () => {
      if (isFetching || !nextCursor) return;
      if (cursor === nextCursor) {
        void refetch();
        return;
      }
      onCursorChange(nextCursor);
    },
  });

  return { canLoadMore, loadingMore, loadMoreRef };
}
