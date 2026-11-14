import { Link } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';
import { cn } from '@/shared/lib/cn';
import { Avatar } from '@/shared/ui/Avatar';
import { ChevronRightIcon, NAV_ICONS } from '@/shared/ui/icons';

import { isActivePath, type NavGroup, type NavItem, type SidebarInterestNav } from './navGroups';
import { handleNavRootReselect } from './shellScroll';

type NavGroupListProps = {
  pathname: string;
  groups: NavGroup[];
  liveOn?: boolean | undefined;
  onNavigate?: (() => void) | undefined;
  /** Phone drawer — slightly denser rows without changing desktop SideNav. */
  compact?: boolean | undefined;
};

export function NavGroupList({ pathname, groups, liveOn = false, onNavigate, compact = false }: NavGroupListProps) {
  const navTargets = groups.flatMap((group) => group.items.map((item) => item.to));

  return groups.map((group, gi) => (
    <div key={group.label}>
      {gi > 0 ? <div className={cn('bg-border mx-[18px] h-px', compact ? 'mt-1.5' : 'mt-2')} /> : null}
      <p
        className={cn(
          'text-dim font-mono px-4 text-4xs font-bold tracking-eyebrow uppercase',
          compact ? 'pt-2 pb-0.5' : 'pt-2.5 pb-1'
        )}
      >
        {group.label}
      </p>
      <ul className={cn('flex flex-col', compact ? 'gap-0' : 'gap-0.5')}>
        {group.items.map((item) => {
          const active = isActivePath(pathname, item.to, navTargets);
          return (
            <li key={`${group.label}-${item.label}`}>
              <NavDefaultLink
                item={item}
                pathname={pathname}
                active={active}
                liveOn={liveOn}
                compact={compact}
                onNavigate={onNavigate}
              />
            </li>
          );
        })}
      </ul>
    </div>
  ));
}

function NavDefaultLink({
  item,
  pathname,
  active,
  liveOn,
  compact,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  active: boolean;
  liveOn: boolean;
  compact: boolean;
  onNavigate?: (() => void) | undefined;
}) {
  return (
    <Link
      to={item.to}
      onClick={(event) => {
        handleNavRootReselect(event, pathname, item.to);
        onNavigate?.();
      }}
      className={cn(
        'relative flex items-center gap-3 rounded-field px-4 text-body-sm',
        compact ? 'h-9' : 'h-10',
        active
          ? 'bg-brand/16 font-bold text-ink shadow-[inset_3px_0_0_var(--color-brand-hover)]'
          : 'text-body hover:bg-surface-raised font-semibold'
      )}
    >
      <span className={cn(active ? 'text-ink' : 'text-muted')}>{NAV_ICONS[item.icon]}</span>
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.liveDot && liveOn ? <span className="bg-positive-2 h-1.5 w-1.5 shrink-0 rounded-full" /> : null}
      {item.badge ? (
        <span className="bg-brand grid h-5 min-w-5 place-items-center rounded-full px-1.5 font-mono text-3xs leading-normal font-bold text-white">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

type NavInterestBannerProps = {
  campaign: SidebarInterestNav;
  pathname: string;
  onNavigate?: (() => void) | undefined;
  compact?: boolean | undefined;
  className?: string | undefined;
};

/** Compact promo under primary CTAs — above Main. */
export function NavInterestBanner({
  campaign,
  pathname,
  onNavigate,
  compact = false,
  className,
}: NavInterestBannerProps) {
  const to = `${APP_PATHS.interest}/${campaign.slug}`;
  const title = campaign.tournamentName.trim() || 'Interest';
  const active = pathname === to || pathname.startsWith(`${to}/`);

  return (
    <Link
      to={to}
      title={title}
      onClick={(event) => {
        handleNavRootReselect(event, pathname, to);
        onNavigate?.();
      }}
      className={cn(
        'border-border hover:bg-surface-raised flex min-w-0 items-center gap-2.5 overflow-hidden rounded-panel border px-3',
        compact ? 'min-h-11 py-1.5' : 'min-h-12 py-2',
        active && 'bg-surface-raised',
        className
      )}
    >
      {campaign.logoUrl ? (
        <span className="border-border bg-surface flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-icon border">
          <img src={campaign.logoUrl} alt="" className="h-full w-full object-contain" />
        </span>
      ) : (
        <Avatar
          crest
          name={title}
          size="sm"
          className="border-border h-9 w-9 border text-3xs font-extrabold"
          aria-hidden
        />
      )}
      <span className="min-w-0 flex-1 overflow-hidden">
        <span className="text-muted font-mono block text-4xs font-bold tracking-eyebrow uppercase">Interest</span>
        <span className="block truncate text-body-sm leading-snug font-extrabold text-ink">{title}</span>
      </span>
      <ChevronRightIcon className="text-dim h-3.5 w-3.5 shrink-0" strokeWidth={2.4} />
    </Link>
  );
}
