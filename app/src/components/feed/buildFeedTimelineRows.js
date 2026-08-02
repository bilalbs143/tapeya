const SHOP_WIDGET_FIRST_POST_COUNT = 3;
const SUGGESTED_FOLLOWS_FIRST_POST_COUNT = 5;
const HIGHLIGHT_WIDGET_FIRST_POST_COUNT = 7;
const FEED_WIDGET_POST_INTERVAL = 8;
const SUGGESTED_FOLLOWS_VISIBLE_COUNT = 3;

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
 *
 * @param {{
 *   posts: Array<object>,
 *   tab: string,
 *   shopCollections: Array<{ id: string, title: string, products: Array<object> }>,
 *   brands: Array<object>,
 *   suggestedUsers: Array<object>,
 *   highlights: Array<object>,
 * }} args
 */
export function buildFeedTimelineRows({ posts, tab, shopCollections, brands, suggestedUsers, highlights }) {
  /** @type {Array<{ key: string, type: string, estimateSize: number, [k: string]: unknown }>} */
  const rows = [];

  posts.forEach((post, index) => {
    rows.push({
      key: `post-${post.id}`,
      type: 'post',
      estimateSize: 420,
      post,
    });

    if (tab !== 'explore') return;

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
  });

  return rows;
}

/** Matches Tailwind `gap-0.5` (2px) between feed surfaces. */
export const FEED_TIMELINE_ROW_GAP_PX = 2;
