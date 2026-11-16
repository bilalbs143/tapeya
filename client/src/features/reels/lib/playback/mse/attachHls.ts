/**
 * Shared hls.js attach used by Android + web.
 * iOS never imports this — native HLS lives in ios/attach.ts.
 */

import Hls from 'hls.js';

import type { ReelAttachRole } from '../types';
import { hlsBufferForRole, hlsNetworkRetryConfig } from './config';

type AttachMseHlsOptions = {
  video: HTMLVideoElement;
  url: string;
  role: ReelAttachRole;
  onReady: () => void;
  onFatal: () => void;
  bindHls: (hls: Hls | null) => void;
};

export type MseHlsHandle = {
  hls: Hls;
  disposeListeners: () => void;
  promote: (role: ReelAttachRole) => void;
  destroy: () => void;
};

/** After loadPolicy retries are exhausted, try startLoad a few more times before UI fail. */
const FATAL_NETWORK_RECOVERIES = 2;

export function attachMseHls(options: AttachMseHlsOptions): MseHlsHandle | null {
  const { video, url, role, onReady, onFatal, bindHls } = options;

  if (!Hls.isSupported()) return null;

  const buffer = hlsBufferForRole(role);
  const hls = new Hls({
    enableWorker: true,
    maxBufferLength: buffer.maxBufferLength,
    maxMaxBufferLength: buffer.maxMaxBufferLength,
    abrEwmaDefaultEstimate: 1_200_000,
    ...hlsNetworkRetryConfig(),
    ...(role !== 'active' ? { startLevel: 0 } : {}),
  });

  bindHls(hls);
  hls.loadSource(url);
  hls.attachMedia(video);

  let networkRecoveries = 0;
  hls.on(Hls.Events.ERROR, (_event, data) => {
    if (!data.fatal) return;
    // Transient CDN / QUIC resets — recover without tearing down first-play.
    if (data.type === Hls.ErrorTypes.NETWORK_ERROR && networkRecoveries < FATAL_NETWORK_RECOVERIES) {
      networkRecoveries += 1;
      try {
        hls.startLoad();
      } catch {
        onFatal();
      }
      return;
    }
    if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
      try {
        hls.recoverMediaError();
      } catch {
        onFatal();
      }
      return;
    }
    onFatal();
  });

  let removeReady = () => {};

  if (role === 'active') {
    const onFragBuffered = () => onReady();
    const onCanPlay = () => onReady();
    const onLoaded = () => onReady();
    hls.on(Hls.Events.FRAG_BUFFERED, onFragBuffered);
    video.addEventListener('canplay', onCanPlay, { once: true });
    video.addEventListener('error', onFatal);
    video.addEventListener('loadeddata', onLoaded, { once: true });
    removeReady = () => {
      hls.off(Hls.Events.FRAG_BUFFERED, onFragBuffered);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('error', onFatal);
      video.removeEventListener('loadeddata', onLoaded);
    };
  } else {
    const onManifest = () => onReady();
    const onLoaded = () => onReady();
    hls.on(Hls.Events.MANIFEST_PARSED, onManifest);
    video.addEventListener('error', onFatal);
    video.addEventListener('loadeddata', onLoaded, { once: true });
    removeReady = () => {
      hls.off(Hls.Events.MANIFEST_PARSED, onManifest);
      video.removeEventListener('error', onFatal);
      video.removeEventListener('loadeddata', onLoaded);
    };
  }

  return {
    hls,
    disposeListeners: removeReady,
    promote: (nextRole) => {
      const next = hlsBufferForRole(nextRole);
      hls.config.maxBufferLength = next.maxBufferLength;
      hls.config.maxMaxBufferLength = next.maxMaxBufferLength;
      if (nextRole === 'active') {
        try {
          if (!hls.media) hls.attachMedia(video);
          hls.startLoad(-1);
        } catch {
          // Ignore.
        }
      }
    },
    destroy: () => {
      removeReady();
      bindHls(null);
      hls.destroy();
    },
  };
}
