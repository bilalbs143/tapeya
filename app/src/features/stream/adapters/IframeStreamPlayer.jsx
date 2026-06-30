import { useMemo } from 'react';

import { Capacitor } from '@capacitor/core';

import { resolveYoutubeEmbed } from '@/lib/utils/liveStreamUtils';

import { useStreamVideoLoading } from '../hooks/useStreamVideoLoading';
import { StreamVideoLoading } from '../StreamVideoLoading';
import { IosNativeStreamOverlay } from './IosNativeStreamOverlay';

export function IframeStreamPlayer({ playback, className = '', fill = false, isLandscape = false }) {
  const boxClass = fill ? 'relative h-full w-full bg-black' : 'relative w-full aspect-video bg-black';
  const resolution = useMemo(
    () => resolveYoutubeEmbed(playback?.embed_url, playback?.embed_id),
    [playback?.embed_url, playback?.embed_id],
  );
  const src = resolution.iframeSrc;
  const usesNativeOverlay = Capacitor.getPlatform() === 'ios' && resolution.usesProxy;
  const [isLoading, markReady] = useStreamVideoLoading(src, { usesNativeOverlay });

  if (!src) {
    return null;
  }

  if (usesNativeOverlay) {
    return <IosNativeStreamOverlay src={src} className={className} fill={fill} isLandscape={isLandscape} />;
  }

  return (
    <div className={`${boxClass} overflow-hidden ${className}`}>
      <iframe
        className="absolute inset-0 block h-full w-full border-0"
        src={src}
        title="Live Match"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        onLoad={markReady}
      />
      <StreamVideoLoading visible={isLoading} />
    </div>
  );
}
