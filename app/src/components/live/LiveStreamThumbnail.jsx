import { useEffect, useState } from 'react';

import { LiveStreamThumbnailFallback } from '@/components/live/LiveStreamThumbnailFallback';

/** Matches admin upload guidance (360×185). */
export const LIVE_STREAM_THUMBNAIL_ASPECT_CLASS = 'aspect-[360/185]';

/** Home carousel — slightly taller and narrower than hub cards. */
export const LIVE_STREAM_SLIDER_ASPECT_CLASS = 'aspect-[300/200]';

/**
 * Fixed-aspect broadcast thumbnail frame. Images are center-cropped with object-cover.
 */
export function LiveStreamThumbnail({
  src,
  alt = '',
  className = '',
  imageClassName = '',
  placeholder = null,
  eager = false,
  compactFallback = false,
  aspectClass = LIVE_STREAM_THUMBNAIL_ASPECT_CLASS,
}) {
  const trimmed = src?.trim() || '';
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [trimmed]);

  const showPlaceholder = !trimmed || failed;
  const fallback = placeholder ?? <LiveStreamThumbnailFallback compact={compactFallback} />;

  return (
    <div className={`bg-surface-deep relative w-full overflow-hidden ${aspectClass} ${className}`}>
      {showPlaceholder ? (
        fallback
      ) : (
        <img
          src={trimmed}
          alt={alt}
          className={`absolute inset-0 h-full w-full object-cover object-center ${imageClassName}`}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          draggable={false}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
