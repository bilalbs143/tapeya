import { useEffect, useState } from 'react';

import { LiveStreamThumbnailFallback } from '@/components/live/LiveStreamThumbnailFallback';
import { LIVE_STREAM_THUMBNAIL_ASPECT_CLASS } from '@/lib/constants/streamThumbnail.constants';

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
