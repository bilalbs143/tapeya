import { useMemo, useState } from 'react';

import { resolveYoutubeEmbed, usesIosNativeStreamPlayer } from '@/lib/utils/liveStreamUtils';

import { useStreamVideoLoading } from '../hooks/useStreamVideoLoading';
import { StreamVideoLoading } from '../StreamVideoLoading';
import { StreamVideoRetry } from '../StreamVideoRetry';
import { IosNativeStreamOverlay } from './IosNativeStreamOverlay';

export function IframeStreamPlayer({ playback, className = '', fill = false, isLandscape = false, posterUrl = null }) {
  const boxClass = fill ? 'relative h-full w-full bg-black' : 'relative w-full aspect-video bg-black';
  const resolution = useMemo(
    () => resolveYoutubeEmbed(playback?.embed_url, playback?.embed_id),
    [playback?.embed_url, playback?.embed_id],
  );
  const src = resolution.iframeSrc;
  const usesNativeOverlay = usesIosNativeStreamPlayer() && resolution.usesProxy;
  const waitForPlaying = Boolean(resolution.usesProxy && !usesNativeOverlay);
  const [sessionKey, setSessionKey] = useState(0);
  const [failed, setFailed] = useState(false);

  // Native overlay owns its loader. While failed, pause this hook until Try again.
  const [isLoading, markReady] = useStreamVideoLoading(usesNativeOverlay || failed ? null : src, {
    waitForPlaying,
    sessionKey,
    onError: () => setFailed(true),
  });

  if (!src) {
    return null;
  }

  if (usesNativeOverlay) {
    return <IosNativeStreamOverlay src={src} className={className} fill={fill} isLandscape={isLandscape} posterUrl={posterUrl} />;
  }

  return (
    <div className={`${boxClass} overflow-hidden ${className}`}>
      <iframe
        key={sessionKey}
        className="absolute inset-0 block h-full w-full border-0"
        src={src}
        title="Live Match"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        // Direct YouTube embeds have no PLAYING callback — onLoad is the best signal.
        // Proxy iframes wait for tapeya-youtube-playing (waitForPlaying).
        onLoad={waitForPlaying ? undefined : markReady}
      />
      <StreamVideoLoading visible={isLoading && !failed} posterUrl={posterUrl} />
      <StreamVideoRetry
        visible={failed}
        onRetry={() => {
          setFailed(false);
          setSessionKey((key) => key + 1);
        }}
      />
    </div>
  );
}
