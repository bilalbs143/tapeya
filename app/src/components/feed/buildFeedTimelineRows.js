import { CATALOG_CYCLE_MAX_CYCLES, itemsForCycle } from '@/lib/catalogCycle';

export { CATALOG_CYCLE_MAX_CYCLES, CATALOG_CYCLE_MAX_ROWS, maxCyclesForCatalogSize } from '@/lib/catalogCycle';

const SHOP_WIDGET_FIRST_POST_COUNT = 3;
const SUGGESTED_FOLLOWS_FIRST_POST_COUNT = 5;
const HIGHLIGHT_WIDGET_FIRST_POST_COUNT = 7;
const FEED_WIDGET_POST_INTERVAL = 8;
const SUGGESTED_FOLLOWS_VISIBLE_COUNT = 3;

const EMPTY_FRESH_ITEMS = Object.freeze([]);

function getWidgetSlot(postIndex, firstPostCount) {
  const postsSeen = postIndex + 1;
  if (postsSeen < firstPostCount) return null;

  const distance = postsSeen - firstPostCount;
  return distance % FEED_WIDGET_POST_INTERVAL === 0 ? distance / FEED_WIDGET_POST_INTERVAL : null;
}

function getItemWindow(items, windowIndex, size = 3) {
  if (!items?.length) return [];
  if (items.length <= size) return items;

  const start = (windowIndex * size) % items.length;
  return Array.from({ length: size }, (_, offset) => items[(start + offset) % items.length]);
}

/**
 * Flatten posts + Explore injection widgets into a virtualizable row list.
 * Explore may repeat posts across `cycles` with keys `post-{id}-c{n}`.
 * Discovery widgets render on the first pass only.
 * Soft-fresh items (if any) are applied from `freshFromCycle` onward.
 *
 * @param {{
 *   posts: Array<object>,
 *   tab: string,
 *   shopCollections: Array<{ id: string, title: string, products: Array<object> }>,
 *   brands: Array<object>,
 *   suggestedUsers: Array<object>,
 *   highlights: Array<object>,
 *   cycles?: number,
 *   freshItems?: Array<object>,
 *   freshFromCycle?: number|null,
 * }} args
 */
export function buildFeedTimelineRows({
  posts,
  tab,
  shopCollections,
  brands,
  suggestedUsers,
  highlights,
  cycles = 1,
  freshItems = EMPTY_FRESH_ITEMS,
  freshFromCycle = null,
}) {
  /** @type {Array<{ key: string, type: string, estimateSize: number, [k: string]: unknown }>} */
  const rows = [];
  const basePosts = Array.isArray(posts) ? posts : [];
  const isExplore = tab === 'explore';
  const cycleCount = isExplore ? Math.max(1, Math.min(CATALOG_CYCLE_MAX_CYCLES, Number(cycles) || 1)) : 1;
  const postsWithFresh =
    isExplore && freshItems.length > 0 && freshFromCycle != null
      ? itemsForCycle(basePosts, freshItems, freshFromCycle, freshFromCycle)
      : basePosts;

  for (let cycle = 0; cycle < cycleCount; cycle++) {
    const list = isExplore && freshFromCycle != null && cycle >= freshFromCycle ? postsWithFresh : basePosts;

    for (let index = 0; index < list.length; index++) {
      const post = list[index];
      rows.push({
        key: isExplore ? `post-${post.id}-c${cycle}` : `post-${post.id}`,
        type: 'post',
        estimateSize: 420,
        post,
      });

      if (!isExplore || cycle > 0) continue;

      const shopSlot = getWidgetSlot(index, SHOP_WIDGET_FIRST_POST_COUNT);
      const suggestedSlot = getWidgetSlot(index, SUGGESTED_FOLLOWS_FIRST_POST_COUNT);
      const highlightSlot = getWidgetSlot(index, HIGHLIGHT_WIDGET_FIRST_POST_COUNT);

      const collection =
        shopSlot === null || shopCollections.length === 0 ? null : shopCollections[shopSlot % shopCollections.length];
      if (collection) {
        const collectionWindow = Math.floor(shopSlot / shopCollections.length);
        rows.push({
          key: `shop-${post.id}-${collection.id}-${collectionWindow}`,
          type: 'shop',
          estimateSize: 280,
          title: collection.title,
          products: getItemWindow(collection.products, collectionWindow),
          brands,
        });
      }

      if (suggestedSlot !== null && suggestedUsers.length > 0) {
        rows.push({
          key: `suggested-${post.id}-${suggestedSlot}`,
          type: 'suggested',
          estimateSize: 260,
          users: getItemWindow(suggestedUsers, suggestedSlot, SUGGESTED_FOLLOWS_VISIBLE_COUNT),
        });
      }

      if (highlightSlot !== null && highlights.length > 0) {
        rows.push({
          key: `highlight-${post.id}-${highlightSlot}`,
          type: 'highlight',
          estimateSize: 280,
          highlights: getItemWindow(highlights, highlightSlot),
        });
      }
    }
  }

  return rows;
}

/** Matches Tailwind `gap-0.5` (2px) between feed surfaces. */
export const FEED_TIMELINE_ROW_GAP_PX = 2;
