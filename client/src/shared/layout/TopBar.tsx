import type { ComponentProps, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useLogoutMutation } from '@/features/auth';
import { useGetNotificationUnreadCountQuery } from '@/features/notifications';

import { APP_PATHS } from '@/shared/config/paths';
import { cn } from '@/shared/lib/cn';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/DropdownMenu';
import { BellIcon, CartIcon, ChevronDownIcon, MenuIcon, PlusIcon } from '@/shared/ui/icons';
import { LiveBadge } from '@/shared/ui/LiveBadge';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';

import { handleNavRootReselect, scrollShellToTop } from './shellScroll';
import { useShell } from './useShell';

/** Invisible hit target for status-bar scroll-to-top. */
function TopNavScrollHit() {
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label="Scroll to Top"
      onClick={() => scrollShellToTop('smooth')}
      className="absolute inset-0 z-0"
    />
  );
}

type TopBarUser = {
  name: string;
  avatarUrl?: string | null | undefined;
};

type TopBarProps = {
  title?: string;
  liveCount?: number;
  unread?: boolean;
  action?: ReactNode;
  className?: string;
};

type ShellTopNavProps = {
  user?: TopBarUser | null | undefined;
  action?: ReactNode;
  phone?: boolean | undefined;
  desk?: boolean | undefined;
};

type CircleIconProps = ComponentProps<'button'> & {
  dot?: boolean | undefined;
};

function CircleIcon({ className, children, dot = false, ...props }: CircleIconProps) {
  return (
    <button
      type="button"
      className={cn(
        'bg-surface-raised text-body focus-visible:outline-brand relative grid h-8 w-8 shrink-0 place-items-center rounded-full focus-visible:outline-2',
        className
      )}
      {...props}
    >
      {children}
      {dot ? (
        <span className="bg-brand-hover absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full shadow-[0_0_0_2px_var(--c-surface)]" />
      ) : null}
    </button>
  );
}

function useUnreadDot(explicit?: boolean | undefined): boolean {
  const { data } = useGetNotificationUnreadCountQuery();
  if (explicit != null) return explicit;
  return (data?.unreadCount ?? 0) > 0;
}

/** Phone shell top bar (`tab:hidden`). */
export function TopBar({ title = 'Tapeya', liveCount = 0, unread, action, className }: TopBarProps) {
  const { openDrawer } = useShell();
  const { pathname } = useLocation();
  const showUnread = useUnreadDot(unread);

  return (
    <header
      className={cn(
        'bg-surface border-border-subtle relative z-40 flex shrink-0 items-center justify-between gap-3 border-b px-3.5 pb-2.5 tab:hidden',
        // Safe-area is extra top inset; keep explicit bottom padding under the icons.
        // `min-h` + only `pt-safe` collapses bottom space on notched devices.
        'box-border pt-[max(10px,env(safe-area-inset-top))]',
        className
      )}
    >
      <TopNavScrollHit />
      <Link
        to={APP_PATHS.home}
        className="relative z-10 flex min-w-0 items-center gap-2"
        aria-label="Tapeya Home"
        onClick={(event) => handleNavRootReselect(event, pathname, APP_PATHS.home)}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-icon bg-[linear-gradient(150deg,var(--color-brand-hover),var(--color-brand-deep))] text-2xs font-extrabold text-white">
          T
        </span>
        <span className="truncate text-title-sm font-extrabold tracking-tight text-ink">{title}</span>
      </Link>

      <div className="relative z-10 flex shrink-0 items-center gap-1.5">
        {liveCount > 0 ? <LiveBadge label={`${liveCount} LIVE`} /> : null}
        {action}

        <ThemeToggle className="bg-surface-raised text-body hover:text-ink h-8 w-8 rounded-full" />

        <Link
          to={APP_PATHS.notifications}
          aria-label="Notifications"
          className="bg-surface-raised text-body focus-visible:outline-brand relative grid h-8 w-8 shrink-0 place-items-center rounded-full focus-visible:outline-2"
        >
          <BellIcon size="xs" strokeWidth={1.9} className="h-3.5 w-3.5" />
          {showUnread ? (
            <span className="bg-brand-hover absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full shadow-[0_0_0_2px_var(--c-surface)]" />
          ) : null}
        </Link>

        <CircleIcon type="button" onClick={openDrawer} aria-label="Open Menu">
          <MenuIcon size="xs" strokeWidth={2.2} className="h-3.5 w-3.5 opacity-75" />
        </CircleIcon>
      </div>
    </header>
  );
}

