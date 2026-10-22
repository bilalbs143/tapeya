/** Reel HLS/progressive — roles active/next/warm; promote warm→active; upgrade progressive→HLS. */

import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

import { applyInlineVideoAttributes } from './inlineVideo';

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

/** Silent prime into buffer then pause at 0; next slide primes deeper than warm. */
export function primeNeighborPlayback(
  video: HTMLVideoElement,
  options: { aggressive?: boolean | undefined } = {}
): () => void {
  const aggressive = Boolean(options.aggressive);
  let cancelled = false;
  let timer = 0;
  const targetSeconds = aggressive ? 2.75 : 1.0;
  const maxMs = aggressive ? 3200 : 1600;

  const finish = () => {
    if (cancelled) return;
    cancelled = true;
    video.removeEventListener('progress', onProgress);
    video.removeEventListener('loadeddata', onProgress);
    if (timer) window.clearTimeout(timer);
    try {
      video.pause();
      if (Number.isFinite(video.currentTime) && video.currentTime > 0.05) {
        video.currentTime = 0;
      }
    } catch {
      // Ignore pause/seek races while detaching.
    }
  };

  const onProgress = () => {
    if (cancelled) return;
    try {
      if (!video.buffered.length) return;
      const end = video.buffered.end(video.buffered.length - 1);
      const need =
        Number.isFinite(video.duration) && video.duration > 0 ? Math.min(targetSeconds, video.duration) : targetSeconds;
      if (end >= need) finish();
    } catch {
      // Ignore buffer inspection errors.
    }
  };

  video.muted = true;
  video.defaultMuted = true;
  const attempt = video.play();
  if (attempt && typeof attempt.then === 'function') {
    void attempt
      .then(() => {
        if (cancelled) return;
        video.addEventListener('progress', onProgress);
        video.addEventListener('loadeddata', onProgress);
        onProgress();
        timer = window.setTimeout(finish, maxMs);
      })
      .catch(() => {
        // Autoplay may still be blocked for neighbors; HTTP prefetch covers that path.
      });
  } else {
    timer = window.setTimeout(finish, maxMs);
  }

  return () => {
    if (cancelled) return;
    cancelled = true;
    video.removeEventListener('progress', onProgress);
    video.removeEventListener('loadeddata', onProgress);
    if (timer) window.clearTimeout(timer);
    try {
      video.pause();
    } catch {
      // Ignore.
    }
  };
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

export function useReelHls(
  videoRef: RefObject<HTMLVideoElement | null>,
  playback: ReelPlaybackSource | null | undefined,
  options: UseReelHlsOptions = {}
) {
  const { enabled = true, role = 'active' } = options;
  const hlsRef = useRef<Hls | null>(null);
  const roleRef = useRef(role);
  const prevRoleRef = useRef(role);
  const resumeRef = useRef<{ time: number; wasPlaying: boolean } | null>(null);
  const sourceKeyRef = useRef<string | null>(null);
  const stopPrimeRef = useRef<(() => void) | null>(null);
  const [failed, setFailed] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [readyToken, setReadyToken] = useState(0);

  // Keep role readable from async attach/prime without writing refs during render.
  useEffect(() => {
    roleRef.current = role;
  }, [role]);

  const { url: sourceUrl, mode } = resolveReelPlaybackSource(playback);
  const useHls = mode === 'hls';

  const stopPrime = useCallback(() => {
    stopPrimeRef.current?.();
    stopPrimeRef.current = null;
  }, []);

  const destroy = useCallback(() => {
    stopPrime();
    hlsRef.current?.destroy();
    hlsRef.current = null;
    const video = videoRef.current;
    if (video) {
      video.removeAttribute('src');
      try {
        video.load();
      } catch {
        // Ignore load() on detached nodes.
      }
    }
  }, [stopPrime, videoRef]);

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
    const resume = resumeRef.current;
    resumeRef.current = null;
    if (!resume) return;

    const seek = () => {
      if (Number.isFinite(resume.time) && resume.time > 0.25) {
        try {
          video.currentTime = resume.time;
        } catch {
          // Ignore seek failures on short clips.
        }
      }
      // Re-check role at attach time — a fast swipe may have demoted active→next
      // between capturing wasPlaying and HLS onReady.
      if (resume.wasPlaying && roleRef.current === 'active') {
        void video.play().catch(() => undefined);
      }
    };

    if (video.readyState >= 1) {
      seek();
    } else {
      video.addEventListener('loadedmetadata', seek, { once: true });
    }
  }, []);

  const maybePrimeNeighbor = useCallback(
    (video: HTMLVideoElement) => {
      const currentRole = roleRef.current;
      if (currentRole === 'active') return;
      stopPrime();
      stopPrimeRef.current = primeNeighborPlayback(video, { aggressive: currentRole === 'next' });
    },
    [stopPrime]
  );

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
      if (upgradingToHls && video) {
        // Only resume audible play for the active slide. Neighbors mid silent-prime
        // are not paused; treating that as wasPlaying would restart off-screen audio.
        resumeRef.current = {
          time: Number.isFinite(video.currentTime) ? video.currentTime : 0,
          wasPlaying: roleRef.current === 'active' && !video.paused,
        };
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
        maybePrimeNeighbor(video);
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
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, onReady);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) markFailed();
      });
      video.addEventListener('loadeddata', onReady, { once: true });
      removeReady = () => video.removeEventListener('loadeddata', onReady);
    };

    const raf = requestAnimationFrame(attach);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      removeError();
      removeReady();
      destroy();
    };
  }, [videoRef, sourceUrl, mode, enabled, retryToken, destroy, markFailed, bumpReady, applyResume, maybePrimeNeighbor]);

  // Promote next/warm → active without destroy/recreate (the snap we must not stall).
  useEffect(() => {
    const prevRole = prevRoleRef.current;
    prevRoleRef.current = role;
    const hls = hlsRef.current;

    if (role === 'active') {
      stopPrime();
      if (!hls) return;
      hls.config.maxBufferLength = HLS_ACTIVE_BUFFER.maxBufferLength;
      hls.config.maxMaxBufferLength = HLS_ACTIVE_BUFFER.maxMaxBufferLength;
      try {
        hls.currentLevel = -1;
      } catch {
        // Native / detached instances may not expose currentLevel.
      }
      return;
    }

    if (hls) {
      const buffer = bufferForRole(role);
      hls.config.maxBufferLength = buffer.maxBufferLength;
      hls.config.maxMaxBufferLength = buffer.maxMaxBufferLength;
    }

    // When a farther neighbor becomes the immediate next, deepen the silent prime.
    if (role === 'next' && prevRole !== 'next' && prevRole !== 'active' && videoRef.current) {
      maybePrimeNeighbor(videoRef.current);
    }
  }, [role, stopPrime, maybePrimeNeighbor, videoRef]);

  return { sourceUrl, useHls, mode, failed, retry, readyToken };
}
