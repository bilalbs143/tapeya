/**
 * Attach progressive original or HLS to a video element for reel playback.
 * Pass enabled=false outside the player window to destroy the player.
 *
 * `role`:
 * - `active` — full buffer, ABR free
 * - `next` — immediate next slide; larger warm buffer + silent prime
 * - `warm` — farther neighbors; small buffer + light prime
 *
 * Active is promoted in place (config bump only — never destroy on warm→active).
 *
 * When encoding finishes, upgrades original → HLS at the same timestamp so the
 * swap feels seamless (keeps play/pause state).
 *
 * `readyToken` increments after a source is attached so callers can re-trigger play()
 * (attach is deferred one frame; a synchronous play() would hit a sourceless element).
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import Hls from 'hls.js';

import { applyInlineVideoAttributes } from '@/features/reels/inlineVideo';

const HLS_ACTIVE_BUFFER = { maxBufferLength: 12, maxMaxBufferLength: 20 };
/** Immediate next reel — enough to start without a hitch after snap. */
const HLS_NEXT_BUFFER = { maxBufferLength: 8, maxMaxBufferLength: 14 };
/** Farther neighbors — light attach so we do not thrash bandwidth. */
const HLS_WARM_BUFFER = { maxBufferLength: 3, maxMaxBufferLength: 6 };

function bufferForRole(role) {
  if (role === 'active') return HLS_ACTIVE_BUFFER;
  if (role === 'next') return HLS_NEXT_BUFFER;
  return HLS_WARM_BUFFER;
}

function isHlsUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const path = url.split('?')[0].toLowerCase();
  return path.endsWith('.m3u8') || path.includes('/hls/');
}

function canPlayNativeHls(video) {
  return Boolean(video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL'));
}

/**
 * Briefly play muted so the decoder + first seconds land in buffer, then pause at 0.
 * Keeps the next snap instant without leaving off-screen videos spinning forever.
 *
 * @param {HTMLVideoElement} video
 * @param {{ aggressive?: boolean }} [options]
 * @returns {() => void} cleanup
 */
export function primeNeighborPlayback(video, options = {}) {
  const aggressive = Boolean(options.aggressive);
  if (!video) return () => {};

  let cancelled = false;
  let timer = 0;
  const targetSeconds = aggressive ? 2.25 : 1.0;
  const maxMs = aggressive ? 2800 : 1600;

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
    attempt
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

/**
 * @param {{ url?: string|null, type?: string|null, hlsUrl?: string|null }} playback
 * @returns {{ url: string|null, mode: 'hls'|'progressive'|null }}
 */
export function resolveReelPlaybackSource(playback) {
  const hlsUrl =
    playback?.hlsUrl ||
    (playback?.type === 'hls' && isHlsUrl(playback?.url) ? playback.url : null) ||
    (isHlsUrl(playback?.url) ? playback.url : null) ||
    null;

  if (hlsUrl) {
    return { url: hlsUrl, mode: 'hls' };
  }

  const progressive =
    playback?.type === 'original' && typeof playback?.url === 'string' && playback.url
      ? playback.url
      : typeof playback?.url === 'string' && playback.url && !isHlsUrl(playback.url)
        ? playback.url
        : null;

  if (progressive) {
    return { url: progressive, mode: 'progressive' };
  }

  return { url: null, mode: null };
}

/**
 * @param {React.RefObject<HTMLVideoElement|null>} videoRef
 * @param {{ url?: string|null, type?: string|null, hlsUrl?: string|null }} playback
 * @param {{ enabled?: boolean, role?: 'active'|'next'|'warm' }} [options]
 */
export function useReelHls(videoRef, playback, options = {}) {
  const { enabled = true, role = 'active' } = options;
  const hlsRef = useRef(null);
  const roleRef = useRef(role);
  const prevRoleRef = useRef(role);
  const resumeRef = useRef(null);
  const sourceKeyRef = useRef(null);
  const stopPrimeRef = useRef(null);
  roleRef.current = role;
  const [failed, setFailed] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [readyToken, setReadyToken] = useState(0);

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

  const applyResume = useCallback((video) => {
    const resume = resumeRef.current;
    resumeRef.current = null;
    // Active play/mute policy lives in ReelItem (unmuted-first, muted fallback).
    if (!resume || !video) return;

    const seek = () => {
      if (Number.isFinite(resume.time) && resume.time > 0.25) {
        try {
          video.currentTime = resume.time;
        } catch {
          // Ignore seek failures on short clips.
        }
      }
      if (resume.wasPlaying) {
        video.play().catch(() => {});
      }
    };

    if (video.readyState >= 1) {
      seek();
    } else {
      video.addEventListener('loadedmetadata', seek, { once: true });
    }
  }, []);

  const maybePrimeNeighbor = useCallback(
    (video) => {
      const currentRole = roleRef.current;
      if (currentRole === 'active' || !video) return;
      stopPrime();
      stopPrimeRef.current = primeNeighborPlayback(video, { aggressive: currentRole === 'next' });
    },
    [stopPrime],
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
        resumeRef.current = {
          time: Number.isFinite(video.currentTime) ? video.currentTime : 0,
          wasPlaying: !video.paused,
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
        // Prefer a cheap start for neighbors so attach completes quickly.
        ...(currentRole !== 'active' ? { startLevel: 0 } : {}),
      });
      hlsRef.current = hls;
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, onReady);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data?.fatal) {
          markFailed();
        }
      });
      video.addEventListener('loadeddata', onReady, { once: true });
      removeReady = () => video.removeEventListener('loadeddata', onReady);
    };

    // Attach on the next frame so the <video> ref is mounted; do not add extra timers.
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
    // Skip if we already mounted as `next` (onReady primed once).
    if (role === 'next' && prevRole !== 'next' && prevRole !== 'active' && videoRef.current) {
      maybePrimeNeighbor(videoRef.current);
    }
  }, [role, stopPrime, maybePrimeNeighbor, videoRef]);

  return { sourceUrl, useHls, mode, failed, retry, markFailed, readyToken };
}
