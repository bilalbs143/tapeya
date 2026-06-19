import { cn } from '@/lib/utils';

import { resolvePlayerAvatarUrl } from './playerAvatar';

const LINING_FULL_CLASS =
  'bg-[linear-gradient(180deg,rgba(30,38,62,0.35),rgba(14,19,32,0.5)),repeating-linear-gradient(135deg,rgba(120,140,255,0.06)_0_12px,transparent_12px_24px)]';

const LINING_SIMPLE_CLASS = 'bg-[linear-gradient(180deg,rgba(30,38,62,0.35),rgba(14,19,32,0.5))]';

/**
 * Player photo for full-screen graphics — real URL or theme placeholder, always on lining bg.
 *
 * @param {{
 *   src?: string|null,
 *   alt?: string,
 *   fit?: 'cover-top' | 'contain-bottom',
 *   className?: string,
 *   rounded?: boolean,
 * }} props
 */
export function PlayerAvatarImage({ src, alt = 'Player avatar', fit = 'contain-bottom', className, rounded = false }) {
  const resolved = resolvePlayerAvatarUrl(src);
  const liningClass = fit === 'cover-top' ? LINING_SIMPLE_CLASS : LINING_FULL_CLASS;
  const shellClass =
    fit === 'cover-top'
      ? cn('relative size-full overflow-hidden', rounded && 'rounded-xl')
      : cn('relative flex size-full items-end justify-center overflow-hidden', rounded && 'rounded-xl');

  const coverClass = 'relative z-[1] block size-full object-cover object-top';
  const containClass = 'relative z-[1] block max-h-full max-w-full object-contain object-bottom';

  return (
    <div className={shellClass}>
      <div aria-hidden className={cn('absolute inset-0', liningClass)} />
      <img
        src={resolved}
        alt={alt}
        draggable={false}
        className={cn(fit === 'cover-top' ? coverClass : containClass, className)}
      />
    </div>
  );
}
