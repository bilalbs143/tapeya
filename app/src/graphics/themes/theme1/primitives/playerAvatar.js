import { assets } from '../config';

const PLACEHOLDER_SUFFIX = '/player-placeholder-theme1.png';

/**
 * Whether the source resolves to the theme placeholder (no real player photo).
 * @param {string|null|undefined} url
 */
export function isPlayerAvatarPlaceholder(url) {
  if (url == null) return true;
  if (typeof url !== 'string' || !url.trim()) return true;
  if (url === assets.playerPlaceholder) return true;
  return url.endsWith(PLACEHOLDER_SUFFIX);
}

/**
 * Resolve a player avatar URL, falling back to the theme placeholder.
 * @param {string|null|undefined} url
 */
export function resolvePlayerAvatarUrl(url) {
  if (isPlayerAvatarPlaceholder(url)) return assets.playerPlaceholder;
  return url;
}
