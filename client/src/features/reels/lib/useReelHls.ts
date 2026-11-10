/** Reel HLS/progressive — roles active/next/warm; promote warm→active; upgrade progressive→HLS. */

import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

import { applyInlineVideoAttributes, setReelVideoMuted } from './inlineVideo';
import { attachReelHls, bindReelHls } from './reelPlaybackGate';

const HLS_ACTIVE_BUFFER = { maxBufferLength: 12, maxMaxBufferLength: 20 };
/** Immediate next slide — larger buffer for hitch-free snap. */
const HLS_NEXT_BUFFER = { maxBufferLength: 10, maxMaxBufferLength: 16 };
/** Farther neighbors — light attach so we do not thrash bandwidth. */
const HLS_WARM_BUFFER = { maxBufferLength: 3, maxMaxBufferLength: 6 };

export type ReelHlsRole = 'active' | 'next' | 'warm';

function bufferForRole(role: ReelHlsRole): { maxBufferLength: number; maxMaxBufferLength: number } {
  if (role === 'active') return HLS_ACTIVE_BUFFER;
  if (role === 'next') return HLS_NEXT_BUFFER;
  return HLS_WARM_BUFFER;
}

export function isHlsUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const path = url.split('?')[0]?.toLowerCase() ?? '';
  return path.endsWith('.m3u8') || path.includes('/hls/');
}

