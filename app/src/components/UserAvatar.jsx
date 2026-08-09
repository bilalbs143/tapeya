/**
 * Circular player/user photo for feed, reels, comments, and similar surfaces.
 * Avatars are 3:4 portraits — cover from the top so faces stay in frame
 * instead of stretching into the circle.
 */

import { Link } from 'react-router-dom';

import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { buildCreatorProfilePath } from '@/lib/share';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/Avatar';

export const DEFAULT_USER_AVATAR = `${CLOUDFRONT_APP_BASE}/images/standard/default-avatar.png`;

const SIZE_CLASS = {
  nav: 'h-[22px] w-[22px]',
  xs: 'h-7 w-7',
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-10 w-10',
  xl: 'h-11 w-11',
  card: 'h-12 w-12',
  '2xl': 'h-24 w-24',
};

const RING_WRAP = {
  brand: 'rounded-full bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-dark))] p-[2px]',
  light: 'rounded-full bg-linear-to-br from-white via-white to-white/80 p-[1.5px] shadow-[0_2px_10px_rgba(0,0,0,0.45)]',
};

const RING_AVATAR = {
  brand: 'border-surface border-2',
  light: 'border-2 border-black',
};

function resolveAvatarSrc(src, hasCustomFallback) {
  if (typeof src === 'string' && src.trim()) return src.trim();
  if (hasCustomFallback) return undefined;
  return DEFAULT_USER_AVATAR;
}

function creatorProfilePath(userId) {
  if (userId == null || userId === '') return null;
  const numeric = Number(userId);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return buildCreatorProfilePath(numeric);
}

/**
 * @param {object} props
 * @param {string|null|undefined} [props.src]
 * @param {string} [props.name] — used for alt + profile aria-label
 * @param {string|number|null} [props.userId] — when set, links to `/reels/u/:userId`
 * @param {'nav'|'xs'|'sm'|'md'|'lg'|'xl'|'card'|'2xl'} [props.size='md']
 * @param {false|'brand'|'light'} [props.ring=false]
 * @param {import('react').ReactNode} [props.fallback] — initials (or other) instead of default photo
 * @param {string} [props.className] — outer wrapper
 * @param {string} [props.alt]
 * @param {(event: import('react').MouseEvent) => void} [props.onClick]
 */
export function UserAvatar({ src, name, userId, size = 'md', ring = false, fallback = null, className = '', alt, onClick }) {
  const sizeClass = SIZE_CLASS[size] || SIZE_CLASS.md;
  const ringKey = ring === 'brand' || ring === 'light' ? ring : null;
  const hasCustomFallback = fallback != null && fallback !== false;
  const resolvedSrc = resolveAvatarSrc(src, hasCustomFallback);
  const label = alt ?? name ?? '';
  const profilePath = creatorProfilePath(userId);

  const avatar = (
    <Avatar className={cn(sizeClass, 'shrink-0 overflow-hidden rounded-full', ringKey ? RING_AVATAR[ringKey] : null)}>
      <AvatarImage src={resolvedSrc} alt={label} className="object-cover object-top" />
      <AvatarFallback
        className={hasCustomFallback ? 'bg-white/10 text-[11px] font-semibold text-white/80' : 'bg-transparent p-0'}
      >
        {hasCustomFallback ? (
          fallback
        ) : (
          <img src={DEFAULT_USER_AVATAR} alt="" className="h-full w-full object-cover object-top" />
        )}
      </AvatarFallback>
    </Avatar>
  );

  const framed = ringKey ? <span className={cn('inline-flex shrink-0', RING_WRAP[ringKey])}>{avatar}</span> : avatar;

  const handleClick = (event) => {
    event.stopPropagation();
    onClick?.(event);
  };

  if (profilePath) {
    return (
      <Link
        to={profilePath}
        onClick={handleClick}
        className={cn('inline-flex shrink-0 rounded-full transition-opacity active:opacity-90', className)}
        aria-label={name ? `View ${name}'s profile` : 'View profile'}
      >
        {framed}
      </Link>
    );
  }

  return (
    <span className={cn('inline-flex shrink-0', className)} onClick={onClick ? handleClick : undefined}>
      {framed}
    </span>
  );
}
