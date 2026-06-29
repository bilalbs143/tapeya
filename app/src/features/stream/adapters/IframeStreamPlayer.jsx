import { useEffect, useMemo, useRef } from 'react';

import { liveStreamDebugLog } from '@/features/stream/debug/liveStreamDebug';
import { resolveYoutubeEmbed } from '@/lib/utils/liveStreamUtils';

export function IframeStreamPlayer({ playback, className = '', fill = false }) {
  const boxClass = fill ? 'relative h-full w-full bg-black' : 'relative w-full aspect-video bg-black';
  const resolution = useMemo(
    () => resolveYoutubeEmbed(playback?.embed_url, playback?.embed_id),
    [playback?.embed_url, playback?.embed_id],
  );
  const src = resolution.iframeSrc;
  const loggedSrcRef = useRef(null);

  useEffect(() => {
    if (loggedSrcRef.current === src && src) {
      return;
    }
    loggedSrcRef.current = src;
    if (!src) {
      liveStreamDebugLog('iframe-no-src', {
        playback,
        directEmbedUrl: resolution.directEmbedUrl,
        usesProxy: resolution.usesProxy,
        apiOrigin: resolution.apiOrigin,
      });
      return;
    }
    liveStreamDebugLog('iframe-mount', {
      src,
      playbackMode: playback?.mode ?? null,
      embedId: playback?.embed_id ?? null,
      embedUrl: playback?.embed_url ?? null,
      usesProxy: resolution.usesProxy,
    });
  }, [src, playback, resolution]);

  if (!src) {
    return null;
  }

  return (
    <div className={`${boxClass} ${className}`}>
      <iframe
        className="absolute inset-0 h-full w-full border-0"
        src={src}
        title="Live Match"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        onLoad={() => {
          liveStreamDebugLog('iframe-onload', { src });
        }}
        onError={() => {
          liveStreamDebugLog('iframe-onerror', { src });
        }}
      />
    </div>
  );
}
