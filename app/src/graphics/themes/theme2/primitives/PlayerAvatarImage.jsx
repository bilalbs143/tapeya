import { useState } from 'react';

import { cn } from '@/lib/utils';

import { playerAvatar } from '../config';
import { isPlayerAvatarPlaceholder, resolvePlayerAvatarUrl } from './playerAvatar';

/**
 * Player photo for full-screen + LT graphics — real URL or theme placeholder.
 *
 * Plate + lining are always applied together on FS (Top Batter / Top Bowler look),
 * whether the source is a JPG, PNG, or placeholder. LT cutouts pass
 * `plate={false}` and `lining={false}` (transparent bar slot).
 *
 * @param {{
 *   src?: string|null,
 *   alt?: string,
 *   fit?: 'cover-top' | 'contain-bottom',
 *   className?: string,
 *   rounded?: boolean,
 *   lining?: boolean,
 *   plate?: boolean,
 * }} props
 */
export function PlayerAvatarImage({
  src,
  alt = 'Player avatar',
  fit = 'contain-bottom',
  className,
  rounded = false,
  lining = true,
  plate = true,
}) {
  const [failed, setFailed] = useState(false);
  const effectiveSrc = failed ? null : src;
  const resolved = resolvePlayerAvatarUrl(effectiveSrc);
  const shellClass =
    fit === 'cover-top'
      ? cn('relative size-full overflow-hidden', rounded && 'rounded-xl')
      : cn('relative flex size-full items-end justify-center overflow-hidden', rounded && 'rounded-xl');

  const coverClass = 'relative z-[1] block size-full object-cover object-top';
  const containClass = 'relative z-[1] block max-h-full max-w-full object-contain object-bottom';

  return (
    <div
      className={shellClass}
      style={plate ? { backgroundColor: playerAvatar.plate } : undefined}
      data-avatar-plate={plate ? 'theme2' : undefined}
    >
      {lining ? (
        <div
          aria-hidden
          className="absolute top-0 right-0 bottom-0 left-0"
          style={{ backgroundImage: playerAvatar.lining }}
          data-avatar-lining="theme2"
        />
      ) : null}
      <img
        src={resolved}
        alt={alt}
        draggable={false}
        onError={() => {
          if (!isPlayerAvatarPlaceholder(effectiveSrc)) setFailed(true);
        }}
        className={cn(fit === 'cover-top' ? coverClass : containClass, className)}
      />
    </div>
  );
}
