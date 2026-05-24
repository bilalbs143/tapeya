/**
 * Resolve the iframe src for a YouTube stream.
 *
 * The backend (`YouTubeEmbedUrl::normalize`) is the canonical source — when
 * `embedUrl` is present it already contains the correct app params (controls=0,
 * autoplay=1, etc.). Use it directly rather than re-parsing and rebuilding.
 *
 * `embedId` is the fallback for cases where only the raw video ID is available
 * (e.g. a Reverb status update that carries the id but not the full URL).
 *
 * @param {string|null|undefined} embedUrl  Full normalized embed URL from API
 * @param {string|null|undefined} embedId   Bare YouTube video/broadcast ID
 * @returns {string|null}
 */
export function buildYoutubeEmbedUrl(embedUrl, embedId) {
  // Trust the backend-normalized URL when provided — params are already correct.
  if (embedUrl?.trim()) return embedUrl.trim();

  // Build from bare video ID as a fallback (e.g. stream status events).
  if (!embedId?.trim()) return null;

  const params = new URLSearchParams({
    autoplay: '1',
    rel: '0',
    modestbranding: '1',
    controls: '0',
    fs: '0',
    disablekb: '1',
    playsinline: '1',
    iv_load_policy: '3',
    cc_load_policy: '0',
  });

  return `https://www.youtube.com/embed/${embedId.trim()}?${params.toString()}`;
}
