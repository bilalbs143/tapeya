import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

const TAPEYA_LOGO_FULL = `${CLOUDFRONT_APP_BASE}/images/logos/tapeya-logo-white.svg`;

/**
 * Branded frame when a live stream has no thumbnail (or the image fails to load).
 */
export function LiveStreamThumbnailFallback({ compact = false, className = '' }) {
  const logoClass = compact
    ? 'relative z-10 h-auto w-[min(72%,128px)] max-w-[128px] opacity-95'
    : 'relative z-10 h-auto w-[min(78%,168px)] max-w-[168px] opacity-95 md:max-w-[184px]';

  return (
    <div
      className={`bg-surface-deep absolute inset-0 flex items-center justify-center overflow-hidden px-4 ${className}`}
      aria-hidden
    >
      <div className="from-surface-elevated via-surface-deep to-ink pointer-events-none absolute inset-0 bg-gradient-to-br" />
      <div className="bg-brand/20 pointer-events-none absolute top-1/2 left-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
      <div className="via-brand/40 pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent to-transparent" />
      <img src={TAPEYA_LOGO_FULL} alt="" className={logoClass} draggable={false} />
    </div>
  );
}
