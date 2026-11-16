/**
 * @deprecated Import from `./playback` — kept as a thin re-export for older paths.
 */
export type { ReelAttachRole as ReelHlsRole, ReelPlaybackSource, ResolvedPlayback } from './playback';
export { canPlayNativeHls, isHlsUrl, resolveReelPlaybackSource, useReelAttach as useReelHls } from './playback';
