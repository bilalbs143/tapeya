import { Capacitor } from '@capacitor/core';

import { getApiOrigin } from '@/store/api/baseApi';

/**
 * Trusted origin for YouTube embed `origin` on web/Android direct embeds.
 * Set `VITE_APP_URL` at build time (Public Website URL from system settings in prod).
 */
export function getYoutubeEmbedOrigin() {
  const fromEnv = import.meta.env.VITE_APP_URL?.replace(/\/$/, '');
  if (fromEnv) {
    return fromEnv;
  }

  if (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null') {
    const { origin } = window.location;
    if (origin !== 'capacitor://localhost' && !origin.startsWith('capacitor://')) {
      return origin;
    }
  }

  return '';
}

/** Default YouTube iframe query params (must stay aligned with API YouTubeEmbedUrl). */
function getYoutubeEmbedDefaultParams({ showControls = false } = {}) {
  const params = {
    autoplay: '1',
    rel: '0',
    modestbranding: '1',
    controls: showControls ? '1' : '0',
    fs: showControls ? '1' : '0',
    disablekb: showControls ? '0' : '1',
    playsinline: '1',
    iv_load_policy: '3',
    cc_load_policy: '0',
  };
  const origin = getYoutubeEmbedOrigin();
  if (origin) {
    params.origin = origin;
  }
  return params;
}

/**
 * Extract a YouTube video id from watch / embed / shorts / youtu.be URLs.
 *
 * @param {string|null|undefined} input
 * @returns {string|null}
 */
