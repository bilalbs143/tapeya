/** Soft cap on repeated Explore post rows after the catalog is exhausted. */
export const EXPLORE_LOOP_MAX_POST_ROWS = 200;

/** Hard ceiling on Explore display cycles regardless of catalog size. */
export const EXPLORE_LOOP_MAX_CYCLES = 20;

/** How often to peek page 1 for new Explore posts while client-cycling. */
export const EXPLORE_FRESHNESS_EVERY_CYCLES = 3;

/**
 * How many Explore display cycles are allowed for a loaded catalog size.
 * Always at least 1 (the initial pass). Empty catalogs cannot loop.
 *
 * @param {number} postCount
 * @returns {number}
 */
export function maxExploreCyclesForPostCount(postCount) {
  const count = Number(postCount);
  if (!Number.isFinite(count) || count <= 0) return 1;
  return Math.max(1, Math.min(EXPLORE_LOOP_MAX_CYCLES, Math.floor(EXPLORE_LOOP_MAX_POST_ROWS / count)));
}

/**
 * @param {Array<{ id?: unknown }>} knownPosts
 * @param {Array<{ id?: unknown }>|null|undefined} incoming
 * @returns {Array<{ id?: unknown }>}
 */
export function pickNewPosts(knownPosts, incoming) {
  const seen = new Set((knownPosts ?? []).map((post) => String(post.id)));
  return (incoming ?? []).filter((post) => post != null && !seen.has(String(post.id)));
}

/**
 * Drop soft-fresh posts that already exist in the loaded RTK catalog.
 * Returns the same array reference when nothing changes.
 *
 * @param {Array<object>} freshPosts
 * @param {Array<object>} basePosts
 * @returns {Array<object>}
 */
export function pruneFreshPosts(freshPosts, basePosts) {
  if (!freshPosts?.length) return freshPosts ?? [];
  const seen = new Set((basePosts ?? []).map((post) => String(post.id)));
  let removed = false;
  const next = [];
  for (const post of freshPosts) {
    if (seen.has(String(post.id))) {
      removed = true;
      continue;
    }
    next.push(post);
  }
  return removed ? next : freshPosts;
}

/**
 * Soft-fresh posts are prepended only from `freshFromCycle` onward so older
 * cycles (already on screen above) do not shift.
 *
 * @param {Array<object>} basePosts
 * @param {Array<object>} freshPosts
 * @param {number|null|undefined} freshFromCycle
 * @param {number} cycle
 * @returns {Array<object>}
 */
export function postsForExploreCycle(basePosts, freshPosts, freshFromCycle, cycle) {
  const base = Array.isArray(basePosts) ? basePosts : [];
  if (!freshPosts?.length || freshFromCycle == null || cycle < freshFromCycle) {
    return base;
  }
  const seen = new Set(freshPosts.map((post) => String(post.id)));
  return [...freshPosts, ...base.filter((post) => !seen.has(String(post.id)))];
}
