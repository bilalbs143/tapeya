import { Link, useLocation } from 'react-router-dom';

import { useLogoutMutation, useMeQuery } from '@/features/auth';

import { userCanApplyAsSeller, userHasVendorAccess } from '@/entities/user';

import { APP_PATHS } from '@/shared/config/paths';
import { cn } from '@/shared/lib/cn';
import { openExternalStoreUrl } from '@/shared/native/storeLinks';
import { useStoreLinks } from '@/shared/native/useStoreLinks';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { NAV_ICONS } from '@/shared/ui/icons';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { toast } from '@/shared/ui/toast';

import { buildNavGroups } from './navGroups';
import { NavGroupList } from './navMenu';
import { ShellPrimaryCtas } from './ShellPrimaryCtas';

type SideNavUser = {
  name: string;
  handle?: string | null;
  avatarUrl?: string | null;
};

type SideNavProps = {
  className?: string;
  user?: SideNavUser | null;
};

/** Desktop grouped nav — same IA as phone drawer. Only mounted when authenticated. */
export function SideNav({ className, user }: SideNavProps) {
  const { pathname } = useLocation();
  const { data: me } = useMeQuery();
  const [logout, { isLoading: loggingOut }] = useLogoutMutation();
  const { iosStoreUrl, playStoreUrl } = useStoreLinks();
  const groups = buildNavGroups({
    hasStore: userHasVendorAccess(me),
    canApplyAsSeller: userCanApplyAsSeller(me),
  });

  async function handleLogout() {
    await logout().unwrap();
    window.location.assign(APP_PATHS.login);
  }

  function openIosStore() {
    if (iosStoreUrl) {
      openExternalStoreUrl(iosStoreUrl);
      return;
    }
    toast({ title: 'iOS App Is Coming Soon', tone: 'info' });
  }

  function openAndroidStore() {
    if (playStoreUrl) {
      openExternalStoreUrl(playStoreUrl);
      return;
    }
    toast({ title: 'Android App Is Coming Soon', tone: 'info' });
  }

  return (
    <aside
      aria-label="Primary"
      className={cn(
        'border-border-subtle bg-surface no-scrollbar flex w-[312px] shrink-0 flex-col overflow-y-auto border-r py-3',
        className
      )}
    >
      <div className="px-2.5 pb-2">
        <ShellPrimaryCtas canBroadcast={Boolean(me?.canBroadcast)} />
      </div>

      <nav className="min-h-0 flex-1 px-2.5 pt-0.5 pb-2">
        <NavGroupList pathname={pathname} groups={groups} />
      </nav>

      <div className="mt-auto shrink-0 px-2.5 pt-2">
        <div className="border-border-subtle bg-surface rounded-panel border p-3">
          <p className="text-2xs font-bold text-ink">Get the App</p>
          <p className="text-muted mt-1 text-3xs leading-relaxed text-pretty">
            Scoring, live streams and reels work best on your phone.
          </p>
          <div className="mt-2 flex gap-1.5">
            <Button type="button" variant="secondary" size="sm" className="min-w-0 flex-1" onClick={openIosStore}>
              iOS
            </Button>
            <Button type="button" variant="secondary" size="sm" className="min-w-0 flex-1" onClick={openAndroidStore}>
              Android
            </Button>
          </div>
        </div>

        <p className="text-dim font-mono mt-2.5 px-1 pb-1 text-4xs font-bold tracking-eyebrow uppercase">Appearance</p>
        <ThemeToggle variant="segment" className="mb-1" />

        <button
          type="button"
          disabled={loggingOut}
          className="text-danger-text mt-0.5 flex h-10 w-full items-center gap-2.5 rounded-field px-4 text-body-sm font-semibold disabled:opacity-50"
          onClick={() => void handleLogout()}
        >
          {NAV_ICONS.logout}
          Log Out
        </button>

        {user ? (
          <Link
            to={APP_PATHS.you}
            aria-label={`Profile, ${user.name}`}
            className="bg-page-deep border-border-subtle mt-1.5 flex items-center gap-2.5 rounded-panel border p-2.5"
          >
            <Avatar src={user.avatarUrl ?? undefined} name={user.name} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-2xs font-bold text-ink">{user.name}</span>
              {user.handle ? <span className="text-dim font-mono block truncate text-4xs">@{user.handle}</span> : null}
            </span>
          </Link>
        ) : null}
      </div>
    </aside>
  );
}
