import { Capacitor, registerPlugin } from '@capacitor/core';

const YoutubeStreamOverlay = registerPlugin('YoutubeStreamOverlay');

/** Serialises native overlay calls so hide always completes before the next show. */
let overlayGate = Promise.resolve();

function enqueueOverlay(task) {
  const run = overlayGate.then(task);
  overlayGate = run.catch(() => {});
  return run;
}

export function isIosNativeStreamOverlayAvailable() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
}

/**
 * @param {{
 *   url: string,
 *   x: number,
 *   y: number,
 *   width: number,
 *   height: number,
 *   rotation?: number,
 *   userInteractionEnabled?: boolean,
 *   reload?: boolean,
 * }} layout
 */
export async function showYoutubeStreamOverlay(layout) {
  if (!isIosNativeStreamOverlayAvailable()) {
    return { shown: false };
  }
  return enqueueOverlay(() => YoutubeStreamOverlay.show(layout));
}

/**
 * @param {{
 *   x: number,
 *   y: number,
 *   width: number,
 *   height: number,
 *   rotation?: number,
 *   userInteractionEnabled?: boolean,
 * }} layout
 */
export async function updateYoutubeStreamOverlayLayout(layout) {
  if (!isIosNativeStreamOverlayAvailable()) {
    return { updated: false };
  }
  return enqueueOverlay(() => YoutubeStreamOverlay.updateLayout(layout));
}

export async function hideYoutubeStreamOverlay() {
  if (!isIosNativeStreamOverlayAvailable()) {
    return { hidden: false };
  }
  return enqueueOverlay(() => YoutubeStreamOverlay.hide());
}

/**
 * @returns {Promise<{ ready: boolean }>}
 */
export async function getYoutubeStreamPlayerReadyState() {
  if (!isIosNativeStreamOverlayAvailable()) {
    return { ready: false };
  }
  return YoutubeStreamOverlay.getReadyState();
}

/**
 * @param {() => void} callback
 */
export function onYoutubeStreamPlayerReady(callback) {
  if (!isIosNativeStreamOverlayAvailable()) {
    return { remove: () => {} };
  }
  return YoutubeStreamOverlay.addListener('playerReady', callback);
}
