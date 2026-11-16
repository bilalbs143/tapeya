/**
 * Platform-routed active-slot play ownership for reels.
 */

import { type RefObject, useEffect, useEffectEvent, useRef } from 'react';

import { setReelVideoMuted } from '../inlineVideo';
import { androidPreferMutedStart, startAndroidFirstPlay } from './android/firstPlay';
import { iosPreferMutedStart, startIosFirstPlay } from './ios/firstPlay';
import { releaseReelPlayback } from './ownerGate';
import { getReelPlaybackPlatform } from './platform';
import { startWebFirstPlay, webPreferMutedStart } from './web/firstPlay';

type Options = {
  active: boolean;
  canPlay: boolean;
  failed: boolean;
  readyToken: number;
  sourceUrl: string | null;
  mutedByPolicy: boolean;
  scrubbingRef: RefObject<boolean>;
  onMutedByPolicy: () => void;
  onPlaying: () => void;
  onWaiting: () => void;
  onTimeUpdate: (progressPercent: number) => void;
  onBecameInactive: () => void;
};

export function useReelPlay(
  videoRef: RefObject<HTMLVideoElement | null>,
  options: Options
): { unmuteFromGesture: () => void; preferMuted: boolean } {
  const { active, canPlay, failed, readyToken, sourceUrl, mutedByPolicy, scrubbingRef } = options;

  const wasActiveRef = useRef(false);
  const playHandleRef = useRef<{ dispose: () => void; unmuteFromGesture: () => void } | null>(null);

  const platform = getReelPlaybackPlatform();
  const preferMuted =
    platform === 'ios'
      ? active
        ? iosPreferMutedStart(mutedByPolicy)
        : true
      : platform === 'android'
        ? active
          ? androidPreferMutedStart(mutedByPolicy)
          : true
        : active
          ? webPreferMutedStart(mutedByPolicy)
          : true;

  const onMutedByPolicy = useEffectEvent(options.onMutedByPolicy);
  const onPlaying = useEffectEvent(options.onPlaying);
  const onWaiting = useEffectEvent(options.onWaiting);
  const onTimeUpdate = useEffectEvent(options.onTimeUpdate);
  const onBecameInactive = useEffectEvent(options.onBecameInactive);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !canPlay) return undefined;

    let cancelled = false;

    const start = () => {
      if (cancelled || !active || failed) return;
      playHandleRef.current?.dispose();
      const opts = {
        video,
        preferMuted,
        cancelled: () => cancelled,
        onMutedByPolicy,
        onPlaying,
        onWaiting,
        onTimeUpdate,
        scrubbing: () => scrubbingRef.current,
      };
      playHandleRef.current =
        platform === 'ios'
          ? startIosFirstPlay(opts)
          : platform === 'android'
            ? startAndroidFirstPlay(opts)
            : startWebFirstPlay(opts);
    };

    if (active) {
      if (readyToken > 0 || video.readyState >= 2) start();
    } else if (wasActiveRef.current) {
      releaseReelPlayback(video);
      onBecameInactive();
    } else {
      setReelVideoMuted(video, true);
    }
    wasActiveRef.current = active;

    const onVisibility = () => {
      if (document.hidden) {
        if (active) releaseReelPlayback(video);
        return;
      }
      start();
    };

    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      playHandleRef.current?.dispose();
      playHandleRef.current = null;
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [videoRef, active, canPlay, failed, readyToken, sourceUrl, preferMuted, platform, scrubbingRef]);

  // Release MSE/audio only when leaving active or unmounting — not on readyToken refresh.
  useEffect(() => {
    if (!active) return undefined;
    const video = videoRef.current;
    return () => {
      if (video) releaseReelPlayback(video);
    };
  }, [active, videoRef, sourceUrl]);

  return {
    preferMuted,
    unmuteFromGesture: () => {
      playHandleRef.current?.unmuteFromGesture();
    },
  };
}
