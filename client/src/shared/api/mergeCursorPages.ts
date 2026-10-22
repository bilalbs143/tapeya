import type { CursorPage } from './types';

type CursorArg = { cursor?: string | undefined };

/** RTK Query cursor merge — first page replaces; later pages append by id (Immer draft). */
export function mergeCursorPages<T extends { id: number | string }>(
  currentCache: CursorPage<T>,
  incoming: CursorPage<T>,
  meta: { arg: CursorArg }
): void {
  if (!meta.arg.cursor) {
    currentCache.items = incoming.items;
  } else {
    const seen = new Set(currentCache.items.map((item) => item.id));
    for (const item of incoming.items) {
      if (!seen.has(item.id)) {
        currentCache.items.push(item);
      }
    }
  }
  currentCache.nextCursor = incoming.nextCursor;
  currentCache.prevCursor = incoming.prevCursor;
  currentCache.hasMore = incoming.hasMore;
  currentCache.perPage = incoming.perPage;
}
