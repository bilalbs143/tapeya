import { registerPlugin } from '@capacitor/core';

import { usesIosNativeStreamPlayer } from '@/lib/utils/liveStreamUtils';
import { streamDebugLog } from '@/lib/utils/streamDebugLog';

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
  streamDebugLog('NativeOverlay.show', options);
  const result = await enqueueOverlay(() => YoutubeStreamOverlay.show(options));
  streamDebugLog('NativeOverlay.show.result', result);
  return result;
}

/**
 * @param {Omit<Parameters<typeof showYoutubeStreamOverlay>[0], 'reload'> & { url?: string }} layout
 */
export async function updateYoutubeStreamOverlayLayout(layout) {
  if (!usesIosNativeStreamPlayer()) {
    return { updated: false };
  }
  streamDebugLog('NativeOverlay.updateLayout', layout);
  const result = await enqueueOverlay(() => YoutubeStreamOverlay.updateLayout(layout));
  streamDebugLog('NativeOverlay.updateLayout.result', result);
  return result;
}

export async function hideYoutubeStreamOverlay() {
  if (!usesIosNativeStreamPlayer()) {
    return { hidden: false };
  }
  streamDebugLog('NativeOverlay.hide');
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
