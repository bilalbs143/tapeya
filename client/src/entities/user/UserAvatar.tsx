import type { MouseEventHandler } from 'react';
import { Link } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';
import { MediaFrame } from '@/shared/ui/media';

import type { UserSummary } from './types';

type UserAvatarProps = {
  user: Pick<UserSummary, 'name' | 'avatarUrl'>;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** When set, avatar opens the public profile (stopPropagation so parent cards don’t steal the tap). */
  to?: string | undefined;
  className?: string | undefined;
  onClick?: MouseEventHandler<HTMLElement> | undefined;
};

const SIZE_CLASS = { xs: 'w-5', sm: 'w-6', md: 'w-10', lg: 'w-16' } as const;

/** Circular avatar; prefer `to={userProfilePath(...)}` so links share one URL rule. */

export function UserAvatar({ user, size = 'md', to, className, onClick }: UserAvatarProps) {
  const label = user.name ? `View ${user.name}'s profile` : 'View profile';
  const shellClass = cn('inline-flex shrink-0 overflow-hidden rounded-full', SIZE_CLASS[size], className);
  const frame = (
    <MediaFrame kind="avatar" src={user.avatarUrl} alt={user.name ?? 'User'} rounded="full" className="size-full" />
  );

  const handleClick: MouseEventHandler<HTMLElement> = (event) => {
    event.stopPropagation();
    onClick?.(event);
  };

  if (to) {
    return (
      <Link
        to={to}
        onClick={handleClick}
        className={cn(shellClass, 'transition-opacity active:opacity-90')}
        aria-label={label}
      >
        {frame}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={handleClick} className={cn(shellClass, 'p-0')} aria-label={label}>
        {frame}
      </button>
    );
  }

  return <span className={shellClass}>{frame}</span>;
}
