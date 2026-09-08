import { useEffect, useState } from 'react';

/**
 * Reel cover image — eager load, resets on URL change, falls back when missing/broken.
 *
 * @param {{
 *   src?: string | null,
 *   className?: string,
 *   fallback?: import('react').ReactNode,
 *   fetchPriority?: 'high' | 'low' | 'auto',
 * }} props
 */
export function ReelCoverImage({ src, className = 'h-full w-full object-cover', fallback = null, fetchPriority }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return fallback;
  }

  return (
    <img
      src={src}
      alt=""
      className={className}
      loading="eager"
      decoding="async"
      fetchPriority={fetchPriority}
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}
