import { youtubeStreamThumbnail } from '@/lib/utils/liveStreamUtils';

import { HlsStreamPlayer } from './adapters/HlsStreamPlayer';
import { IframeStreamPlayer } from './adapters/IframeStreamPlayer';
import { StreamOfflineSlate } from './StreamOfflineSlate';

const PLAYERS = {
  /** YouTube / embed — uses {@link IosNativeStreamOverlay} on iOS when proxied. */
  iframe: IframeStreamPlayer,
  /** HLS (.m3u8) — standard `<video>`; never uses the iOS native YouTube overlay. */
  hls: HlsStreamPlayer,
};

/**
 * @param {object} props
 * @param {object|null|undefined} props.stream
 * @param {string} [props.className]
 * @param {boolean} [props.fill]
 * @param {boolean} [props.isLandscape]
 * @param {string|null} [props.posterUrl] — optional stream thumbnail; falls back to YouTube hqdefault
 */
export function StreamPlayer({ stream, className = '', fill = false, isLandscape = false, posterUrl = null }) {
  if (!stream || !['live', 'ended'].includes(stream.status) || !stream.playback) {
    return <StreamOfflineSlate status={stream?.status} fill={fill} />;
  }

  const Player = PLAYERS[stream.playback.mode];
  if (!Player) {
    return <StreamOfflineSlate status="error" fill={fill} />;
  }

  const resolvedPoster =
    (typeof posterUrl === 'string' && posterUrl.trim()) ||
    youtubeStreamThumbnail(stream.playback.embed_id) ||
    youtubeStreamThumbnail(stream.embed_id) ||
    null;

  return (
    <Player
      playback={stream.playback}
      className={className}
      fill={fill}
      isLandscape={isLandscape}
      posterUrl={resolvedPoster}
    />
  );
}
