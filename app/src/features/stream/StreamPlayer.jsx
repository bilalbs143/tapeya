import { useEffect } from 'react';

import { liveStreamDebugLog } from '@/features/stream/debug/liveStreamDebug';
import { IframeStreamPlayer } from './adapters/IframeStreamPlayer';
import { StreamOfflineSlate } from './StreamOfflineSlate';

const PLAYERS = {
  iframe: IframeStreamPlayer,
};

export function StreamPlayer({ stream, className = '', fill = false }) {
  useEffect(() => {
    liveStreamDebugLog('stream-player-state', {
      status: stream?.status ?? null,
      hasPlayback: Boolean(stream?.playback),
      playbackMode: stream?.playback?.mode ?? null,
      embedId: stream?.playback?.embed_id ?? null,
      embedUrl: stream?.playback?.embed_url ?? null,
    });
    if (stream?.playback?.mode && !PLAYERS[stream.playback.mode]) {
      liveStreamDebugLog('stream-player-unknown-mode', { mode: stream.playback.mode });
    }
  }, [stream?.status, stream?.playback]);

  if (!stream || !['live', 'ended'].includes(stream.status) || !stream.playback) {
    return <StreamOfflineSlate status={stream?.status} fill={fill} />;
  }

  const Player = PLAYERS[stream.playback.mode];
  if (!Player) {
    return <StreamOfflineSlate status="error" fill={fill} />;
  }

  return <Player playback={stream.playback} className={className} fill={fill} />;
}
