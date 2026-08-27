import { useEffect } from 'react';

import { isInteractiveIframePlayback, youtubeStreamThumbnail } from '@/lib/utils/liveStreamUtils';
import { streamDebugLog } from '@/lib/utils/streamDebugLog';

import { HlsStreamPlayer } from './adapters/HlsStreamPlayer';
import { IframeStreamPlayer } from './adapters/IframeStreamPlayer';
import { StreamOfflineSlate } from './StreamOfflineSlate';

const PLAYERS = {
  /** YouTube / embed — iOS uses native WKWebView overlay; Android/web use iframe (+ proxy on Capacitor). */
  iframe: IframeStreamPlayer,
  /** HLS (.m3u8) — standard `<video>`. */
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
  const interactiveIframe = stream?.playback ? isInteractiveIframePlayback(stream.playback) : false;

  useEffect(() => {
    if (!stream || !['live', 'ended'].includes(stream.status) || !stream.playback) {
      return;
    }
    streamDebugLog('StreamPlayer', {
      status: stream.status,
      playback: stream.playback,
      interactiveIframe,
    });
  }, [stream, interactiveIframe]);

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
      showControls={interactiveIframe}
      interactive={interactiveIframe}
    />
  );
}
