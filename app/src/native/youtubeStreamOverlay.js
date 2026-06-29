import { Capacitor, registerPlugin } from '@capacitor/core';

const YoutubeStreamOverlay = registerPlugin('YoutubeStreamOverlay');

export function isIosNativeStreamOverlayAvailable() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
}

/**
 * @param {{ url: string, x: number, y: number, width: number, height: number, reload?: boolean }} layout
 */
export async function showYoutubeStreamOverlay(layout) {
  if (!isIosNativeStreamOverlayAvailable()) {
    return { shown: false };
  }
  return YoutubeStreamOverlay.show(layout);
}

/**
 * @param {{ x: number, y: number, width: number, height: number }} layout
 */
export async function updateYoutubeStreamOverlayLayout(layout) {
  if (!isIosNativeStreamOverlayAvailable()) {
    return { updated: false };
  }
  return YoutubeStreamOverlay.updateLayout(layout);
}

export async function hideYoutubeStreamOverlay() {
  if (!isIosNativeStreamOverlayAvailable()) {
    return { hidden: false };
  }
  return YoutubeStreamOverlay.hide();
}
