import { Link } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';
import { NAV_ICONS } from '@/shared/ui/icons';

import { isActivePath, type NavGroup } from './navGroups';
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
          const active = isActivePath(pathname, item.to);
          return (
            <li key={`${group.label}-${item.label}`}>
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
            </li>
          );
        })}
      </ul>
    </div>
  ));
}
