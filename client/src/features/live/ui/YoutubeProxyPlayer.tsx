import { useState } from 'react';

import { useKeepAwake } from '@/shared/native/useKeepAwake';

import { isYoutubeEmbedProxyUrl } from '../lib/playback';
import { useStreamVideoLoading } from '../lib/useStreamVideoLoading';
import { StreamVideoLoading } from './StreamVideoLoading';
import { StreamVideoRetry } from './StreamVideoRetry';

type YoutubeProxyPlayerProps = {
  src: string;
  title: string;
  posterUrl?: string | null | undefined;
};

/** YouTube player — wait for PLAYING (proxy) / load (direct); cover hides embed spinners. */
export function YoutubeProxyPlayer({ src, title, posterUrl = null }: YoutubeProxyPlayerProps) {
  const waitForPlaying = isYoutubeEmbedProxyUrl(src);
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
        className={`absolute inset-0 h-full w-full border-0 ${showCover || failed ? 'invisible' : 'visible'}`}
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
