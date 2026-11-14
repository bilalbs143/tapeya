/** Reel HLS/progressive — roles active/next/warm; promote warm→active; upgrade progressive→HLS. */

import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

import { applyInlineVideoAttributes, setReelVideoMuted } from './inlineVideo';
import { beginActiveReelAttach, endActiveReelAttach, scheduleNeighborReelAttach } from './reelAttachPriority';
import { attachReelHls, bindReelHls } from './reelPlaybackGate';
import { reelLog, reelMark, reelSince } from './reelPlaybackLog';

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
 * Active attaches first; next/warm wait via reelAttachPriority. Play ownership lives in ReelSlide.
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
    let holdingActive = false;
    let cancelNeighborSchedule = () => {};
    let attachRaf = 0;

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

    const attach = () => {
      if (cancelled) return;
      const video = videoRef.current;
      if (!video) {
        releaseActiveHold();
        return;
      }

      const currentRole = roleRef.current;
      // Neighbor may have been promoted to active while waiting.
      takeActiveHold();

      const markKey = `attach:${currentRole}:${sourceKey}`;
      reelMark(markKey);
      reelLog('attach.start', { role: currentRole, mode, url: sourceUrl, readyState: video.readyState });

      applyInlineVideoAttributes(video);
      setFailed(false);
      destroy();

      const onError = () => {
        reelLog('attach.error', { role: currentRole, mode, url: sourceUrl, sinceMs: reelSince(markKey) });
        releaseActiveHold();
        markFailed();
      };
      const onReady = (via: string) => {
        if (cancelled || readyHandled) return;
        readyHandled = true;
        reelLog('attach.ready', {
          role: currentRole,
          mode,
          url: sourceUrl,
          via,
          sinceMs: reelSince(markKey),
          readyState: video.readyState,
        });
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

      if (mode === 'progressive') {
        const onLoaded = () => onReady('loadeddata');
        video.src = sourceUrl;
        video.addEventListener('error', onError);
        video.addEventListener('loadeddata', onLoaded, { once: true });
        removeError = () => video.removeEventListener('error', onError);
        removeReady = () => video.removeEventListener('loadeddata', onLoaded);
        return;
      }

      if (canPlayNativeHls(video)) {
        const onLoaded = () => onReady('native-hls-loadeddata');
        video.src = sourceUrl;
        video.addEventListener('error', onError);
        video.addEventListener('loadeddata', onLoaded, { once: true });
        removeError = () => video.removeEventListener('error', onError);
        removeReady = () => video.removeEventListener('loadeddata', onLoaded);
        return;
      }

      if (!Hls.isSupported()) {
        reelLog('attach.unsupported', { role: currentRole, url: sourceUrl });
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
      hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
        reelLog('hls.manifest', {
          role: currentRole,
          url: sourceUrl,
          levels: data.levels?.length ?? 0,
          sinceMs: reelSince(markKey),
        });
      });
      let fragsLogged = 0;
      hls.on(Hls.Events.FRAG_LOADED, (_e, data) => {
        if (currentRole !== 'active' || fragsLogged >= 2) return;
        fragsLogged += 1;
        reelLog('hls.frag', {
          role: currentRole,
          sn: data.frag?.sn,
          level: data.frag?.level,
          sinceMs: reelSince(markKey),
        });
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        reelLog('hls.error', {
          role: currentRole,
          fatal: data.fatal,
          type: data.type,
          details: data.details,
          sinceMs: reelSince(markKey),
        });
        if (data.fatal) markFailed();
      });

      if (currentRole === 'active') {
        const onFragBuffered = () => onReady('frag-buffered');
        const onCanPlay = () => onReady('canplay');
        const onLoaded = () => onReady('loadeddata');
        hls.on(Hls.Events.FRAG_BUFFERED, onFragBuffered);
        video.addEventListener('canplay', onCanPlay, { once: true });
        video.addEventListener('loadeddata', onLoaded, { once: true });
        removeReady = () => {
          hls.off(Hls.Events.FRAG_BUFFERED, onFragBuffered);
          video.removeEventListener('canplay', onCanPlay);
          video.removeEventListener('loadeddata', onLoaded);
        };
      } else {
        const onManifest = () => onReady('manifest-parsed');
        const onLoaded = () => onReady('loadeddata');
        hls.on(Hls.Events.MANIFEST_PARSED, onManifest);
        video.addEventListener('loadeddata', onLoaded, { once: true });
        removeReady = () => {
          hls.off(Hls.Events.MANIFEST_PARSED, onManifest);
          video.removeEventListener('loadeddata', onLoaded);
        };
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
      const neighborRole = roleRef.current === 'next' ? 'next' : 'warm';
      cancelNeighborSchedule = scheduleNeighborReelAttach(neighborRole, scheduleAttach);
    }

    return () => {
      cancelled = true;
      cancelNeighborSchedule();
      cancelAnimationFrame(attachRaf);
      removeError();
      removeReady();
      releaseActiveHold();
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
