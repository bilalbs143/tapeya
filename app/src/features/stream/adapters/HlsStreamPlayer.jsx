import { useCallback, useEffect, useRef, useState } from 'react';

import Hls from 'hls.js';

import { useStreamVideoLoading } from '../hooks/useStreamVideoLoading';
import { StreamVideoLoading } from '../StreamVideoLoading';
import { StreamVideoRetry } from '../StreamVideoRetry';

function canPlayNativeHls(video) {
  return Boolean(video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL'));
}

/**
 * HLS playback via `<video>` (+ hls.js on non-Safari). Does not use iOS native YouTube overlay.
 */
export function HlsStreamPlayer({
  playback,
  className = '',
  fill = false,
  isLandscape: _isLandscape = false,
  posterUrl = null,
}) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const url = playback?.url?.trim() || null;
  const [isLoading, markReady] = useStreamVideoLoading(url);
  const [failed, setFailed] = useState(false);
  const boxClass = fill ? 'relative h-full w-full bg-black' : 'relative w-full aspect-video bg-black';

  const destroyPlayer = useCallback(() => {
    hlsRef.current?.destroy();
    hlsRef.current = null;

    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.pause();
    video.removeAttribute('src');
    video.load();
  }, []);

  const attachSource = useCallback(() => {
    const video = videoRef.current;
    if (!video || !url) {
      return;
    }

    setFailed(false);
    destroyPlayer();

    if (canPlayNativeHls(video)) {
      video.src = url;
      return;
    }

    if (!Hls.isSupported()) {
      setFailed(true);
      return;
    }

    const hls = new Hls({ enableWorker: true });
    hlsRef.current = hls;
    hls.loadSource(url);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) {
        setFailed(true);
      }
    });
  }, [destroyPlayer, url]);

  useEffect(() => {
    attachSource();
    return destroyPlayer;
  }, [attachSource, destroyPlayer]);

  return (
    <div className={`${boxClass} overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        className="absolute inset-0 block h-full w-full bg-black object-contain"
        title="Live Stream"
        playsInline
        autoPlay
        muted
        controls
        onCanPlay={markReady}
        onPlaying={markReady}
        onError={() => setFailed(true)}
      />
      <StreamVideoLoading
        visible={isLoading && !failed}
        posterUrl={posterUrl}
        label="Loading video…"
        hint={null}
      />
      <StreamVideoRetry visible={failed} onRetry={attachSource} />
    </div>
  );
}
