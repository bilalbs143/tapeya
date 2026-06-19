import { assets } from '../config';

/**
 * Resolve a player avatar URL, falling back to the theme placeholder.
 * @param {string|null|undefined} url
 */
export function resolvePlayerAvatarUrl(url) {
  if (url == null) return assets.playerPlaceholder;
  if (typeof url === 'string' && !url.trim()) return assets.playerPlaceholder;
  return url;
}
