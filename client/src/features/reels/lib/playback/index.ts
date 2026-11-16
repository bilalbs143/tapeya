/** Reel playback — shared helpers + platform-routed hooks. */

export { canPlayNativeHls } from './ios/canNative';
export {
  beginActiveReelAttach,
  endActiveReelAttach,
  getActiveReelAttachBusy,
  resetReelAttachPriorityForTests,
  scheduleNeighborReelAttach,
  whenActiveReelAttachIdle,
} from './networkLock';
export { attachReelHls, bindReelHls, claimReelPlayback, registerReelVideo, releaseReelPlayback } from './ownerGate';
export { getReelPlaybackPlatform } from './platform';
export { isHlsUrl, resolveReelPlaybackSource } from './source';
export type {
  ReelAttachRole,
  ReelPlaybackMode,
  ReelPlaybackPlatform,
  ReelPlaybackSource,
  ResolvedPlayback,
} from './types';
export { useReelAttach } from './useReelAttach';
export { useReelPlay } from './useReelPlay';
