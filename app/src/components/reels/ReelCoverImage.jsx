import { useEffect, useRef, useState } from 'react';

/**
 * Reel cover image — eager load, keeps the previous frame visible until the
 * next URL is ready (avoids a black flash when the server poster replaces the client still).
 *
 * @param {{
 *   src?: string | null,
 *   className?: string,
 *   fallback?: import('react').ReactNode,
 *   fetchPriority?: 'high' | 'low' | 'auto',
 * }} props
 */
export function ReelCoverImage({ src, className = 'h-full w-full object-cover', fallback = null, fetchPriority }) {
  const [shownSrc, setShownSrc] = useState(src || null);
  const [failed, setFailed] = useState(false);
  const pendingSrcRef = useRef(null);
  const shownSrcRef = useRef(shownSrc);
  shownSrcRef.current = shownSrc;

  useEffect(() => {
    setFailed(false);

    if (!src) {
      pendingSrcRef.current = null;
      setShownSrc(null);
      return undefined;
    }

    if (src === shownSrcRef.current) {
      pendingSrcRef.current = null;
      return undefined;
    }

    // First paint: show immediately (no previous cover to preserve).
    if (!shownSrcRef.current) {
      setShownSrc(src);
      return undefined;
    }

    pendingSrcRef.current = src;
    let cancelled = false;
    const img = new Image();
    img.decoding = 'async';
    const commit = () => {
      if (cancelled || pendingSrcRef.current !== src) return;
      setShownSrc(src);
      pendingSrcRef.current = null;
    };
    img.onload = commit;
    img.onerror = () => {
      if (cancelled || pendingSrcRef.current !== src) return;
      // Keep the previous cover rather than flashing empty.
      pendingSrcRef.current = null;
    };
    img.src = src;
    if (img.complete) commit();

    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!shownSrc || failed) {
    return fallback;
  }

  return (
    <img
      src={shownSrc}
      alt=""
      className={`${className} transition-opacity duration-300`}
      loading="eager"
      decoding="async"
      fetchPriority={fetchPriority}
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}
