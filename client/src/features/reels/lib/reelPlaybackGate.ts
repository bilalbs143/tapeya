/**
 * One reel owns playback at a time.
 *
 * Android WebView + hls.js can keep audio after pause/mute while MSE is attached.
 * Demoted players must `detachMedia()`; neighbors must never call `play()`.
 */

import type Hls from 'hls.js';

import { setReelVideoMuted } from './inlineVideo';

const videos = new Set<HTMLVideoElement>();
const hlsByVideo = new WeakMap<HTMLVideoElement, Hls>();
let owner: HTMLVideoElement | null = null;

function detach(video: HTMLVideoElement): void {
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
  try {
    if (hls.media) hls.detachMedia();
  } catch {
    // Ignore.
  }
}

export function registerReelVideo(video: HTMLVideoElement): () => void {
  videos.add(video);
  return () => {
    videos.delete(video);
    if (owner === video) owner = null;
  };
}

export function bindReelHls(video: HTMLVideoElement, hls: Hls | null): void {
  if (hls) hlsByVideo.set(video, hls);
  else hlsByVideo.delete(video);
}

/** Before play: detach the previous owner (and any still-playing sibling). */
export function claimReelPlayback(active: HTMLVideoElement): void {
  for (const video of videos) {
    if (video === active) continue;
    if (video === owner || !video.paused) detach(video);
  }
  owner = active;
}

/** Active slide leaving — drop MSE so Android cannot keep a second audio pipeline. */
export function releaseReelPlayback(video: HTMLVideoElement): void {
  if (owner === video) owner = null;
  detach(video);
}

/** Reattach after detach (active about to play). */
export function attachReelHls(video: HTMLVideoElement): void {
  const hls = hlsByVideo.get(video);
  if (!hls) return;
  try {
    if (!hls.media) hls.attachMedia(video);
    hls.startLoad(-1);
  } catch {
    // Ignore.
  }
}
