/**
 * Attach HLS/progressive for a reel slide.
 *
 * Window is active + next only. Active owns the network until ready; next waits.
 * Neighbors must never call play() — Android + hls.js mixes audio across elements.
 * Play ownership lives in ReelSlide.
 */

import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

import { applyInlineVideoAttributes, setReelVideoMuted } from './inlineVideo';
import { beginActiveReelAttach, endActiveReelAttach, scheduleNeighborReelAttach } from './reelAttachPriority';
import { attachReelHls, bindReelHls } from './reelPlaybackGate';

const HLS_ACTIVE_BUFFER = { maxBufferLength: 12, maxMaxBufferLength: 20 };
const HLS_NEXT_BUFFER = { maxBufferLength: 10, maxMaxBufferLength: 16 };
/** iOS native HLS can sit at HAVE_METADATA + NETWORK_IDLE forever. */
const ACTIVE_ATTACH_WATCHDOG_MS = 3000;
const MAX_ATTACH_RETRIES = 2;

export type ReelHlsRole = 'active' | 'next';

function bufferForRole(role: ReelHlsRole): { maxBufferLength: number; maxMaxBufferLength: number } {
  return role === 'active' ? HLS_ACTIVE_BUFFER : HLS_NEXT_BUFFER;
}

export function isHlsUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const path = url.split('?')[0]?.toLowerCase() ?? '';
  return path.endsWith('.m3u8') || path.includes('/hls/');
}

function canPlayNativeHls(video: HTMLVideoElement): boolean {
  return Boolean(video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL'));
}

function hardResetVideo(video: HTMLVideoElement): void {
  try {
    video.pause();
  } catch {
    // Ignore.
  }
  video.removeAttribute('src');
  try {
    video.srcObject = null;
  } catch {
    // Ignore.
  }
  try {
    video.load();
  } catch {
    // Ignore load() on detached nodes.
  }
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
    if (video) hardResetVideo(video);
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

    if (video.readyState >= 1) seek();
    else video.addEventListener('loadedmetadata', seek, { once: true });
  }, []);

  // Attach / detach for the player window.
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
    let holdingActive = false;
    let cancelNeighborSchedule = () => {};
    let attachRaf = 0;
    let watchdogTimer = 0;
    const attachAttempt = retryToken;

    const takeActiveHold = () => {
      if (holdingActive || roleRef.current !== 'active') return;
      holdingActive = true;
      beginActiveReelAttach();
    };

    const releaseActiveHold = () => {
      if (!holdingActive) return;
      holdingActive = false;
      endActiveReelAttach();
    };

    const clearWatchdog = () => {
      if (!watchdogTimer) return;
      window.clearTimeout(watchdogTimer);
      watchdogTimer = 0;
    };

    const attach = () => {
      if (cancelled) return;
      const video = videoRef.current;
      if (!video) {
        releaseActiveHold();
        return;
      }

      const currentRole = roleRef.current;
      takeActiveHold();

      applyInlineVideoAttributes(video);
      setFailed(false);
      destroy();

      const onError = () => {
        clearWatchdog();
        releaseActiveHold();
        markFailed();
      };

      const onReady = () => {
        if (cancelled || readyHandled) return;
        readyHandled = true;
        clearWatchdog();
        applyResume(video);
        bumpReady();
        releaseActiveHold();
        if (roleRef.current !== 'active') {
          setReelVideoMuted(video, true);
          try {
            video.pause();
          } catch {
            // Ignore.
          }
        }
      };

      const armActiveWatchdog = () => {
        if (currentRole !== 'active') return;
        watchdogTimer = window.setTimeout(() => {
          watchdogTimer = 0;
          if (cancelled || readyHandled) return;
          releaseActiveHold();
          if (attachAttempt >= MAX_ATTACH_RETRIES) {
            markFailed();
            return;
          }
          setRetryToken((n) => n + 1);
        }, ACTIVE_ATTACH_WATCHDOG_MS);
      };

      const bindMediaReady = (extraClear?: () => void) => {
        const onLoaded = () => onReady();
        video.addEventListener('error', onError);
        video.addEventListener('loadeddata', onLoaded, { once: true });
        removeError = () => video.removeEventListener('error', onError);
        removeReady = () => {
          video.removeEventListener('loadeddata', onLoaded);
          extraClear?.();
        };
      };

      if (mode === 'progressive') {
        video.src = sourceUrl;
        bindMediaReady();
        armActiveWatchdog();
        return;
      }

      if (canPlayNativeHls(video)) {
        // destroy() already cleared src; load() after assign so WebKit actually starts.
        video.src = sourceUrl;
        try {
          video.load();
        } catch {
          // Ignore.
        }
        bindMediaReady();
        armActiveWatchdog();
        return;
      }

      if (!Hls.isSupported()) {
        setFailed(true);
        releaseActiveHold();
        return;
      }

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
        const onCanPlay = () => onReady();
        hls.on(Hls.Events.FRAG_BUFFERED, onFragBuffered);
        video.addEventListener('canplay', onCanPlay, { once: true });
        bindMediaReady(() => {
          hls.off(Hls.Events.FRAG_BUFFERED, onFragBuffered);
          video.removeEventListener('canplay', onCanPlay);
        });
        armActiveWatchdog();
      } else {
        const onManifest = () => onReady();
        hls.on(Hls.Events.MANIFEST_PARSED, onManifest);
        bindMediaReady(() => {
          hls.off(Hls.Events.MANIFEST_PARSED, onManifest);
        });
      }
    };

    const scheduleAttach = () => {
      attachRaf = requestAnimationFrame(attach);
    };

    // Claim hold sync so neighbor microtasks in this commit see an active owner.
    if (roleRef.current === 'active') {
      takeActiveHold();
      scheduleAttach();
    } else {
      cancelNeighborSchedule = scheduleNeighborReelAttach(scheduleAttach);
    }

    return () => {
      cancelled = true;
      cancelNeighborSchedule();
      cancelAnimationFrame(attachRaf);
      clearWatchdog();
      removeError();
      removeReady();
      releaseActiveHold();
      destroy();
    };
  }, [videoRef, sourceUrl, mode, enabled, retryToken, destroy, markFailed, bumpReady, applyResume]);

  // Promote next → active: refresh hls.js buffers, or re-attach if native media stalled.
  useEffect(() => {
    if (!enabled) {
      prevRoleRef.current = role;
      return;
    }

    const video = videoRef.current;
    const hls = hlsRef.current;
    const prevRole = prevRoleRef.current;
    prevRoleRef.current = role;

    const promoted = role === 'active' && prevRole !== 'active' && sourceUrl;
    if (promoted && readyToken === 0 && video) {
      const stalled =
        Boolean(video.currentSrc || video.getAttribute('src')) &&
        video.readyState < 2 &&
        video.networkState !== HTMLMediaElement.NETWORK_LOADING;
      if (stalled) {
        setRetryToken((n) => n + 1);
        return;
      }
    }

    if (!hls) return;

    const buffer = bufferForRole(role);
    hls.config.maxBufferLength = buffer.maxBufferLength;
    hls.config.maxMaxBufferLength = buffer.maxMaxBufferLength;

    if (role === 'active') {
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
  }, [role, videoRef, readyToken, enabled, sourceUrl]);

  return { sourceUrl, useHls, mode, failed, retry, readyToken };
}
