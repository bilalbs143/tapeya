import { IframeStreamPlayer } from './adapters/IframeStreamPlayer';
import { StreamOfflineSlate } from './StreamOfflineSlate';

const PLAYERS = {
  iframe: IframeStreamPlayer,
};

export function StreamPlayer({ stream, className = '', fill = false, isLandscape = false, allowInteraction = true }) {
  if (!stream || !['live', 'ended'].includes(stream.status) || !stream.playback) {
    return <StreamOfflineSlate status={stream?.status} fill={fill} />;
  }

  const Player = PLAYERS[stream.playback.mode];
  if (!Player) {
    return <StreamOfflineSlate status="error" fill={fill} />;
  }

  return (
    <Player
      playback={stream.playback}
      className={className}
      fill={fill}
      isLandscape={isLandscape}
      allowInteraction={allowInteraction}
    />
  );
}
