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
  const { data: me } = useMeQuery();
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
  /** Hide BottomNav while keyboard open so `--keyboard-inset` is not double-counted with nav height. */
  const keyboardOpen = keyboardInset > 0;
  const showBottomNav = !hideBottomNav && !keyboardOpen;
  /** See `FIXED_HEIGHT_SHELL_PATHS` in shared/config/paths — pin height; page owns inner scroll. */
  const fixedFrame = isFixedHeightShellPath(pathname);

  if (bare) {
    // Go-live on-air needs a transparent phone shell so the native camera underlay shows through.
    const immersiveTransparent = isLiveImmersivePath(pathname);
    return (
      <div
        className={cn(
          'relative flex h-[100dvh] flex-col overflow-hidden',
          immersiveTransparent ? 'bg-transparent' : undefined,
          className
        )}
      >
        <div className="hidden h-full tab:flex">
          <SideNav user={sideUser} />
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
    <div className={cn('bg-page flex h-[100dvh] flex-col overflow-hidden', className)}>
      <ShellTopNav user={topUser} />
      <MainDrawer />

      <div className="bg-surface flex min-h-0 flex-1 overflow-hidden">
        <SideNav className="hidden tab:flex" user={sideUser} />

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

              <aside className="border-border-subtle no-scrollbar sticky top-0 hidden w-[384px] shrink-0 flex-col gap-3.5 overflow-y-auto border-l px-3.5 py-4 desk:flex wide:w-[424px]">
                {rail ?? <SideRail />}
              </aside>
            </ShellScrollport>

            <BottomNav className={cn('tab:hidden', !showBottomNav && 'hidden')} />
          </div>
        </div>
      </div>
    </div>
  );
}