function canPlayNativeHls(video: HTMLVideoElement): boolean {
  return Boolean(video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL'));
}

export type ReelPlaybackSource = {
  url?: string | null | undefined;
  type?: string | null | undefined;
  hlsUrl?: string | null | undefined;
};

export type ResolvedPlayback = {
  url: string | null;
  mode: 'hls' | 'progressive' | null;
};

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

type UseReelHlsOptions = {
  enabled?: boolean | undefined;
  role?: ReelHlsRole | undefined;
};

/**
 * Attach source for a reel slide.
 * Neighbors must NOT call video.play() — Android + hls.js mixes audio from every playing element.
 * Warming is HTTP prefetch + hls.js attach/startLoad only. Play ownership lives in ReelSlide.
 */
export function useReelHls(
  videoRef: RefObject<HTMLVideoElement | null>,
  playback: ReelPlaybackSource | null | undefined,
  options: UseReelHlsOptions = {}
) {
  const { enabled = true, role = 'active' } = options;
  const hlsRef = useRef<Hls | null>(null);
  const roleRef = useRef(role);
  const resumeTimeRef = useRef<number | null>(null);
  const sourceKeyRef = useRef<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [readyToken, setReadyToken] = useState(0);

  useEffect(() => {
    roleRef.current = role;
  }, [role]);

  const { url: sourceUrl, mode } = resolveReelPlaybackSource(playback);
  const useHls = mode === 'hls';

  const destroy = useCallback(() => {
    const video = videoRef.current;
    if (video) bindReelHls(video, null);
    hlsRef.current?.destroy();
    hlsRef.current = null;
    if (video) {
      video.removeAttribute('src');
      try {
        video.load();
      } catch {
        // Ignore load() on detached nodes.
      }
    }
  }, [videoRef]);

  const retry = useCallback(() => {
    setFailed(false);
    setRetryToken((n) => n + 1);
  }, []);

  const markFailed = useCallback(() => {
    setFailed(true);
    destroy();
  }, [destroy]);

  const bumpReady = useCallback(() => {
    setReadyToken((n) => n + 1);
  }, []);

  const applyResume = useCallback((video: HTMLVideoElement) => {
    const time = resumeTimeRef.current;
    resumeTimeRef.current = null;
    if (time == null || !Number.isFinite(time) || time <= 0.25) return;

    const seek = () => {
      try {
        video.currentTime = time;
      } catch {
        // Ignore seek failures on short clips.
      }
    };

    if (video.readyState >= 1) {
      seek();
    } else {
      video.addEventListener('loadedmetadata', seek, { once: true });
    }
  }, []);

  useEffect(() => {
    if (!enabled || !sourceUrl || !mode) {
      destroy();
      sourceKeyRef.current = null;
      return undefined;
    }

    const sourceKey = `${mode}:${sourceUrl}`;
    const previousKey = sourceKeyRef.current;
    if (previousKey && previousKey !== sourceKey) {
      const video = videoRef.current;
      const upgradingToHls = previousKey.startsWith('progressive:') && mode === 'hls';
      if (upgradingToHls && video && Number.isFinite(video.currentTime)) {
        resumeTimeRef.current = video.currentTime;
      }
    }
    sourceKeyRef.current = sourceKey;

    let cancelled = false;
    let readyHandled = false;
    let removeError = () => {};
    let removeReady = () => {};

    const attach = () => {
      if (cancelled) return;
      const video = videoRef.current;
      if (!video) return;

      applyInlineVideoAttributes(video);
      setFailed(false);
      destroy();

      const onError = () => markFailed();
      const onReady = () => {
        if (cancelled || readyHandled) return;
        readyHandled = true;
        applyResume(video);
        bumpReady();
        if (roleRef.current !== 'active') {
          setReelVideoMuted(video, true);
          try {
            video.pause();
          } catch {
            // Ignore.
          }
        }
      };

      if (mode === 'progressive') {
        video.src = sourceUrl;
        video.addEventListener('error', onError);
        video.addEventListener('loadeddata', onReady, { once: true });
        removeError = () => video.removeEventListener('error', onError);
        removeReady = () => video.removeEventListener('loadeddata', onReady);
        return;
      }

      if (canPlayNativeHls(video)) {
        video.src = sourceUrl;
        video.addEventListener('error', onError);
        video.addEventListener('loadeddata', onReady, { once: true });
        removeError = () => video.removeEventListener('error', onError);
        removeReady = () => video.removeEventListener('loadeddata', onReady);
        return;
      }

      if (!Hls.isSupported()) {
        setFailed(true);
        return;
      }

      const currentRole = roleRef.current;
      const buffer = bufferForRole(currentRole);
      const hls = new Hls({
        enableWorker: true,
        maxBufferLength: buffer.maxBufferLength,
        maxMaxBufferLength: buffer.maxMaxBufferLength,
        abrEwmaDefaultEstimate: 1_200_000,
        ...(currentRole !== 'active' ? { startLevel: 0 } : {}),
      });
      hlsRef.current = hls;
      bindReelHls(video, hls);
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) markFailed();
      });

      if (currentRole === 'active') {
        const onFragBuffered = () => onReady();
        hls.on(Hls.Events.FRAG_BUFFERED, onFragBuffered);
        video.addEventListener('canplay', onReady, { once: true });
        video.addEventListener('loadeddata', onReady, { once: true });
        removeReady = () => {
          hls.off(Hls.Events.FRAG_BUFFERED, onFragBuffered);
          video.removeEventListener('canplay', onReady);
          video.removeEventListener('loadeddata', onReady);
        };
      } else {
        hls.on(Hls.Events.MANIFEST_PARSED, onReady);
        video.addEventListener('loadeddata', onReady, { once: true });
        removeReady = () => {
          hls.off(Hls.Events.MANIFEST_PARSED, onReady);
          video.removeEventListener('loadeddata', onReady);
        };
      }
    };

    const raf = requestAnimationFrame(attach);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      removeError();
      removeReady();
      destroy();
    };
  }, [videoRef, sourceUrl, mode, enabled, retryToken, destroy, markFailed, bumpReady, applyResume]);

  // Promote / demote buffers without destroy/recreate. Playback claim/release is ReelSlide's job.
  useEffect(() => {
    const hls = hlsRef.current;
    if (!hls) return;

    const buffer = bufferForRole(role);
    hls.config.maxBufferLength = buffer.maxBufferLength;
    hls.config.maxMaxBufferLength = buffer.maxMaxBufferLength;

    if (role === 'active') {
      const video = videoRef.current;
      if (video) attachReelHls(video);
      else {
        try {
          hls.currentLevel = -1;
          hls.startLoad(-1);
        } catch {
          // Ignore.
        }
      }
    }
  }, [role, videoRef]);

  return { sourceUrl, useHls, mode, failed, retry, readyToken };
}
