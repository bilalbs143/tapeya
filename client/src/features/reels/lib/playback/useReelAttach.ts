/**
 * Platform-routed reel attach hook — schedules network lock, then ios/android/web attach.
 */

import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';
import type Hls from 'hls.js';

import { applyInlineVideoAttributes } from '../inlineVideo';
import { startAndroidReelAttach } from './android/attach';
import type { ReelAttachHandle } from './attachContract';
import { startIosReelAttach } from './ios/attach';
import { beginActiveReelAttach, endActiveReelAttach, scheduleNeighborReelAttach } from './networkLock';
import { bindReelHls } from './ownerGate';
import { getReelPlaybackPlatform } from './platform';
import { resolveReelPlaybackSource } from './source';
import type { ReelAttachRole, ReelPlaybackSource } from './types';
import { hardResetVideo } from './videoReset';
import { startWebReelAttach } from './web/attach';

type Options = {
  enabled?: boolean | undefined;
  role?: ReelAttachRole | undefined;
};

export function useReelAttach(
  videoRef: RefObject<HTMLVideoElement | null>,
  playback: ReelPlaybackSource | null | undefined,
  options: Options = {}
) {
  const { enabled = true, role = 'active' } = options;
  const hlsRef = useRef<Hls | null>(null);
  const handleRef = useRef<ReelAttachHandle | null>(null);
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

  const destroyMedia = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      bindReelHls(video, null);
      hardResetVideo(video);
    }
    hlsRef.current = null;
  }, [videoRef]);

  const retry = useCallback(() => {
    setFailed(false);
    setRetryToken((n) => n + 1);
  }, []);

  // Attach / detach for the player window.
  useEffect(() => {
    if (!enabled || !sourceUrl || !mode) {
      handleRef.current?.dispose();
      handleRef.current = null;
      destroyMedia();
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
    let holdingActive = false;
    let cancelNeighbor = () => {};
    let attachRaf = 0;

    const takeHold = () => {
      if (holdingActive || roleRef.current !== 'active') return;
      holdingActive = true;
      beginActiveReelAttach();
    };

    const releaseHold = () => {
      if (!holdingActive) return;
      holdingActive = false;
      endActiveReelAttach();
    };

    const applyResume = (video: HTMLVideoElement) => {
      const time = resumeTimeRef.current;
      resumeTimeRef.current = null;
      if (time == null || !Number.isFinite(time) || time <= 0.25) return;
      const seek = () => {
        try {
          video.currentTime = time;
        } catch {
          // Ignore.
        }
      };
      if (video.readyState >= 1) seek();
      else video.addEventListener('loadedmetadata', seek, { once: true });
    };

    const runAttach = () => {
      if (cancelled) return;
      const video = videoRef.current;
      if (!video) {
        releaseHold();
        return;
      }

      takeHold();
      applyInlineVideoAttributes(video);
      setFailed(false);
      handleRef.current?.dispose();
      handleRef.current = null;

      const platform = getReelPlaybackPlatform();
      const start =
        platform === 'ios' ? startIosReelAttach : platform === 'android' ? startAndroidReelAttach : startWebReelAttach;

      handleRef.current = start({
        video,
        url: sourceUrl,
        mode,
        role: roleRef.current,
        attempt: retryToken,
        cancelled: () => cancelled,
        onReady: () => {
          if (cancelled) return;
          setReadyToken((n) => n + 1);
          releaseHold();
        },
        onError: () => {
          if (cancelled) return;
          setFailed(true);
          releaseHold();
          handleRef.current?.dispose();
          handleRef.current = null;
          destroyMedia();
        },
        onRetry: () => {
          if (cancelled) return;
          releaseHold();
          setRetryToken((n) => n + 1);
        },
        applyResume,
        bindHls: (hls) => {
          hlsRef.current = hls;
          bindReelHls(video, hls);
        },
      });
    };

    const scheduleAttach = () => {
      attachRaf = requestAnimationFrame(runAttach);
    };

    if (roleRef.current === 'active') {
      takeHold();
      scheduleAttach();
    } else {
      cancelNeighbor = scheduleNeighborReelAttach(scheduleAttach);
    }

    return () => {
      cancelled = true;
      cancelNeighbor();
      cancelAnimationFrame(attachRaf);
      releaseHold();
      handleRef.current?.dispose();
      handleRef.current = null;
      destroyMedia();
    };
  }, [videoRef, sourceUrl, mode, enabled, retryToken, destroyMedia]);

  // Promote next → active.
  useEffect(() => {
    if (!enabled) {
      prevRoleRef.current = role;
      return;
    }

    const prevRole = prevRoleRef.current;
    prevRoleRef.current = role;
    const promoted = role === 'active' && prevRole !== 'active' && sourceUrl;
    if (!promoted) return;

    if (readyToken === 0) {
      handleRef.current?.onPromote(role);
      return;
    }
    handleRef.current?.onPromote(role);
  }, [role, enabled, sourceUrl, readyToken]);

  return { sourceUrl, useHls: mode === 'hls', mode, failed, retry, readyToken };
}
