import type { FeedTab } from '../model/schemas';
import { feedRoutes } from '../routes';

export const FEED_TABS: { value: FeedTab; label: string }[] = [
  { value: 'explore', label: 'Explore' },
  { value: 'following', label: 'Following' },
  { value: 'mine', label: 'Mine' },
  { value: 'saved', label: 'Saved' },
];

/** Composer is absent on Saved — there is nothing to compose into a saved list. */
export const FEED_COMPOSER_TABS = new Set<FeedTab>(['explore', 'following', 'mine']);

/** Explore-tab interstitial rails after the Nth post (0-based). */
export const FEED_EXPLORE_INSERT = {
  products: 0,
  highlights: 1,
  entertainment: 2,
  suggestions: 3,
} as const;

export function feedCommentHref(post: { id: number; kind: string }): string {
  return post.kind === 'video' ? feedRoutes.reel(post.id) : `${feedRoutes.post(post.id)}#comments`;
}
