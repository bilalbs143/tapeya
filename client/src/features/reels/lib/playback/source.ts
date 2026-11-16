import type { ReelPlaybackSource, ResolvedPlayback } from './types';

export function isHlsUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const path = url.split('?')[0]?.toLowerCase() ?? '';
  return path.endsWith('.m3u8') || path.includes('/hls/');
}

/** Prefer HLS master when present; else progressive original while encoding. */
export function resolveReelPlaybackSource(playback: ReelPlaybackSource | null | undefined): ResolvedPlayback {
  const progressiveCandidate = playback?.url ?? null;
  const hlsUrl =
    playback?.hlsUrl ||
    (playback?.type === 'hls' && isHlsUrl(progressiveCandidate) ? progressiveCandidate : null) ||
    (isHlsUrl(progressiveCandidate) ? progressiveCandidate : null) ||
    null;

  if (hlsUrl) {
    return { url: hlsUrl, mode: 'hls' };
  }

  const progressive =
    playback?.type === 'original' && typeof progressiveCandidate === 'string' && progressiveCandidate
      ? progressiveCandidate
      : typeof progressiveCandidate === 'string' && progressiveCandidate && !isHlsUrl(progressiveCandidate)
        ? progressiveCandidate
        : null;

  if (progressive) {
    return { url: progressive, mode: 'progressive' };
  }

  return { url: null, mode: null };
}
