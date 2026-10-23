import { Outlet, useLocation } from 'react-router-dom';

import { useMeQuery } from '@/features/auth';

import { userHandle } from '@/entities/user';

import { APP_PATHS, isFixedHeightShellPath, isLiveImmersivePath, isOperatorScoringPath } from '@/shared/config/paths';
import {
  BottomNav,
  MainDrawer,
  ShellProvider,
  ShellRailProvider,
  ShellScrollport,
  ShellTopNav,
  SideNav,
  SideRail,
  useShellRailValue,
} from '@/shared/layout';
import { cn } from '@/shared/lib/cn';
import { useKeyboardInset } from '@/shared/native/useKeyboardInset';
import { selectIsAuthenticated } from '@/shared/store/authSlice';
import { useAppSelector } from '@/shared/store/hooks';

type AppShellProps = {
  /** Full-bleed screens (reels) — rail stays on desktop, bottom nav overlays mobile. */
  bare?: boolean | undefined;
  className?: string | undefined;
};

/** Shell chrome by breakpoint: phone TopBar+BottomNav; tab+ SideNav; desk+ SideRail. */

export function AppShell({ bare = false, className }: AppShellProps) {
  return (
    <ShellProvider>
      <ShellRailProvider>
        <AppShellChrome bare={bare} className={className} />
      </ShellRailProvider>
    </ShellProvider>
  );
}

function AppShellChrome({ bare = false, className }: AppShellProps) {
  const { pathname } = useLocation();
  const rail = useShellRailValue();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { data: me } = useMeQuery(undefined, { skip: !isAuthenticated });
  const keyboardInset = useKeyboardInset();

  const sideUser = me
    ? {
        name: me.name ?? userHandle(me),
        handle: me.nickname,
        avatarUrl: me.avatarUrl,
      }
    : null;
  const topUser = sideUser ? { name: sideUser.name, avatarUrl: sideUser.avatarUrl } : null;

  // Create post/reel + Watch + Go Live on-air — ScreenBar owns back; no BottomNav.
  const hideBottomNav =
    pathname === APP_PATHS.create ||
    pathname.startsWith(`${APP_PATHS.create}/`) ||
    isOperatorScoringPath(pathname) ||
    isLiveImmersivePath(pathname);
  const keyboardOpen = keyboardInset > 0;
  const showBottomNav = isAuthenticated && !hideBottomNav && !keyboardOpen;
  const fixedFrame = isFixedHeightShellPath(pathname);

  if (bare) {
    // Go-live on-air needs a transparent phone shell so the native camera underlay shows through.
    const immersiveTransparent = isLiveImmersivePath(pathname);
    return (
      <div
        className={cn(
          'relative flex h-dvh flex-col overflow-hidden',
          immersiveTransparent ? 'bg-transparent' : undefined,
          className
        )}
      >
        <div className="hidden h-full tab:flex">
          {isAuthenticated ? <SideNav user={sideUser} /> : null}
          <div className="relative min-w-0 flex-1">
            <Outlet />
          </div>
        </div>
        <div
          className={cn('relative flex min-h-0 flex-1 flex-col tab:hidden', immersiveTransparent && 'bg-transparent')}
        >
          <Outlet />
          {showBottomNav ? <BottomNav overlay /> : null}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-page flex h-dvh flex-col overflow-hidden', className)}>
      {isAuthenticated ? (
        <>
          <ShellTopNav user={topUser} />
          <MainDrawer />
        </>
      ) : null}

      {/* Guest CMS/legal: no TopBar — pad the notch so ScreenBar stays layout-dumb. */}
      <div
        className={cn(
          'bg-surface flex min-h-0 flex-1 overflow-hidden',
          !isAuthenticated && 'pt-[env(safe-area-inset-top)]'
        )}
      >
        {isAuthenticated ? <SideNav className="hidden tab:flex" user={sideUser} /> : null}

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <ShellScrollport className={cn('flex min-h-0 flex-1', fixedFrame ? 'overflow-hidden' : 'overflow-y-auto')}>
              <main className="flex min-w-0 flex-1 flex-col">
                <div
                  className={cn(
                    'mx-auto flex w-full flex-1 flex-col tab:max-w-[800px]',
                    fixedFrame ? 'h-full min-h-0 overflow-hidden' : 'min-h-full'
                  )}
                >
                  <Outlet />
                </div>
              </main>

              {isAuthenticated ? (
                <aside className="border-border-subtle no-scrollbar sticky top-0 hidden w-[384px] shrink-0 flex-col gap-3.5 overflow-y-auto border-l px-3.5 py-4 desk:flex wide:w-[424px]">
                  {rail ?? <SideRail />}
                </aside>
              ) : null}
            </ShellScrollport>

            {showBottomNav ? <BottomNav className="tab:hidden" /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
