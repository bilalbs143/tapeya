/**
 * Share URLs for mixed feed posts (text / image / video / repost).
 */

import { buildHttpsDeepLink } from '@/lib/deepLinks/deepLinkUtils';

/**
 * @param {{ id?: string|number, type?: string }|null|undefined} post
 */
export function buildPostDetailPath(post) {
  if (!post?.id) return '/';
  if (post.type === 'video') return `/reels/${post.id}`;
  return `/feed/${post.id}`;
}

/**
 * @param {{ id?: string|number, type?: string }|null|undefined} post
 * @param {string} [origin]
 */
export function buildPostShareUrl(post, origin) {
  return buildHttpsDeepLink(buildPostDetailPath(post), origin);
}
