import { HlsStreamPlayer } from './adapters/HlsStreamPlayer';
import { IframeStreamPlayer } from './adapters/IframeStreamPlayer';
import { StreamOfflineSlate } from './StreamOfflineSlate';

const PLAYERS = {
  /** YouTube / embed — uses {@link IosNativeStreamOverlay} on iOS when proxied. */
  iframe: IframeStreamPlayer,
  /** HLS (.m3u8) — standard `<video>`; never uses the iOS native YouTube overlay. */
  hls: HlsStreamPlayer,
};

export function StreamPlayer({ stream, className = '', fill = false, isLandscape = false }) {
  if (!stream || !['live', 'ended'].includes(stream.status) || !stream.playback) {
    return <StreamOfflineSlate status={stream?.status} fill={fill} />;
  }

  const Player = PLAYERS[stream.playback.mode];
  if (!Player) {
    return <StreamOfflineSlate status="error" fill={fill} />;
  }

  return <Player playback={stream.playback} className={className} fill={fill} isLandscape={isLandscape} />;
}
