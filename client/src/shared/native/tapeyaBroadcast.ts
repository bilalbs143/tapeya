import { type PluginListenerHandle, registerPlugin } from '@capacitor/core';

import { isNativePlatform } from '@/shared/platform/platform';

/** Go-live native broadcast plugin — no-op on web; requires shell registration. §11 */

export type BroadcastOrientation = 'portrait' | 'landscape';
export type BroadcastPermission = 'granted' | 'denied';
export type BroadcastState = 'connecting' | 'live' | 'reconnecting' | 'ended' | 'error';
export type BroadcastNetworkQuality = 'good' | 'fair' | 'poor';

export type BroadcastPreviewLayout = {
  x?: number | undefined;
  y?: number | undefined;
  width?: number | undefined;
  height?: number | undefined;
  orientation?: BroadcastOrientation | undefined;
};

export type StartBroadcastOptions = {
  rtmpUrl: string;
  streamKey: string;
  orientation?: BroadcastOrientation | undefined;
  resolution?: '720p' | '1080p' | undefined;
  maxDurationSeconds?: number | undefined;
  /** Android FGS deep-link target only. */
  streamId?: string | number | undefined;
};

export type BroadcastStateEvent = {
  state: BroadcastState;
  reason?: string | undefined;
  message?: string | undefined;
};

export type BroadcastStatsEvent = {
  bitrateKbps: number;
  fps: number;
  droppedFrames: number;
  networkQuality: BroadcastNetworkQuality;
};

type TapeyaBroadcastPlugin = {
  requestPermissions: () => Promise<{ camera: BroadcastPermission; microphone: BroadcastPermission }>;
  startPreview: (options: BroadcastPreviewLayout) => Promise<{ started: boolean }>;
  updatePreviewLayout: (options: BroadcastPreviewLayout) => Promise<{ updated: boolean }>;
  stopPreview: () => Promise<{ stopped: boolean }>;
  switchCamera: () => Promise<{ switched: boolean; reason?: string }>;
  toggleMute: (options: { muted: boolean }) => Promise<{ muted: boolean }>;
  startBroadcast: (options: StartBroadcastOptions) => Promise<{ started?: boolean }>;
  stopBroadcast: () => Promise<{ stopped: boolean }>;
  resetSession?: () => Promise<{ reset: boolean }>;
  addListener: (
    event: 'broadcastStateChanged' | 'broadcastStats',
    callback: (payload: BroadcastStateEvent | BroadcastStatsEvent) => void
  ) => Promise<PluginListenerHandle>;
};

const TapeyaBroadcast = registerPlugin<TapeyaBroadcastPlugin>('TapeyaBroadcast');

export async function requestBroadcastPermissions(): Promise<{
  camera: BroadcastPermission;
  microphone: BroadcastPermission;
}> {
  if (!isNativePlatform()) return { camera: 'denied', microphone: 'denied' };
  return TapeyaBroadcast.requestPermissions();
}

export async function startBroadcastPreview(options: BroadcastPreviewLayout = {}): Promise<{ started: boolean }> {
  if (!isNativePlatform()) return { started: false };
  return TapeyaBroadcast.startPreview(options);
}

export async function updateBroadcastPreviewLayout(
  options: BroadcastPreviewLayout = {}
): Promise<{ updated: boolean }> {
  if (!isNativePlatform()) return { updated: false };
  return TapeyaBroadcast.updatePreviewLayout(options);
}

export async function stopBroadcastPreview(): Promise<{ stopped: boolean }> {
  if (!isNativePlatform()) return { stopped: false };
  return TapeyaBroadcast.stopPreview();
}

export async function switchBroadcastCamera(): Promise<{ switched: boolean; reason?: string }> {
  if (!isNativePlatform()) return { switched: false };
  return TapeyaBroadcast.switchCamera();
}

export async function setBroadcastMuted(muted: boolean): Promise<{ muted: boolean }> {
  if (!isNativePlatform()) return { muted };
  return TapeyaBroadcast.toggleMute({ muted });
}

export async function startBroadcast(options: StartBroadcastOptions): Promise<{ started?: boolean }> {
  if (!isNativePlatform()) return { started: false };
  return TapeyaBroadcast.startBroadcast(options);
}

export async function stopBroadcast(): Promise<{ stopped: boolean }> {
  if (!isNativePlatform()) return { stopped: false };
  return TapeyaBroadcast.stopBroadcast();
}

/** Rebuild native camera/GL pipeline after a failed publish (Android). No-op if unsupported. */
export async function resetBroadcastSession(): Promise<{ reset: boolean }> {
  if (!isNativePlatform() || typeof TapeyaBroadcast.resetSession !== 'function') {
    return { reset: false };
  }
  return TapeyaBroadcast.resetSession();
}

function listen(
  event: 'broadcastStateChanged' | 'broadcastStats',
  callback: (payload: BroadcastStateEvent | BroadcastStatsEvent) => void
): { remove: () => void } {
  if (!isNativePlatform()) return { remove: () => undefined };

  let handle: PluginListenerHandle | null = null;
  let removed = false;
  const pending = TapeyaBroadcast.addListener(event, callback).then((h) => {
    if (removed) {
      void h.remove();
      return;
    }
    handle = h;
  });

  return {
    remove: () => {
      removed = true;
      void pending.then(() => {
        void handle?.remove();
        handle = null;
      });
    },
  };
}

export function onBroadcastStateChanged(callback: (event: BroadcastStateEvent) => void): { remove: () => void } {
  return listen('broadcastStateChanged', (payload) => {
    callback(payload as BroadcastStateEvent);
  });
}

export function onBroadcastStats(callback: (stats: BroadcastStatsEvent) => void): { remove: () => void } {
  return listen('broadcastStats', (payload) => {
    callback(payload as BroadcastStatsEvent);
  });
}
