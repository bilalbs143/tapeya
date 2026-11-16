import type Hls from 'hls.js';

import type { ReelAttachRole, ReelPlaybackMode } from './types';

export const ACTIVE_ATTACH_WATCHDOG_MS = 3000;
export const MAX_ATTACH_RETRIES = 2;

export type StartReelAttachOptions = {
  video: HTMLVideoElement;
  url: string;
  mode: ReelPlaybackMode;
  role: ReelAttachRole;
  attempt: number;
  cancelled: () => boolean;
  onReady: () => void;
  onError: () => void;
  onRetry: () => void;
  applyResume: (video: HTMLVideoElement) => void;
  bindHls: (hls: Hls | null) => void;
};

export type ReelAttachHandle = {
  dispose: () => void;
  /** Role flipped next→active while this attach is live. */
  onPromote: (role: ReelAttachRole) => void;
};
