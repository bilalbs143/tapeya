import { Link, useLocation } from 'react-router-dom';

import { useLogoutMutation } from '@/features/auth';

import { APP_PATHS } from '@/shared/config/paths';
import { cn } from '@/shared/lib/cn';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { NAV_ICONS } from '@/shared/ui/icons';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { toast } from '@/shared/ui/toast';

import { buildNavGroups } from './navGroups';
import { NavGroupList } from './navMenu';

type SideNavUser = {
  name: string;
  handle?: string | null;
  avatarUrl?: string | null;
};

type SideNavProps = {
  className?: string;
  user?: SideNavUser | null;
};

/** Desktop grouped nav — same IA as phone drawer. */
export function SideNav({ className, user }: SideNavProps) {
  const { pathname } = useLocation();
  const [logout, { isLoading: loggingOut }] = useLogoutMutation();
  const groups = buildNavGroups();

  async function handleLogout() {
    await logout().unwrap();
    window.location.assign(APP_PATHS.login);
  }

  return (
    <aside
      aria-label="Primary"
      className={cn(
        'border-border-subtle bg-surface no-scrollbar flex w-[312px] shrink-0 flex-col overflow-y-auto border-r py-3',
        className
      )}
    >
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
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="min-w-0 flex-1"
              onClick={() => toast({ title: 'iOS App Is Coming Soon', tone: 'info' })}
            >
              iOS
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="min-w-0 flex-1"
              onClick={() => toast({ title: 'Android App Is Coming Soon', tone: 'info' })}
            >
              Android
            </Button>
          </div>
        </div>

        <p className="text-dim font-mono mt-2.5 px-1 pb-1 text-4xs font-bold tracking-eyebrow uppercase">Appearance</p>
        <ThemeToggle variant="segment" className="mb-1" />

        {user ? (
          <button
            type="button"
            disabled={loggingOut}
            className="text-danger-text mt-0.5 flex h-10 w-full items-center gap-2.5 rounded-field px-4 text-body-sm font-semibold disabled:opacity-50"
            onClick={() => void handleLogout()}
          >
            {NAV_ICONS.logout}
            Log Out
          </button>
        ) : (
          <Link
            to={APP_PATHS.login}
            className="text-brand-text mt-0.5 flex h-10 w-full items-center gap-2.5 rounded-field px-4 text-body-sm font-semibold"
          >
            Log In
          </Link>
        )}

        <Link
          to={APP_PATHS.you}
          aria-label={user?.name ? `Profile, ${user.name}` : 'Your profile'}
          className="bg-page-deep border-border-subtle mt-1.5 flex items-center gap-2.5 rounded-panel border p-2.5"
        >
          <Avatar src={user?.avatarUrl ?? undefined} name={user?.name ?? 'You'} size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-2xs font-bold text-ink">{user?.name ?? 'You'}</span>
            {user?.handle ? <span className="text-dim font-mono block truncate text-4xs">@{user.handle}</span> : null}
          </span>
        </Link>
      </div>
    </aside>
  );
}
