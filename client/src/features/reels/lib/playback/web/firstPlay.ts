/**
 * Web first-play — browser autoplay policies; MSE reattach when hls.js is bound.
 */

import { setReelVideoMuted } from '@/features/reels/lib/inlineVideo';
import { isReelsAudioUnlocked, relockReelsAudio, unlockReelsAudio } from '@/features/reels/lib/reelsAudioSession';

import { waitForMediaReady } from '../mediaReady';
import { attachReelHls, claimReelPlayback, releaseReelPlayback } from '../ownerGate';

export type WebFirstPlayOptions = {
  video: HTMLVideoElement;
  preferMuted: boolean;
  cancelled: () => boolean;
  onMutedByPolicy: () => void;
  onPlaying: () => void;
  onWaiting: () => void;
  onTimeUpdate: (progressPercent: number) => void;
  scrubbing: () => boolean;
};

export type WebFirstPlayHandle = {
  dispose: () => void;
  unmuteFromGesture: () => void;
};

export function startWebFirstPlay(options: WebFirstPlayOptions): WebFirstPlayHandle {
  const { video, preferMuted, cancelled, onMutedByPolicy, onPlaying, onWaiting, onTimeUpdate, scrubbing } = options;

  let removeMediaWait = () => {};

  const runPlay = () => {
    if (cancelled() || !video) return;
    if (!video.paused && video.readyState >= 2) return;

    setReelVideoMuted(video, preferMuted);
    void video
      .play()
      .then(() => {
        if (cancelled()) return;
        if (!video.muted) unlockReelsAudio();
      })
      .catch((err: unknown) => {
        const name = err instanceof Error ? err.name : 'unknown';
        if (cancelled() || name === 'AbortError' || video.muted) return;
        setReelVideoMuted(video, true);
        onMutedByPolicy();
        void video.play().catch(() => undefined);
      });
  };

  claimReelPlayback(video);
  attachReelHls(video);
  removeMediaWait = waitForMediaReady(video, runPlay);

  const handlePlaying = () => onPlaying();
  const handleWaiting = () => {
    if (video.readyState < 3) onWaiting();
  };
  const handleTimeUpdate = () => {
    if (scrubbing()) return;
    if (video.currentTime > 0) onPlaying();
    const dur = video.duration;
    if (!Number.isFinite(dur) || dur <= 0) return;
    onTimeUpdate((video.currentTime / dur) * 100);
  };

  video.addEventListener('playing', handlePlaying);
  video.addEventListener('waiting', handleWaiting);
  video.addEventListener('timeupdate', handleTimeUpdate);

  return {
    dispose: () => {
      removeMediaWait();
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    },
    unmuteFromGesture: () => {
      unlockReelsAudio();
      claimReelPlayback(video);
      attachReelHls(video);
      setReelVideoMuted(video, false);
      void video.play().catch(() => {
        releaseReelPlayback(video);
        relockReelsAudio();
        onMutedByPolicy();
      });
    },
  };
}

export function webPreferMutedStart(mutedByPolicy: boolean): boolean {
  return !isReelsAudioUnlocked() && mutedByPolicy;
}
