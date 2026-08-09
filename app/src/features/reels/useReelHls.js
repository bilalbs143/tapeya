/**
 * Attach progressive original or HLS to a video element for reel playback.
 * Pass enabled=false outside the player window to destroy the player.
 *
 * `role`: warm neighbors attach with a ~2s buffer; active is promoted in place
 * (config bump only — never destroy on warm→active).
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
const HLS_WARM_BUFFER = { maxBufferLength: 2, maxMaxBufferLength: 4 };

function isHlsUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const path = url.split('?')[0].toLowerCase();
  return path.endsWith('.m3u8') || path.includes('/hls/');
}

function canPlayNativeHls(video) {
  return Boolean(video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL'));
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
 * @param {{ enabled?: boolean, role?: 'active'|'warm' }} [options]
 */
export function useReelHls(videoRef, playback, options = {}) {
  const { enabled = true, role = 'active' } = options;
  const hlsRef = useRef(null);
  const roleRef = useRef(role);
  const resumeRef = useRef(null);
  const sourceKeyRef = useRef(null);
  roleRef.current = role;
  const [failed, setFailed] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [readyToken, setReadyToken] = useState(0);

  const { url: sourceUrl, mode } = resolveReelPlaybackSource(playback);
  const useHls = mode === 'hls';

  const destroy = useCallback(() => {
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

  const applyResume = useCallback((video) => {
    const resume = resumeRef.current;
    resumeRef.current = null;
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
      const onCanPlay = () => {
        applyResume(video);
        bumpReady();
      };

      if (mode === 'progressive') {
        video.src = sourceUrl;
        video.addEventListener('error', onError);
        video.addEventListener('canplay', onCanPlay, { once: true });
        removeError = () => video.removeEventListener('error', onError);
        removeReady = () => video.removeEventListener('canplay', onCanPlay);
        return;
      }

      if (canPlayNativeHls(video)) {
        video.src = sourceUrl;
        video.addEventListener('error', onError);
        video.addEventListener('canplay', onCanPlay, { once: true });
        removeError = () => video.removeEventListener('error', onError);
        removeReady = () => video.removeEventListener('canplay', onCanPlay);
        return;
      }

      if (!Hls.isSupported()) {
        setFailed(true);
        return;
      }

      const warm = roleRef.current === 'warm';
      const buffer = warm ? HLS_WARM_BUFFER : HLS_ACTIVE_BUFFER;
      const hls = new Hls({
        enableWorker: true,
        maxBufferLength: buffer.maxBufferLength,
        maxMaxBufferLength: buffer.maxMaxBufferLength,
        abrEwmaDefaultEstimate: 1_200_000,
        ...(warm ? { startLevel: 0 } : {}),
      });
      hlsRef.current = hls;
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (!cancelled) {
          applyResume(video);
          bumpReady();
        }
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data?.fatal) {
          markFailed();
        }
      });
      video.addEventListener('canplay', onCanPlay, { once: true });
      removeReady = () => video.removeEventListener('canplay', onCanPlay);
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

  // Promote warm → active without destroy/recreate (the snap we must not stall).
  useEffect(() => {
    const hls = hlsRef.current;
    if (!hls || role !== 'active') return;
    hls.config.maxBufferLength = HLS_ACTIVE_BUFFER.maxBufferLength;
    hls.config.maxMaxBufferLength = HLS_ACTIVE_BUFFER.maxMaxBufferLength;
    try {
      hls.currentLevel = -1;
    } catch {
      // Native / detached instances may not expose currentLevel.
    }
  }, [role]);

  return { sourceUrl, useHls, mode, failed, retry, markFailed, readyToken };
}
