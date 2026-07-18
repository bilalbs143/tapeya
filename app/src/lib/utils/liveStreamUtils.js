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
function getYoutubeEmbedDefaultParams() {
  const params = {
    autoplay: '1',
    rel: '0',
    modestbranding: '1',
    controls: '0',
    fs: '0',
    disablekb: '1',
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
 * @returns {string}
 */
export function buildYoutubeEmbedProxyUrl(directEmbedUrl) {
  const proxyBase = getYoutubeEmbedProxyBase();
  if (!proxyBase) {
    return '';
  }

  const proxyUrl = new URL(proxyBase);
  proxyUrl.searchParams.set('src', buildProxyTargetEmbedUrl(directEmbedUrl) ?? directEmbedUrl);
  return proxyUrl.toString();
}

/**
 * iOS native overlay embed params — rotate/cover only for landscape immersive.
 *
 * @param {string} proxyUrl
 * @param {{ landscape?: boolean }} [options]
 * @returns {string}
 */
export function withIosNativeEmbedParams(proxyUrl, { landscape = false } = {}) {
  try {
    const url = new URL(proxyUrl);
    if (landscape) {
      url.searchParams.set('cover', '1');
      url.searchParams.set('rotate', '1');
    } else {
      url.searchParams.delete('cover');
      url.searchParams.delete('rotate');
    }
    return url.toString();
  } catch {
    return proxyUrl;
  }
}

/**
 * @param {string|null|undefined} embedUrl
 * @param {string|null|undefined} embedId
 * @returns {string|null}
 */
export function buildDirectYoutubeEmbedUrl(embedUrl, embedId) {
  if (embedUrl?.trim()) {
    const url = new URL(embedUrl.trim());
    const origin = getYoutubeEmbedOrigin();
    if (origin && !url.searchParams.has('origin')) {
      url.searchParams.set('origin', origin);
    }
    return url.toString();
  }

  if (!embedId?.trim()) {
    return null;
  }

  const params = new URLSearchParams(getYoutubeEmbedDefaultParams());
  return `https://www.youtube.com/embed/${embedId.trim()}?${params.toString()}`;
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
 * @returns {{ iframeSrc: string|null, usesProxy: boolean }}
 */
export function resolveYoutubeEmbed(embedUrl, embedId) {
  const directEmbedUrl = buildDirectYoutubeEmbedUrl(embedUrl, embedId);
  const usesProxy = shouldUseYoutubeEmbedProxy();
  const iframeSrc = directEmbedUrl ? (usesProxy ? buildYoutubeEmbedProxyUrl(directEmbedUrl) : directEmbedUrl) : null;

  return { iframeSrc, usesProxy };
}

/**
 * @param {string|null|undefined} embedUrl
 * @param {string|null|undefined} embedId
 * @returns {string|null}
 */
export function buildYoutubeEmbedUrl(embedUrl, embedId) {
  return resolveYoutubeEmbed(embedUrl, embedId).iframeSrc;
}
