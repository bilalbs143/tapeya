import { useState } from 'react';

import { useKeepAwake } from '@/shared/native/useKeepAwake';
import { usesIosNativeYoutubePlayer } from '@/shared/native/youtubeStreamOverlay';

import { isYoutubeEmbedProxyUrl } from '../lib/playback';
import { useStreamVideoLoading } from '../lib/useStreamVideoLoading';
import { IosYoutubeOverlayPlayer } from './IosYoutubeOverlayPlayer';
import { StreamVideoLoading } from './StreamVideoLoading';
import { StreamVideoRetry } from './StreamVideoRetry';

type YoutubeProxyPlayerProps = {
  src: string;
  title: string;
  posterUrl?: string | null | undefined;
  /** Highlights / episode only. Live/watch omits → underlay, no YouTube taps. */
  controls?: boolean | undefined;
  /** Immersive Full on iOS → embed rotate/cover + immersiveFullscreen. */
  landscape?: boolean | undefined;
};

/** YouTube player — iOS native overlay when available; else iframe. */
export function YoutubeProxyPlayer({
  src,
  title,
  posterUrl = null,
  controls = false,
  landscape = false,
}: YoutubeProxyPlayerProps) {
  const waitForPlaying = isYoutubeEmbedProxyUrl(src);
  const useNative = usesIosNativeYoutubePlayer() && waitForPlaying;

  if (useNative) {
    return (
      <IosYoutubeOverlayPlayer src={src} posterUrl={posterUrl} interactive={Boolean(controls)} landscape={landscape} />
    );
  }

  return (
    <YoutubeIframePlayer
      src={src}
      title={title}
      posterUrl={posterUrl}
      waitForPlaying={waitForPlaying}
      allowTaps={Boolean(controls)}
    />
  );
}

function YoutubeIframePlayer({
  src,
  title,
  posterUrl,
  waitForPlaying,
  allowTaps,
}: {
  src: string;
  title: string;
  posterUrl: string | null;
  waitForPlaying: boolean;
  allowTaps: boolean;
}) {
  const [sessionKey, setSessionKey] = useState(0);
  const [failed, setFailed] = useState(false);
  const [isLoading, markReady] = useStreamVideoLoading(failed ? null : src, {
    waitForPlaying,
    sessionKey,
    onError: () => setFailed(true),
  });
  useKeepAwake(true);

  const showCover = isLoading && !failed;
  const showTapHint = !waitForPlaying;

  return (
    <>
      <iframe
        key={sessionKey}
        title={title}
        src={src}
        className={`absolute inset-0 h-full w-full border-0 ${showCover || failed ? 'invisible' : 'visible'} ${allowTaps ? '' : 'pointer-events-none'}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        onLoad={waitForPlaying ? undefined : () => markReady()}
      />
      <StreamVideoLoading
        visible={showCover}
        posterUrl={posterUrl}
        label={showTapHint ? 'Loading Video…' : undefined}
        hint={showTapHint ? 'Tap play on the video if it does not start automatically.' : undefined}
      />
      <StreamVideoRetry
        visible={failed}
        onRetry={() => {
          setFailed(false);
          setSessionKey((k) => k + 1);
        }}
      />
    </>
  );
}
