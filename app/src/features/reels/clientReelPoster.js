/**
 * Just-uploaded reel media for this tab only.
 * Poster until server poster exists; video until refresh (avoids processing playback jank).
 */

/** @type {Map<string, string>} */
const posters = new Map();
/** @type {Map<string, string>} */
const videos = new Map();

function setUrl(map, reelId, objectUrl) {
  if (reelId == null || reelId === '' || !objectUrl) return;
  const key = String(reelId);
  const prev = map.get(key);
  if (prev && prev !== objectUrl) URL.revokeObjectURL(prev);
  map.set(key, objectUrl);
}

function getUrl(map, reelId) {
  if (reelId == null || reelId === '') return null;
  return map.get(String(reelId)) || null;
}

export function rememberClientReelPoster(reelId, objectUrl) {
  setUrl(posters, reelId, objectUrl);
}

export function rememberClientReelVideo(reelId, objectUrl) {
  setUrl(videos, reelId, objectUrl);
}

export function getClientReelPoster(reelId) {
  return getUrl(posters, reelId);
}

export function getClientReelVideo(reelId) {
  return getUrl(videos, reelId);
}

export function forgetClientReelPoster(reelId) {
  if (reelId == null || reelId === '') return;
  const key = String(reelId);
  const prev = posters.get(key);
  if (prev) {
    URL.revokeObjectURL(prev);
    posters.delete(key);
  }
}

/** Server poster wins; otherwise keep the local still. */
export function resolveReelPosterUrl(reelId, serverPoster) {
  if (serverPoster) {
    forgetClientReelPoster(reelId);
    return serverPoster;
  }
  return getClientReelPoster(reelId);
}
