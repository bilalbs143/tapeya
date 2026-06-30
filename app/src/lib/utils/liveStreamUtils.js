import { Capacitor } from '@capacitor/core';

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
 * iOS WKWebView (capacitor://) cannot embed YouTube in nested iframes — Error 153.
 * Route through the public website so YouTube sees Referer `https://tapeya.com/embed/youtube`.
 */
export function shouldUseYoutubeEmbedProxy() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
}

/** iOS uses native WKWebView for YouTube (nested iframe blocked in Capacitor). */
export function usesIosNativeStreamPlayer() {
  return shouldUseYoutubeEmbedProxy();
}

/**
 * @returns {string}
 */
export function getYoutubeEmbedProxyBase() {
  if (shouldUseYoutubeEmbedProxy()) {
    const websiteOrigin = getYoutubeEmbedOrigin();
    if (websiteOrigin) {
      return `${websiteOrigin}/embed/youtube`;
    }
  }

  const origin =
    getApiOrigin() ||
    (() => {
      try {
        return new URL(baseUrl).origin;
      } catch {
        return '';
      }
    })();

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
