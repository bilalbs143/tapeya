import { env } from '@/shared/config/env';
import { isNativePlatform } from '@/shared/platform/platform';

import type { LivePlayback } from '../model/schemas';

/** Extract a YouTube video id from watch / embed / shorts / youtu.be URLs. */
export function extractYoutubeVideoId(input: string | null | undefined): string | null {
  if (!input?.trim()) return null;
  try {
    const url = new URL(input.trim());
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'youtu.be') {
      return url.pathname.split('/').filter(Boolean)[0] || null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      if (
        url.pathname.startsWith('/embed/') ||
        url.pathname.startsWith('/shorts/') ||
        url.pathname.startsWith('/live/')
      ) {
        return url.pathname.split('/').filter(Boolean)[1] || null;
      }
      return url.searchParams.get('v');
    }
  } catch {
    return null;
  }
  return null;
}

function youtubeEmbedOrigin(): string {
  const fromEnv = env.VITE_APP_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  if (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null') {
    return window.location.origin;
  }
  return '';
}

function youtubeEmbedParams(showControls: boolean): URLSearchParams {
  const params = new URLSearchParams({
    autoplay: '1',
    rel: '0',
    modestbranding: '1',
    controls: showControls ? '1' : '0',
    fs: showControls ? '1' : '0',
    disablekb: showControls ? '0' : '1',
    playsinline: '1',
    iv_load_policy: '3',
    cc_load_policy: '0',
  });
  const origin = youtubeEmbedOrigin();
  if (origin) params.set('origin', origin);
  return params;
}

export function buildDirectYoutubeEmbedUrl(
  embedUrl: string | null | undefined,
  embedId: string | null | undefined,
  { showControls = false }: { showControls?: boolean } = {}
): string | null {
  const id = embedId?.trim() || extractYoutubeVideoId(embedUrl);
  if (!id) {
    if (embedUrl?.includes('youtube.com/embed/')) return embedUrl;
    return null;
  }
  return `https://www.youtube.com/embed/${encodeURIComponent(id)}?${youtubeEmbedParams(showControls).toString()}`;
}

/** Native: Laravel `/embed/youtube` proxy (direct embed fails in WebView); web: direct embed. */
export function resolveYoutubeEmbed(
  embedUrl: string | null | undefined,
  embedId: string | null | undefined,
  { showControls = false }: { showControls?: boolean } = {}
): string | null {
  const direct = buildDirectYoutubeEmbedUrl(embedUrl, embedId, { showControls });
  if (!direct) return null;
  if (!isNativePlatform()) return direct;

  const appOrigin = env.VITE_APP_URL?.replace(/\/$/, '') ?? '';
  let apiOrigin = '';
  try {
    apiOrigin = new URL(env.VITE_API_URL).origin;
  } catch {
    /* ignore */
  }
  const proxyBase = appOrigin ? `${appOrigin}/embed/youtube` : apiOrigin ? `${apiOrigin}/embed/youtube` : '';
  if (!proxyBase) return null;

  let target = direct;
  try {
    const u = new URL(direct);
    u.searchParams.delete('origin');
    target = u.toString();
  } catch {
    /* keep direct */
  }

  const proxyUrl = new URL(proxyBase);
  proxyUrl.searchParams.set('src', target);
  if (showControls) proxyUrl.searchParams.set('controls', '1');
  return proxyUrl.toString();
}

export function youtubeStreamThumbnail(embedId: string | null | undefined): string | null {
  if (!embedId?.trim()) return null;
  return `https://i.ytimg.com/vi/${encodeURIComponent(embedId.trim())}/hqdefault.jpg`;
}

export function resolveStreamIframeSrc(
  playback: LivePlayback | null | undefined,
  { showControls = false }: { showControls?: boolean } = {}
): string | null {
  if (!playback || playback.mode !== 'iframe') return null;
  const youtube = resolveYoutubeEmbed(playback.embedUrl, playback.embedId, { showControls });
  if (youtube) return youtube;
  const raw = playback.embedUrl?.trim() || '';
  if (raw.startsWith('https://')) return raw;
  return null;
}

export function isYoutubeIframePlayback(playback: LivePlayback | null | undefined): boolean {
  if (!playback || playback.mode !== 'iframe') return false;
  return Boolean(
    playback.embedId?.trim() ||
    extractYoutubeVideoId(playback.embedUrl) ||
    buildDirectYoutubeEmbedUrl(playback.embedUrl, playback.embedId)
  );
}

/** True when `src` is our Laravel `/embed/youtube` proxy (native Capacitor path). */
export function isYoutubeEmbedProxyUrl(src: string): boolean {
  try {
    return new URL(src).pathname.replace(/\/+$/, '') === '/embed/youtube';
  } catch {
    return /\/embed\/youtube(?:\?|$)/.test(src);
  }
}

export function isInteractiveIframePlayback(playback: LivePlayback | null | undefined): boolean {
  if (!playback || playback.mode !== 'iframe') return false;
  return !isYoutubeIframePlayback(playback);
}

export function formatViewerCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return `${Math.round(n / 1000)}k`;
}

export function formatBroadcastElapsed(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

export const STATUS_BADGE: Record<string, string> = {
  live: 'LIVE',
  starting: 'STARTING',
  ended: 'ENDED',
  idle: 'IDLE',
  error: 'ERROR',
};

export const STATUS_SLATE: Record<string, { title: string; body: string }> = {
  starting: {
    title: 'Stream is starting',
    body: 'The broadcaster is getting ready. This usually takes a moment.',
  },
  ended: {
    title: 'This stream has ended',
    body: 'Thanks for watching. Check the Live hub for what is on now.',
  },
  idle: {
    title: 'Stream is not live yet',
    body: 'Come back when the broadcaster goes on air.',
  },
  error: {
    title: 'Could not play this stream',
    body: 'Check your connection and try again.',
  },
};
