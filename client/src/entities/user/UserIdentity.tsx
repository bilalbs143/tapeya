import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';
import { VerifiedBadge } from '@/shared/ui/Badge';

import { UserAvatar } from './UserAvatar';

type UserIdentityUser = {
  name: string;
  avatarUrl: string | null;
  isOfficial?: boolean | undefined;
};

type UserIdentityProps = {
  user: UserIdentityUser;
  /** Profile path from `userProfilePath` / `profileRoutes.user`. */
  to?: string | undefined;
  avatarSize?: 'xs' | 'sm' | 'md' | 'lg' | undefined;
  /** Hide the avatar (name + badge only). */
  avatar?: boolean | undefined;
  className?: string | undefined;
  nameClassName?: string | undefined;
  /** Inline after the name (e.g. comment age). */
  beside?: ReactNode;
  /** Second line under the name (e.g. post age, subtitle). */
  meta?: ReactNode;
  /** Extra content under the name block (e.g. comment body), indented with the text column. */
  children?: ReactNode;
};

/** Avatar + name (+ official badge) linking to profile. */

export function UserIdentity({
  user,
  to,
  avatarSize = 'md',
  avatar = true,
  className,
  nameClassName,
  beside,
  meta,
  children,
}: UserIdentityProps) {
  const isOfficial = Boolean(user.isOfficial);
  const nameInner = (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1">
      <span className="truncate font-bold">{user.name}</span>
      <VerifiedBadge isOfficial={isOfficial} size="sm" />
    </span>
  );

  // No `truncate` on the outer control — the name text truncates; the badge stays visible.
  const nameClass = cn('min-w-0 max-w-full text-left text-2xs leading-none text-ink', nameClassName);

  const nameRow = (
    <div className="flex min-w-0 items-center gap-1.5">
      {to ? (
        <Link
          to={to}
          onClick={(e) => e.stopPropagation()}
          className={nameClass}
          aria-label={user.name ? `View ${user.name}'s profile` : 'View profile'}
        >
          {nameInner}
        </Link>
      ) : (
        <div className={nameClass}>{nameInner}</div>
      )}
      {beside}
    </div>
  );

  return (
    <div className={cn('flex min-w-0 items-start gap-2.5', className)}>
      {avatar ? <UserAvatar user={{ name: user.name, avatarUrl: user.avatarUrl }} size={avatarSize} to={to} /> : null}
      <div className="min-w-0 flex-1">
        {nameRow}
        {meta ? <div className="mt-px">{meta}</div> : null}
        {children}
      </div>
    </div>
  );
}
