import { Link, useLocation } from 'react-router-dom';

import { useLogoutMutation, useMeQuery } from '@/features/auth';

import { userCanApplyAsSeller, userHandle, userHasVendorAccess } from '@/entities/user';

import { APP_PATHS } from '@/shared/config/paths';
import { cn } from '@/shared/lib/cn';
import { useNativeAppVersions } from '@/shared/native/useNativeAppVersions';
import { Avatar } from '@/shared/ui/Avatar';
import { VerifiedBadge } from '@/shared/ui/Badge';
import { ChevronRightIcon, NAV_ICONS } from '@/shared/ui/icons';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';

import { buildNavGroups } from './navGroups';
import { NavGroupList } from './navMenu';
import { ShellPrimaryCtas } from './ShellPrimaryCtas';
import { useShell } from './useShell';

/** Phone nav drawer — desktop uses SideNav instead. */
export function MainDrawer() {
  const { drawerOpen, closeDrawer } = useShell();
  const { pathname } = useLocation();
  const { data: me } = useMeQuery();
  const [logout, { isLoading: loggingOut }] = useLogoutMutation();
  const { isNativeMobile, installedVersion, configuredVersion } = useNativeAppVersions();

  const groups = buildNavGroups({
    hasStore: userHasVendorAccess(me),
    canApplyAsSeller: userCanApplyAsSeller(me),
  });
  const handle = me ? userHandle(me) : '';
  const displayName = me?.name?.trim() || handle || 'Player';

  const stats = [
    { label: 'Matches', value: '—' },
    { label: 'Runs', value: '—' },
    { label: 'Followers', value: me ? formatCount(me.followersCount) : '—' },
  ];

  async function handleLogout() {
    closeDrawer();
    await logout().unwrap();
    window.location.assign(APP_PATHS.login);
  }

  if (!drawerOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] tab:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <button
        type="button"
        aria-label="Close Menu"
        className="bg-veil-scrim absolute inset-0 animate-overlay-in backdrop-blur-[2px]"
        onClick={closeDrawer}
      />

      <aside
        className={cn(
          'bg-page absolute inset-y-0 left-0 flex w-[min(322px,86vw)] flex-col shadow-pop',
          'animate-drawer-in'
        )}
      >
        <div className="px-4 pt-[max(25px,calc(env(safe-area-inset-top)+11px))] pb-0">
          {me ? (
            <Link to={APP_PATHS.you} onClick={closeDrawer} className="flex items-center gap-3">
              <span className="rounded-full shadow-[0_0_0_2px_var(--color-brand-hover),0_0_0_5px_var(--c-page)]">
                <Avatar src={me.avatarUrl ?? undefined} name={displayName} size="lg" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-base font-extrabold tracking-tight text-ink">{displayName}</span>
                  <VerifiedBadge isOfficial={me.isOfficial} size="md" />
                </span>
                <span className="text-navy-text mt-0.5 block truncate font-mono text-3xs">@{handle}</span>
              </span>
              <ChevronRightIcon className="text-dim h-4 w-4 shrink-0" strokeWidth={2.2} />
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <span className="bg-surface-navy text-brand-text grid h-12 w-12 place-items-center rounded-full text-base font-bold shadow-[0_0_0_2px_var(--color-brand-hover),0_0_0_5px_var(--c-page)]">
                T
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-base font-extrabold tracking-tight text-ink">Tapeya</p>
                <p className="text-muted mt-0.5 text-xs">Sign in to score and follow.</p>
              </div>
            </div>
          )}

          {me ? (
            <div className="border-border bg-surface-navy mt-3 flex rounded-panel border py-2.5">
              {stats.map((s, i) => (
                <div key={s.label} className="relative flex flex-1 flex-col items-center">
                  {i > 0 ? <span className="bg-border absolute inset-y-0 left-0 w-px" /> : null}
                  <span className="font-mono text-body-lg leading-normal font-extrabold text-ink">{s.value}</span>
                  <span className="text-dim mt-0.5 font-mono text-4xs font-semibold tracking-eyebrow uppercase">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          <ShellPrimaryCtas
            className="mt-2.5 flex gap-2"
            canBroadcast={Boolean(me?.canBroadcast)}
            onNavigate={closeDrawer}
          />
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-2.5 pt-1 pb-2 [scrollbar-width:none]">
          <NavGroupList pathname={pathname} groups={groups} onNavigate={closeDrawer} compact />
        </nav>

        <div className="border-border bg-surface-navy border-t px-4 pt-3 pb-[max(20px,env(safe-area-inset-bottom))]">
          <p className="text-dim font-mono px-0.5 pb-1.5 text-4xs font-bold tracking-eyebrow uppercase">Appearance</p>
          <ThemeToggle variant="segment" className="mb-2" />
          <div className="flex h-10 items-center gap-2 px-0.5">
            {me ? (
              <button
                type="button"
                disabled={loggingOut}
                className="text-danger-text flex min-w-0 flex-1 items-center gap-2.5 rounded-field text-body-sm font-semibold disabled:opacity-50"
                onClick={() => void handleLogout()}
              >
                {NAV_ICONS.logout}
                Log Out
              </button>
            ) : (
              <Link
                to={APP_PATHS.login}
                onClick={closeDrawer}
                className="text-brand-text flex min-w-0 flex-1 items-center gap-2.5 rounded-field text-body-sm font-semibold"
              >
                Log In
              </Link>
            )}
            {isNativeMobile ? (
              <p
                className="text-dim font-mono shrink-0 text-4xs leading-none tracking-tight tabular-nums"
                title="Installed app version | Version from system settings"
              >
                <span>{installedVersion || '—'}</span>
                <span className="text-muted px-1 select-none" aria-hidden>
                  |
                </span>
                <span>{configuredVersion || '—'}</span>
              </p>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  );
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}
