import { assets } from '../config';

/** Canonical CDN / local placeholder filename for theme1+theme2 assets. */
const PLACEHOLDER_MARKERS = [/player-placeholder/i, /player_placeholder/i];

/**
 * Whether the source resolves to a theme placeholder (no real player photo).
 * Treats null/empty and any player-placeholder asset URL as placeholder so
 * plate lining stays consistent even when callers pass a non-canonical path.
 *
 * @param {string|null|undefined} url
 */
export function isPlayerAvatarPlaceholder(url) {
  if (url == null) return true;
  if (typeof url !== 'string' || !url.trim()) return true;
  if (url === assets.playerPlaceholder) return true;
  return PLACEHOLDER_MARKERS.some((re) => re.test(url));
}

/**
 * Resolve a player avatar URL, falling back to the theme placeholder.
 * @param {string|null|undefined} url
 */
export function resolvePlayerAvatarUrl(url) {
  if (isPlayerAvatarPlaceholder(url)) return assets.playerPlaceholder;
  return url;
}
