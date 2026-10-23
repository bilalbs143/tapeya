import { Link } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';
import { NAV_ICONS, ScoreboardIcon } from '@/shared/ui/icons';

type ShellPrimaryCtasProps = {
  canBroadcast: boolean;
  onNavigate?: (() => void) | undefined;
  className?: string | undefined;
};

/**
 * Drawer / SideNav quick actions: Go Live when `can_broadcast`, otherwise Shop;
 * Score always sits beside it.
 */
export function ShellPrimaryCtas({ canBroadcast, onNavigate, className }: ShellPrimaryCtasProps) {
  return (
    <div className={className ?? 'flex gap-2'}>
      {canBroadcast ? (
        <Link
          to={APP_PATHS.goLive}
          onClick={onNavigate}
          className="bg-positive inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-field text-2xs font-bold text-white"
        >
          {NAV_ICONS.live}
          Go Live
        </Link>
      ) : (
        <Link
          to={APP_PATHS.shop}
          onClick={onNavigate}
          className="bg-brand inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-field text-2xs font-bold text-white"
        >
          {NAV_ICONS.shop}
          Shop
        </Link>
      )}
      <Link
        to={APP_PATHS.quickMatch}
        onClick={onNavigate}
        className="text-brand-text border-brand/55 hover:bg-brand/10 inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-field border text-2xs font-bold"
      >
        <ScoreboardIcon className="text-brand-text h-[15px] w-[15px]" />
        Score
      </Link>
    </div>
  );
}
