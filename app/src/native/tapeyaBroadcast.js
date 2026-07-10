import { registerPlugin } from '@capacitor/core';

import { isNative } from '@/platform/platform';

const TapeyaBroadcast = registerPlugin('TapeyaBroadcast');

/** Same defensive pattern as youtubeStreamOverlay.js — no-op on web instead of throwing. */

/** @returns {Promise<{ camera: 'granted'|'denied', microphone: 'granted'|'denied' }>} */
export async function requestBroadcastPermissions() {
  if (!isNative()) {
    return { camera: 'denied', microphone: 'denied' };
  }
  return TapeyaBroadcast.requestPermissions();
}

/** @param {{ x?: number, y?: number, width?: number, height?: number }} [options] */
export async function startBroadcastPreview(options = {}) {
  if (!isNative()) {
    return { started: false };
  }
  // Always front on start — ignore any legacy position arg from callers.
  return TapeyaBroadcast.startPreview({ ...options, position: 'front' });
}

/** @param {{ x?: number, y?: number, width?: number, height?: number }} options */
export async function updateBroadcastPreviewLayout(options = {}) {
  if (!isNative()) {
    return { updated: false };
  }
  return TapeyaBroadcast.updatePreviewLayout(options);
}

export async function stopBroadcastPreview() {
  if (!isNative()) {
    return { stopped: false };
  }
  return TapeyaBroadcast.stopPreview();
}

export async function switchBroadcastCamera() {
  if (!isNative()) {
    return { switched: false };
  }
  return TapeyaBroadcast.switchCamera();
}

/** @param {boolean} muted */
export async function setBroadcastMuted(muted) {
  if (!isNative()) {
    return { muted };
  }
  return TapeyaBroadcast.toggleMute({ muted });
}

/**
 * @param {{ rtmpUrl: string, streamKey: string, resolution?: '720p'|'1080p', maxDurationSeconds?: number, streamId?: string|number }} options
 * `streamId` is Android-only — used as the deep-link target for the "You're live" foreground-service notification.
 */
export async function startBroadcast(options) {
  if (!isNative()) {
    return { started: false };
  }
  return TapeyaBroadcast.startBroadcast(options);
}

export async function stopBroadcast() {
  if (!isNative()) {
    return { stopped: false };
  }
  return TapeyaBroadcast.stopBroadcast();
}

/**
 * @param {(state: { state: 'connecting'|'live'|'reconnecting'|'ended'|'error', reason?: string, message?: string }) => void} callback
 */
export function onBroadcastStateChanged(callback) {
  if (!isNative()) {
    return { remove: () => {} };
  }
  return TapeyaBroadcast.addListener('broadcastStateChanged', callback);
}

/**
 * @param {(stats: { bitrateKbps: number, fps: number, droppedFrames: number, networkQuality: 'good'|'fair'|'poor' }) => void} callback
 */
export function onBroadcastStats(callback) {
  if (!isNative()) {
    return { remove: () => {} };
  }
  return TapeyaBroadcast.addListener('broadcastStats', callback);
}
