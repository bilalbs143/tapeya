import { registerPlugin } from '@capacitor/core';

import { usesIosNativeStreamPlayer } from '@/lib/utils/liveStreamUtils';

const YoutubeStreamOverlay = registerPlugin('YoutubeStreamOverlay');

/** Serialises native overlay calls so hide always completes before the next show. */
let overlayGate = Promise.resolve();

function enqueueOverlay(task) {
  const run = overlayGate.then(task);
  overlayGate = run.catch(() => {});
  return run;
}

/**
 * @param {{
 *   url: string,
 *   x?: number,
 *   y?: number,
 *   width?: number,
 *   height?: number,
 *   userInteractionEnabled?: boolean,
 *   underlay?: boolean,
 *   immersiveFullscreen?: boolean,
 *   updateFrame?: boolean,
 *   reload?: boolean,
 * }} options
 */
export async function showYoutubeStreamOverlay(options) {
  if (!usesIosNativeStreamPlayer()) {
    return { shown: false };
  }
  return enqueueOverlay(() => YoutubeStreamOverlay.show(options));
}

/**
 * @param {Omit<Parameters<typeof showYoutubeStreamOverlay>[0], 'reload'> & { url?: string }} layout
 */
export async function updateYoutubeStreamOverlayLayout(layout) {
  if (!usesIosNativeStreamPlayer()) {
    return { updated: false };
  }
  return enqueueOverlay(() => YoutubeStreamOverlay.updateLayout(layout));
}

export async function hideYoutubeStreamOverlay() {
  if (!usesIosNativeStreamPlayer()) {
    return { hidden: false };
  }
  return enqueueOverlay(() => YoutubeStreamOverlay.hide());
}

export async function getYoutubeStreamPlayerReadyState() {
  if (!usesIosNativeStreamPlayer()) {
    return { ready: false };
  }
  return YoutubeStreamOverlay.getReadyState();
}

export function onYoutubeStreamPlayerReady(callback) {
  if (!usesIosNativeStreamPlayer()) {
    return { remove: () => {} };
  }
  return YoutubeStreamOverlay.addListener('playerReady', callback);
}

export function onYoutubeStreamPlayerPlaying(callback) {
  if (!usesIosNativeStreamPlayer()) {
    return { remove: () => {} };
  }
  return YoutubeStreamOverlay.addListener('playerPlaying', callback);
}

export function onYoutubeStreamPlayerError(callback) {
  if (!usesIosNativeStreamPlayer()) {
    return { remove: () => {} };
  }
  return YoutubeStreamOverlay.addListener('playerError', callback);
}
