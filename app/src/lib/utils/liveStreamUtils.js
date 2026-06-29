import { Capacitor } from '@capacitor/core';

import { liveStreamDebugLog } from '@/features/stream/debug/liveStreamDebug';
import { normaliseMatchStatus } from '@/lib/utils/scorecardUtils';
import { baseUrl, getApiOrigin } from '@/store/api/baseApi';

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
 * iOS WKWebView (capacitor://) cannot embed YouTube directly — Error 153.
 * Route through an HTTPS page on the API domain that embeds YouTube with a valid Referer.
 */
export function shouldUseYoutubeEmbedProxy() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
}

/**
 * @returns {string}
 */
export function getYoutubeEmbedProxyBase() {
  const origin = getApiOrigin() || (() => {
    try {
      return new URL(baseUrl).origin;
    } catch {
      return '';
    }
  })();

  return origin ? `${origin}/embed/youtube` : '';
}

/**
 * @param {string} directEmbedUrl
 * @returns {string}
 */
export function buildYoutubeEmbedProxyUrl(directEmbedUrl) {
  const proxyUrl = new URL(getYoutubeEmbedProxyBase());
  proxyUrl.searchParams.set('src', directEmbedUrl);
  return proxyUrl.toString();
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
 * Normalise GET /live/matches rows for Live hub UI.
 *
 * @param {Array<object>} [matches]
 * @returns {Array<object>}
 */
export function normaliseLiveStreamMatches(matches) {
  return (matches ?? []).map((match) => {
    const home = match.home_team ?? {};
    const away = match.away_team ?? {};
    const embedId = match.stream?.embed_id ?? null;
    const thumbnailUrl = match.thumbnail_url?.trim() || youtubeStreamThumbnail(embedId);

    return {
      id: match.id,
      tournament_id: match.tournament_id,
      tournament_name: match.tournament?.name ?? '',
      status: normaliseMatchStatus(match.status || 'scheduled'),
      stream: match.stream ?? null,
      matchId: home.name && away.name ? `${home.name} vs ${away.name}` : `Match ${match.id}`,
      team1: {
        name: home.name || 'Home team',
        initial: (home.name || 'H').charAt(0).toUpperCase(),
        logo: home.logo ?? null,
      },
      team2: {
        name: away.name || 'Away team',
        initial: (away.name || 'A').charAt(0).toUpperCase(),
        logo: away.logo ?? null,
      },
      score1: null,
      score2: null,
      meta: {},
      thumbnail_url: thumbnailUrl,
    };
  });
}

/**
 * @param {number|string} matchId
 * @returns {string}
 */
export function liveBroadcastPath(matchId) {
  return `/live/broadcast/${matchId}`;
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
 * Resolve direct + final iframe URLs and log diagnostics (iOS proxy path).
 *
 * @returns {{ directEmbedUrl: string|null, iframeSrc: string|null, usesProxy: boolean, proxyBase: string|null, apiOrigin: string }}
 */
export function resolveYoutubeEmbed(embedUrl, embedId) {
  const directEmbedUrl = buildDirectYoutubeEmbedUrl(embedUrl, embedId);
  const usesProxy = shouldUseYoutubeEmbedProxy();
  const apiOrigin = getApiOrigin();
  const proxyBase = usesProxy ? getYoutubeEmbedProxyBase() : null;
  const iframeSrc = directEmbedUrl ? (usesProxy ? buildYoutubeEmbedProxyUrl(directEmbedUrl) : directEmbedUrl) : null;

  liveStreamDebugLog('embed-resolve', {
    platform: Capacitor.getPlatform(),
    isNative: Capacitor.isNativePlatform(),
    usesProxy,
    apiOrigin,
    proxyBase,
    embedUrl: embedUrl ?? null,
    embedId: embedId ?? null,
    directEmbedUrl,
    iframeSrc,
    hasIframeSrc: Boolean(iframeSrc),
  });

  return { directEmbedUrl, iframeSrc, usesProxy, proxyBase, apiOrigin };
}

/**
 * @param {string|null|undefined} embedUrl
 * @param {string|null|undefined} embedId
 * @returns {string|null}
 */
export function buildYoutubeEmbedUrl(embedUrl, embedId) {
  return resolveYoutubeEmbed(embedUrl, embedId).iframeSrc;
}
