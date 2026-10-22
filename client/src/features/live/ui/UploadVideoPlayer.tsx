import { useState } from 'react';

import { useStreamVideoLoading } from '../lib/useStreamVideoLoading';
import { StreamVideoLoading } from './StreamVideoLoading';
import { StreamVideoRetry } from './StreamVideoRetry';

type UploadVideoPlayerProps = {
  src: string;
  posterUrl?: string | null | undefined;
  className?: string | undefined;
};

/** CMS upload video with the same connecting / retry chrome as stream players. */
export function UploadVideoPlayer({ src, posterUrl = null, className }: UploadVideoPlayerProps) {
  const [sessionKey, setSessionKey] = useState(0);
  const [failed, setFailed] = useState(false);
  const [isLoading, markReady] = useStreamVideoLoading(failed ? null : src, { sessionKey });
  const showCover = isLoading && !failed;

  return (
    <>
      {/* CMS uploads rarely ship captions. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        key={sessionKey}
        src={src}
        className={`${className ?? 'absolute inset-0 h-full w-full object-contain'} ${showCover || failed ? 'invisible' : 'visible'}`}
        controls
        autoPlay
        playsInline
        onCanPlay={markReady}
        onPlaying={markReady}
        onError={() => setFailed(true)}
      />
      <StreamVideoLoading
        visible={showCover}
        posterUrl={posterUrl}
        label="Loading Video…"
        hint="This usually takes a few seconds."
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
