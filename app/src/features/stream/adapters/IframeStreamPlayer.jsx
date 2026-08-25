import { useMemo, useState } from 'react';

import { resolveStreamIframeSrc, usesIosNativeStreamPlayer } from '@/lib/utils/liveStreamUtils';

import { useStreamVideoLoading } from '../hooks/useStreamVideoLoading';
import { StreamVideoLoading } from '../StreamVideoLoading';
import { StreamVideoRetry } from '../StreamVideoRetry';
import { IosNativeStreamOverlay } from './IosNativeStreamOverlay';

export function IframeStreamPlayer({
  playback,
  className = '',
  fill = false,
  isLandscape = false,
  posterUrl = null,
  showControls = false,
  /**
   * iOS native only. Defaults to showControls.
   * Live keeps `false` so native stays under Capacitor (React chrome tappable).
   * Highlights portrait VOD passes `true` so YouTube seek/play work.
   */
  interactive = showControls,
  title = 'Live Match',
}) {
  const boxClass = fill ? 'relative h-full w-full bg-black' : 'relative w-full aspect-video bg-black';
  const resolution = useMemo(
    () => resolveStreamIframeSrc(playback, { showControls }),
    [playback, playback?.embed_url, playback?.embed_id, showControls],
  );
  const src = resolution.iframeSrc;
  const usesNativeOverlay = usesIosNativeStreamPlayer() && resolution.usesProxy;
  const waitForPlaying = Boolean(resolution.usesProxy && !usesNativeOverlay);
  const showTapToPlayHint = !waitForPlaying;
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
    return (
      <IosNativeStreamOverlay
        src={src}
        className={className}
        fill={fill}
        isLandscape={isLandscape}
        posterUrl={posterUrl}
        showControls={showControls}
        interactive={interactive}
      />
    );
  }

  return (
    <div className={`${boxClass} overflow-hidden ${className}`}>
      <iframe
        key={sessionKey}
        className="absolute inset-0 block h-full w-full border-0"
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        // Proxy embeds wait for PLAYING; direct iframes clear on load so play buttons stay tappable.
        onLoad={waitForPlaying ? undefined : markReady}
      />
      <StreamVideoLoading
        visible={isLoading && !failed}
        posterUrl={posterUrl}
        label={showTapToPlayHint ? 'Loading video…' : undefined}
        hint={showTapToPlayHint ? 'Tap play on the video if it does not start automatically.' : undefined}
      />
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
