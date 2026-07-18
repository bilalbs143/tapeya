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

/**
 * @param {{ x?: number, y?: number, width?: number, height?: number, orientation?: 'portrait'|'landscape' }} [options]
 * `orientation` drives the native mixer capture orientation so the landscape preview/encode is
 * upright. Camera facing is fully native-owned (front on first open in a session, preserved across
 * any later call — see `TapeyaBroadcastPlugin`'s `hasStartedPreviewOnce`); this call never
 * specifies one.
 */
export async function startBroadcastPreview(options = {}) {
  if (!isNative()) {
    return { started: false };
  }
  return TapeyaBroadcast.startPreview(options);
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
 * @param {{ rtmpUrl: string, streamKey: string, orientation?: 'portrait'|'landscape', resolution?: '720p'|'1080p', maxDurationSeconds?: number, streamId?: string|number }} options
 * `orientation` selects portrait 9:16 vs landscape 16:9 encode tiers (docs/LIVE_STREAM_ORIENTATION.md).
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

/** Rebuild native camera/GL pipeline after a failed publish (Android). No-op if unsupported. */
export async function resetBroadcastSession() {
  if (!isNative() || typeof TapeyaBroadcast.resetSession !== 'function') {
    return { reset: false };
  }
  return TapeyaBroadcast.resetSession();
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