/** Desktop shell top bar (`tab:flex`). */
export function DesktopTopBar({
  user,
  className,
}: {
  user?: TopBarUser | null | undefined;
  className?: string | undefined;
}) {
  const [logout] = useLogoutMutation();
  const { pathname } = useLocation();
  const showUnread = useUnreadDot();

  async function handleLogout() {
    await logout().unwrap();
    window.location.assign(APP_PATHS.login);
  }

  return (
    <div className={cn('bg-brand-deep relative hidden h-16 shrink-0 items-center gap-5 px-5 pr-6 tab:flex', className)}>
      <TopNavScrollHit />
      <Link
        to={APP_PATHS.home}
        className="relative z-10 flex w-[290px] shrink-0 items-center gap-2.5"
        aria-label="Tapeya Home"
        onClick={(event) => handleNavRootReselect(event, pathname, APP_PATHS.home)}
      >
        <span className="grid h-8 w-8 place-items-center rounded-icon bg-[linear-gradient(150deg,var(--color-brand-hover),var(--color-brand-deep))] text-body-sm font-extrabold text-white">
          T
        </span>
        <span className="text-title-sm leading-normal font-extrabold tracking-tight text-white">Tapeya</span>
      </Link>

      <div className="relative z-10 flex-1" />

      <div className="relative z-10 flex shrink-0 items-center gap-2.5">
        <Link
          to={APP_PATHS.quickMatch}
          className="bg-positive hover:bg-positive-2 inline-flex min-h-9 items-center gap-2 rounded-field px-3.5 text-2xs font-bold text-white"
        >
          <PlusIcon size="xs" strokeWidth={2.2} className="h-3.5 w-3.5" />
          Score a Match
        </Link>

        <Link
          to={APP_PATHS.notifications}
          aria-label="Notifications"
          className="relative grid h-9 w-9 place-items-center rounded-field bg-white/12 text-white hover:bg-white/18"
        >
          <BellIcon size="sm" strokeWidth={1.9} className="h-4 w-4" />
          {showUnread ? (
            <span className="bg-brand-hover absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full shadow-[0_0_0_2px_var(--c-brand-deep)]" />
          ) : null}
        </Link>

        <Link
          to={APP_PATHS.shopCart}
          aria-label="Cart"
          className="relative grid h-9 w-9 place-items-center rounded-field bg-white/12 text-white hover:bg-white/18"
        >
          <CartIcon size="xs" strokeWidth={1.9} className="h-3.5 w-3.5 opacity-85" />
        </Link>

        <ThemeToggle className="h-9 w-9 rounded-field bg-white/12 text-white hover:bg-white/18 hover:text-white" />

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2.5 pl-1.5 outline-none">
              <Avatar
                src={user.avatarUrl ?? undefined}
                name={user.name}
                size="sm"
                className="bg-white/18 text-xs text-white"
              />
              <ChevronDownIcon size="xs" strokeWidth={2.2} className="h-3 w-3 text-white/75" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[220px]">
              <DropdownMenuItem asChild>
                <Link to={APP_PATHS.you}>Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={APP_PATHS.profile}>Edit Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={APP_PATHS.matches}>My Matches</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={APP_PATHS.shopOrders}>My Orders</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={APP_PATHS.support}>Support</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onSelect={() => void handleLogout()}>
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            asChild
            size="sm"
            variant="secondary"
            className="border-white/20 bg-white/12 text-white hover:bg-white/18"
          >
            <Link to={APP_PATHS.login}>Log In</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

/** Phone + desk shell bars. */
export function ShellTopNav({ user, action, phone = true, desk = true }: ShellTopNavProps) {
  return (
    <>
      {phone ? <TopBar action={action} /> : null}
      {desk ? <DesktopTopBar user={user} /> : null}
    </>
  );
}
