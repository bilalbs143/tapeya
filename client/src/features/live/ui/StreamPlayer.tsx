import { useCallback, useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

import { cn } from '@/shared/lib/cn';
import { useKeepAwake } from '@/shared/native/useKeepAwake';

import {
  isInteractiveIframePlayback,
  isYoutubeIframePlayback,
  resolveStreamIframeSrc,
  STATUS_SLATE,
} from '../lib/playback';
import { useStreamVideoLoading } from '../lib/useStreamVideoLoading';
import type { LivePlayback } from '../model/schemas';
import { StreamVideoLoading } from './StreamVideoLoading';
import { StreamVideoRetry } from './StreamVideoRetry';
import { YoutubeProxyPlayer } from './YoutubeProxyPlayer';

type StreamPlayerProps = {
  status: string;
  playback: LivePlayback | null;
  posterUrl?: string | null | undefined;
  fill?: boolean | undefined;
  className?: string | undefined;
  title?: string | undefined;
};

const PLAYBACK_ERROR_SLATE = {
  title: 'Could not play this stream',
  body: 'Check your connection and try again.',
} as const;

/** iframe (YouTube / generic) or HLS video player. */
export function StreamPlayer({
  status,
  playback,
  posterUrl = null,
  fill = false,
  className,
  title = 'Live Stream',
}: StreamPlayerProps) {
  const box = cn(fill ? 'relative h-full w-full bg-black' : 'relative aspect-video w-full bg-black', className);
  const active = ['live', 'ended'].includes(status) && Boolean(playback);
  useKeepAwake(active);

  if (!['live', 'ended'].includes(status) || !playback) {
    const slate = STATUS_SLATE[status] ?? STATUS_SLATE.idle ?? PLAYBACK_ERROR_SLATE;
    return (
      <div className={cn(box, 'grid place-items-center px-6 text-center')}>
        <div>
          <p className="text-sm font-extrabold text-white">{slate.title}</p>
          <p className="mt-1.5 text-2xs leading-relaxed text-white/70">{slate.body}</p>
        </div>
      </div>
    );
  }

  if (playback.mode === 'hls' && playback.url) {
    return <HlsPlayer key={playback.url} url={playback.url} posterUrl={posterUrl} className={box} />;
  }

  if (playback.mode === 'iframe') {
    const showControls = isInteractiveIframePlayback(playback);
    const src = resolveStreamIframeSrc(playback, { showControls });
    if (!src) return <OfflineError className={box} />;

    return (
      <div className={cn(box, 'overflow-hidden')}>
        {isYoutubeIframePlayback(playback) ? (
          <YoutubeProxyPlayer key={src} src={src} title={title} posterUrl={posterUrl} />
        ) : (
          <GenericIframePlayer key={src} src={src} title={title} posterUrl={posterUrl} />
        )}
      </div>
    );
  }

  return <OfflineError className={box} />;
}

function OfflineError({ className }: { className: string }) {
  const slate = STATUS_SLATE.error ?? PLAYBACK_ERROR_SLATE;
  return (
    <div className={cn(className, 'grid place-items-center px-6 text-center')}>
      <div>
        <p className="text-sm font-extrabold text-white">{slate.title}</p>
        <p className="mt-1.5 text-2xs leading-relaxed text-white/70">{slate.body}</p>
      </div>
    </div>
  );
}

function GenericIframePlayer({ src, title, posterUrl }: { src: string; title: string; posterUrl: string | null }) {
  const [sessionKey, setSessionKey] = useState(0);
  const [failed, setFailed] = useState(false);
  const [isLoading, markReady] = useStreamVideoLoading(failed ? null : src, {
    sessionKey,
    onError: () => setFailed(true),
  });
  const showCover = isLoading && !failed;

  return (
    <>
      <iframe
        key={sessionKey}
        className={`absolute inset-0 block h-full w-full border-0 ${showCover || failed ? 'invisible' : 'visible'}`}
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        onLoad={() => markReady()}
      />
      <StreamVideoLoading
        visible={showCover}
        posterUrl={posterUrl}
        label="Loading Video…"
        hint="Tap play on the video if it does not start automatically."
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

function canPlayNativeHls(video: HTMLVideoElement): boolean {
  return Boolean(video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL'));
}

function HlsPlayer({ url, posterUrl, className }: { url: string; posterUrl: string | null; className: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [failed, setFailed] = useState(false);
  const [session, setSession] = useState(0);
  const [isLoading, markReady] = useStreamVideoLoading(failed ? null : url, { sessionKey: session });
  const showCover = isLoading && !failed;

  const destroyPlayer = useCallback(() => {
    hlsRef.current?.destroy();
    hlsRef.current = null;
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.removeAttribute('src');
    video.load();
  }, []);

  useEffect(() => {
    if (failed) return undefined;

    let cancelled = false;
    const raf = requestAnimationFrame(() => {
      if (cancelled) return;
      const video = videoRef.current;
      if (!video || !url) return;

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
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) setFailed(true);
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      destroyPlayer();
    };
  }, [destroyPlayer, failed, session, url]);

  return (
    <div className={cn(className, 'overflow-hidden')}>
      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-contain ${showCover || failed ? 'invisible' : 'visible'}`}
        playsInline
        autoPlay
        muted
        controls
        onCanPlay={markReady}
        onPlaying={markReady}
        onError={() => setFailed(true)}
      />
      <StreamVideoLoading visible={showCover} posterUrl={posterUrl} />
      <StreamVideoRetry
        visible={failed}
        onRetry={() => {
          setFailed(false);
          setSession((n) => n + 1);
        }}
      />
    </div>
  );
}
