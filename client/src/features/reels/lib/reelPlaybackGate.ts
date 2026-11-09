/**
 * Exactly one reel may own playback at a time.
 *
 * Android WebView + hls.js (MSE) can keep emitting audio after `pause()`/`muted`
 * while a MediaSource is still attached. Soft halt is not enough for a former
 * active player — we must `detachMedia()` to tear down the audio pipeline.
 */

import type Hls from 'hls.js';

import { setReelVideoMuted } from './inlineVideo';

const videos = new Set<HTMLVideoElement>();
const hlsByVideo = new WeakMap<HTMLVideoElement, Hls>();
/** The only element allowed to call `play()` / keep an audible MSE pipeline. */
let playbackOwner: HTMLVideoElement | null = null;

export function registerReelVideo(video: HTMLVideoElement): () => void {
  videos.add(video);

  // Defense: if anything starts this element without claiming, kill it immediately.
  const onPlaying = () => {
    if (playbackOwner && video !== playbackOwner) {
      killReelPlayback(video);
    }
  };
  video.addEventListener('playing', onPlaying);

  return () => {
    video.removeEventListener('playing', onPlaying);
    videos.delete(video);
    if (playbackOwner === video) playbackOwner = null;
  };
}

export function bindReelHls(video: HTMLVideoElement, hls: Hls | null): void {
  if (hls) hlsByVideo.set(video, hls);
  else hlsByVideo.delete(video);
}

function softSilence(video: HTMLVideoElement): void {
  setReelVideoMuted(video, true);
  try {
    video.pause();
  } catch {
    // Ignore.
  }
  const hls = hlsByVideo.get(video);
  if (!hls) return;
  try {
    hls.stopLoad();
  } catch {
    // Ignore.
  }
}

/**
 * Tear down MSE so Android cannot keep a second audio pipeline.
 * Safe for neighbors — `resumeReelHlsLoading` reattaches before the next play.
 */
export function killReelPlayback(video: HTMLVideoElement): void {
  setReelVideoMuted(video, true);
  try {
    video.pause();
  } catch {
    // Ignore.
  }
  try {
    video.currentTime = 0;
  } catch {
    // Ignore seek races.
  }

  const hls = hlsByVideo.get(video);
  if (!hls) return;
  try {
    hls.stopLoad();
  } catch {
    // Ignore.
  }
  try {
    if (hls.media) hls.detachMedia();
  } catch {
    // Ignore.
  }
}

/** Soft halt for warm neighbors that never entered play(). */
export function haltReelVideo(video: HTMLVideoElement): void {
  softSilence(video);
}

/**
 * Before audible play: hard-kill the previous owner and any still-playing sibling.
 * Leaves never-played warm attaches alone so prefetch buffers survive.
 */
export function claimReelPlayback(active: HTMLVideoElement): void {
  for (const video of videos) {
    if (video === active) continue;
    const isFormerOwner = video === playbackOwner;
    const stillPlaying = !video.paused;
    if (isFormerOwner || stillPlaying) {
      killReelPlayback(video);
    } else {
      softSilence(video);
    }
  }
  playbackOwner = active;
}

/** Active slide leaving — always hard-kill so Android drops MSE audio. */
export function releaseReelPlayback(video: HTMLVideoElement): void {
  if (playbackOwner === video) playbackOwner = null;
  killReelPlayback(video);
}

/** Reattach + resume segment loading after a hard kill (active about to play). */
export function resumeReelHlsLoading(video: HTMLVideoElement): void {
  const hls = hlsByVideo.get(video);
  if (!hls) return;
  try {
    if (!hls.media) hls.attachMedia(video);
    hls.startLoad(-1);
  } catch {
    // Ignore.
  }
}
