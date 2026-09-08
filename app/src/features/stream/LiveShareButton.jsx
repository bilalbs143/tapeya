import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

const shareIcon = `${CLOUDFRONT_APP_BASE}/images/icons/feed-share.svg`;

/**
 * Share control — uses the same feed-share icon as highlights / feed.
 */
export function LiveShareButton({ onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pointer-events-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-opacity active:opacity-80 ${className}`}
      aria-label="Share live stream"
    >
      <img src={shareIcon} alt="" className="h-3.5 w-3.5 object-contain brightness-0 invert" aria-hidden />
    </button>
  );
}
