import { type ReactNode, useEffect, useRef, useState } from 'react';

import { cn } from '@/shared/lib/cn';

import type { MediaKind } from './aspectRatios';

/** Literal class names only — Tailwind's scanner won't pick up dynamic `aspect-*` strings. Keep in sync with `aspectRatios.ts` / `@theme`. */
const ASPECT_CLASS: Record<MediaKind, string> = {
  highlight: 'aspect-highlight',
  tournamentCover: 'aspect-tournament-cover',
  shopProduct: 'aspect-shop-product',
  reelPoster: 'aspect-reel-poster',
  showPoster: 'aspect-show-poster',
  postImage: 'aspect-post-image',
  heroBanner: 'aspect-hero-banner',
  avatar: 'aspect-avatar',
};

const ROUNDED_CLASS = {
  none: '',
  sm: 'rounded-chip',
  md: 'rounded-field',
  lg: 'rounded-card',
  full: 'rounded-full',
} as const;

type MediaFrameProps = {
  kind: MediaKind;
  src: string | null | undefined;
  alt: string;
  fallbackSrc?: string | undefined;
  /** Default `cover`; use `contain` for unknown-aspect uploads. */
  fit?: 'cover' | 'contain' | undefined;
  className?: string | undefined;
  rounded?: keyof typeof ROUNDED_CLASS | undefined;
  children?: ReactNode | undefined;
  /** Fade in on load; aspect box already reserves space. */
  fade?: boolean | undefined;
  /** Eager load for above-fold / LCP. */
  priority?: boolean | undefined;
};

/** Canonical raster wrapper — one `kind` → one crop everywhere; img is absolute so decode never collapses layout. */
export function MediaFrame({
  kind,
  src,
  alt,
  fallbackSrc,
  fit = 'cover',
  className,
  rounded = 'md',
  children,
  fade = false,
  priority = false,
}: MediaFrameProps) {
  const resolvedSrc = src ?? fallbackSrc;
  const imgRef = useRef<HTMLImageElement>(null);
  // Match loaded src to resolvedSrc so a URL swap stays opaque-0 on the same render.
  const [opaqueSrc, setOpaqueSrc] = useState<string | null>(null);
  const fadedIn = !fade || opaqueSrc === resolvedSrc;

  useEffect(() => {
    if (!fade || !resolvedSrc) return;
    const el = imgRef.current;
    if (el?.complete && el.naturalWidth > 0) setOpaqueSrc(resolvedSrc);
  }, [fade, resolvedSrc]);

  return (
    <div
      className={cn('relative overflow-hidden', ASPECT_CLASS[kind], ROUNDED_CLASS[rounded], className)}
      style={{ backgroundImage: 'var(--gradient-media-placeholder)' }}
    >
      {resolvedSrc ? (
        <img
          ref={imgRef}
          src={resolvedSrc}
          alt={alt}
          className={cn(
            'absolute inset-0 h-full w-full',
            fit === 'cover' ? 'object-cover object-center' : 'object-contain',
            fade && 'transition-opacity duration-200',
            fade && !fadedIn && 'opacity-0',
            fade && fadedIn && 'opacity-100'
          )}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={fade ? () => setOpaqueSrc(resolvedSrc) : undefined}
        />
      ) : null}
      {children}
    </div>
  );
}