export function extractYoutubeVideoId(input) {
  if (!input?.trim()) {
    return null;
  }

  try {
    const url = new URL(input.trim());
    const host = url.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id || null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      if (url.pathname.startsWith('/embed/') || url.pathname.startsWith('/shorts/') || url.pathname.startsWith('/live/')) {
        const id = url.pathname.split('/').filter(Boolean)[1];
        return id || null;
      }
      return url.searchParams.get('v');
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * @param {string} hostname
 * @returns {boolean}
 */
function isFacebookHost(hostname) {
  const host = hostname.replace(/^www\./, '').toLowerCase();
  return (
    host === 'facebook.com' ||
    host === 'm.facebook.com' ||
    host === 'fb.watch' ||
    host === 'fb.com' ||
    host.endsWith('.facebook.com')
  );
}

/**
 * Canonical Facebook permalink for the plugin `href` param (mirrors API FacebookEmbedUrl).
 *
 * @param {string} input
 * @returns {string|null}
 */
export function facebookPermalink(input) {
  if (!input?.trim()) {
    return null;
  }

  try {
    const url = new URL(input.trim());
    if (!isFacebookHost(url.hostname)) {
      return null;
    }

    const path = url.pathname || '/';
    const videoId = url.searchParams.get('v');
    // watch/?v=… , watch/live/?v=… , and video.php?v=…
    if (videoId && /^\d+$/.test(videoId)) {
      return `https://www.facebook.com/watch/?v=${videoId}`;
    }

    const shareMatch = path.match(/^\/share\/v\/([^/]+)\/?$/);
    if (shareMatch) {
      return `https://www.facebook.com/share/v/${shareMatch[1]}`;
    }

    const videosMatch = path.match(/\/videos\/(\d+)/);
    if (videosMatch) {
      const cleanPath = path.replace(/\/$/, '');
      return `https://www.facebook.com${cleanPath}`;
    }

    const reelMatch = path.match(/^\/reel\/(\d+)/);
    if (reelMatch) {
      return `https://www.facebook.com/reel/${reelMatch[1]}`;
    }

    if (url.hostname.replace(/^www\./, '').toLowerCase() === 'fb.watch') {
      const code = path.split('/').filter(Boolean)[0];
      return code ? `https://fb.watch/${code}` : null;
    }

    return `https://www.facebook.com${path === '' ? '/' : path}`;
  } catch {
    return null;
  }
}

/**
 * Facebook plugins/video.php embed URL, or null if input is not Facebook.
 * Already-normalized plugin URLs are returned as-is.
 *
 * @param {string|null|undefined} input
 * @returns {string|null}
 */
function buildFacebookPluginEmbedUrl(permalink) {
  const embed = new URL('https://www.facebook.com/plugins/video.php');
  embed.searchParams.set('href', permalink);
  embed.searchParams.set('show_text', 'false');
  embed.searchParams.set('autoplay', 'true');
  embed.searchParams.set('mute', '0');
  embed.searchParams.set('width', '1280');
  embed.searchParams.set('height', '720');
  embed.searchParams.set('allowfullscreen', 'true');
  return embed.toString();
}

/** True when a watch-URL / streaming_url points at Facebook (before playback resolves). */
export function isFacebookStreamUrl(input) {
  return Boolean(facebookPermalink(input));
}

export function buildFacebookEmbedUrl(input) {
  if (!input?.trim()) {
    return null;
  }

  try {
    const url = new URL(input.trim());
    if (!isFacebookHost(url.hostname)) {
      return null;
    }
    // Rebuild plugin URLs so stale href-only embeds pick up height / fullscreen params.
    if (url.pathname.startsWith('/plugins/video.php')) {
      const href = url.searchParams.get('href');
      return href ? buildFacebookPluginEmbedUrl(href) : url.toString();
    }
  } catch {
    return null;
  }

  const permalink = facebookPermalink(input);
  if (!permalink) {
    return null;
  }

  return buildFacebookPluginEmbedUrl(permalink);
}

/**
 * Capacitor WebViews load YouTube via Laravel's same-origin embed proxy so we can
 * receive ready/playing postMessages (and avoid Error 153 for nested iframes).
 */
export function shouldUseYoutubeEmbedProxy() {
  return Capacitor.isNativePlatform();
}

/**
 * iOS: native WKWebView overlay loading the API embed proxy.
 * In-DOM iframe (Android path) does not reach PLAYING on iOS Capacitor — loader
 * times out. Do not flip this to false without a device-proven alternative.
 */
export function usesIosNativeStreamPlayer() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
}

/**
 * Base URL for the native YouTube embed proxy page.
 *
 * Always the API origin — that is where `/embed/youtube` is served. Do not use
 * `VITE_APP_URL` / the SPA host: without a matching nginx proxy it returns
 * `index.html` and the native player never becomes ready.
 *
 * @returns {string}
 */
export function getYoutubeEmbedProxyBase() {
  const origin = getApiOrigin();
  return origin ? `${origin}/embed/youtube` : '';
}

/**
 * YouTube URL passed to the proxy — origin is set server-side from system settings.
 *
 * @param {string|null} directEmbedUrl
 * @returns {string|null}
 */
export function buildProxyTargetEmbedUrl(directEmbedUrl) {
  if (!directEmbedUrl) {
    return null;
  }

  try {
    const url = new URL(directEmbedUrl);
    url.searchParams.delete('origin');
    return url.toString();
  } catch {
    return directEmbedUrl;
  }
}

/**
 * @param {string} directEmbedUrl
 * @param {{ showControls?: boolean }} [options]
 * @returns {string}
 */
export function buildYoutubeEmbedProxyUrl(directEmbedUrl, { showControls = false } = {}) {
  const proxyBase = getYoutubeEmbedProxyBase();
  if (!proxyBase) {
    return '';
  }

  const proxyUrl = new URL(proxyBase);
  proxyUrl.searchParams.set('src', buildProxyTargetEmbedUrl(directEmbedUrl) ?? directEmbedUrl);
  if (showControls) {
    proxyUrl.searchParams.set('controls', '1');
  }
  return proxyUrl.toString();
}

/**
 * iOS native overlay embed params — rotate/cover for landscape immersive; optional VOD controls.
 *
 * @param {string} proxyUrl
 * @param {{ landscape?: boolean, showControls?: boolean }} [options]
 * @returns {string}
 */
export function withIosNativeEmbedParams(proxyUrl, { landscape = false, showControls = false } = {}) {
  try {
    const url = new URL(proxyUrl);
    if (landscape) {
      url.searchParams.set('cover', '1');
      url.searchParams.set('rotate', '1');
    } else {
      url.searchParams.delete('cover');
      url.searchParams.delete('rotate');
    }
    if (showControls) {
      url.searchParams.set('controls', '1');
    }
    return url.toString();
  } catch {
    return proxyUrl;
  }
}

/**
 * @param {string|null|undefined} embedUrl
 * @param {string|null|undefined} embedId
 * @param {{ showControls?: boolean }} [options]
 * @returns {string|null}
 */
export function buildDirectYoutubeEmbedUrl(embedUrl, embedId, { showControls = false } = {}) {
  const videoId = extractYoutubeVideoId(embedUrl) || embedId?.trim() || null;
  if (!videoId) {
    return null;
  }

  const params = new URLSearchParams(getYoutubeEmbedDefaultParams({ showControls }));
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/**
 * YouTube thumbnail for a broadcast / video id (live or VOD).
 *
 * @param {string|null|undefined} embedId
 * @returns {string|null}
 */
export function youtubeStreamThumbnail(embedId) {
  if (!embedId?.trim()) {
    return null;
  }

  return `https://i.ytimg.com/vi/${encodeURIComponent(embedId.trim())}/hqdefault.jpg`;
}

/**
 * "Hosted by @nickname" credit for self-serve mobile broadcasts — null for admin-created
 * or match-linked streams (see LiveStreamResource's `broadcaster` field).
 *
 * @param {object} row
 * @returns {string|null}
 */
export function liveStreamHostCredit(row) {
  const broadcaster = row.broadcaster;
  if (!broadcaster) return null;

  const handle = broadcaster.nickname?.trim() || broadcaster.name?.trim();
  return handle ? `Hosted by ${handle}` : null;
}

/**
 * Card subtitle for Live hub listings when API description is empty.
 *
 * @param {object} row
 * @returns {string}
 */
export function liveStreamCardSubtitle(row) {
  const description = row.description?.trim();
  const hostCredit = liveStreamHostCredit(row);

  if (description) {
    return hostCredit ? `${description} · ${hostCredit}` : description;
  }

  if (hostCredit) {
    return hostCredit;
  }

  const title = row.title?.trim() || 'Live Stream';
  const status = row.stream?.status;
  if (status === 'live') {
    return `${title} · Live now`;
  }

  return '';
}

/**
 * True when this hub/viewer row is a self-serve mobile broadcast (owner-hosted),
 * not a match-linked 16:9 tournament stream.
 *
 * Prefer `is_self_serve` from LiveStreamResource; fall back to broadcaster / match_id
 * for older API payloads.
 *
 * @param {object | null | undefined} broadcast — GET /live/streams/:id payload
 */
export function isSelfServeLiveBroadcast(broadcast) {
  if (!broadcast) return false;
  if (typeof broadcast.is_self_serve === 'boolean') return broadcast.is_self_serve;
  if (broadcast.broadcaster) return true;
  if (broadcast.match_id != null) return false;
  // Standalone admin streams without an owner stay on the classic layout.
  return false;
}

/**
 * Self-serve Go Live encode/viewer aspect from the stream payload (API StreamOrientationEnum value).
 * Missing / legacy rows resolve to portrait — the API column default.
 *
 * @param {object | null | undefined} broadcast — live stream or owner broadcast payload
 * @returns {string}
 * @see docs/LIVE_STREAM_ORIENTATION.md
 */
export function getStreamOrientation(broadcast) {
  const value = broadcast?.orientation;
  return typeof value === 'string' && value.length > 0 ? value : 'portrait';
}

/**
 * Normalise GET /live/matches rows for Live hub UI.
 *
 * @param {Array<object>} [streams]
 * @returns {Array<object>}
 */
export function normaliseLiveStreams(streams) {
  return (streams ?? []).map((row) => {
    const thumbnailUrl = row.thumbnail_url?.trim() || null;

    return {
      streamId: row.id,
      linkedMatchId: row.match_id ?? null,
      tournamentId: row.tournament_id ?? null,
      title: row.title ?? 'Live Stream',
      subtitle: liveStreamCardSubtitle(row),
      stream: row.stream ?? null,
      thumbnail_url: thumbnailUrl,
    };
  });
}
/**
 * @param {number|string} streamId
 * @returns {string}
 */
export function liveBroadcastPath(streamId) {
  return `/live/broadcast/${streamId}`;
}

/**
 * @param {number|string} tournamentId
 * @param {number|string} matchId
 * @returns {string}
 */
export function liveMatchWatchPath(tournamentId, matchId) {
  return `/scorecard/${tournamentId}/match/${matchId}`;
}

/**
 * @param {string|null|undefined} embedUrl
 * @param {string|null|undefined} embedId
 * @param {{ showControls?: boolean }} [options]
 * @returns {{ iframeSrc: string|null, usesProxy: boolean }}
 */
export function resolveYoutubeEmbed(embedUrl, embedId, { showControls = false } = {}) {
  const directEmbedUrl = buildDirectYoutubeEmbedUrl(embedUrl, embedId, { showControls });
  const usesProxy = shouldUseYoutubeEmbedProxy();
  const iframeSrc = directEmbedUrl
    ? usesProxy
      ? buildYoutubeEmbedProxyUrl(directEmbedUrl, { showControls })
      : directEmbedUrl
    : null;

  return { iframeSrc, usesProxy };
}

/**
 * Resolve iframe src for live playback — YouTube (optionally proxied) or generic HTTPS embeds
 * (Facebook plugin URL, etc. from {@link StreamUrlPlayback}).
 *
 * @param {{ embed_url?: string|null, embed_id?: string|null }|null|undefined} playback
 * @param {{ showControls?: boolean }} [options]
 * @returns {{ iframeSrc: string|null, usesProxy: boolean }}
 */
export function resolveStreamIframeSrc(playback, { showControls = false } = {}) {
  const raw = typeof playback?.embed_url === 'string' ? playback.embed_url.trim() : '';

  const facebook = buildFacebookEmbedUrl(raw);
  if (facebook) {
    return { iframeSrc: facebook, usesProxy: false };
  }

  const youtube = resolveYoutubeEmbed(raw, playback?.embed_id, { showControls });
  if (youtube.iframeSrc) {
    return youtube;
  }

  if (raw.startsWith('https://')) {
    return { iframeSrc: raw, usesProxy: false };
  }

  return { iframeSrc: null, usesProxy: false };
}

/** True when playback resolves to a YouTube iframe (autoplay / proxy path — not tap-to-play). */
export function isYoutubeIframePlayback(playback) {
  if (!playback || playback.mode !== 'iframe') {
    return false;
  }
  const raw = typeof playback.embed_url === 'string' ? playback.embed_url.trim() : '';
  return Boolean(playback.embed_id?.trim() || resolveYoutubeEmbed(raw, playback.embed_id).iframeSrc);
}

/** True for non-YouTube iframe embeds (Facebook, generic HTTPS, etc.) that need tap-to-play + chrome passthrough. */
export function isInteractiveIframePlayback(playback) {
  if (!playback || playback.mode !== 'iframe') {
    return false;
  }
  return !isYoutubeIframePlayback(playback);
}

/** True when a watch-URL points at YouTube (before playback resolves). */
export function isYoutubeStreamUrl(input) {
  return Boolean(extractYoutubeVideoId(input));
}

/** True when a watch-URL points at HLS (before playback resolves). */
export function isHlsStreamUrl(input) {
  if (!input?.trim()) {
    return false;
  }
  try {
    const url = new URL(input.trim());
    const path = url.pathname.toLowerCase();
    const host = url.hostname.toLowerCase();
    if (path.endsWith('.m3u8')) {
      return true;
    }
    return host.includes('cloudfront.net') || host.includes('live-video.net');
  } catch {
    return false;
  }
}

/** True for HTTPS watch-URLs that map to interactive iframe playback (not YouTube or HLS). */
export function isInteractiveStreamUrl(input) {
  if (!input?.trim()) {
    return false;
  }
  if (isYoutubeStreamUrl(input) || isHlsStreamUrl(input)) {
    return false;
  }
  try {
    return new URL(input.trim()).protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * @param {string|null|undefined} embedUrl
 * @param {string|null|undefined} embedId
 * @returns {string|null}
 */
export function buildYoutubeEmbedUrl(embedUrl, embedId) {
  return resolveYoutubeEmbed(embedUrl, embedId).iframeSrc;
}
