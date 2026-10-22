import { NavLink, useLocation } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';

import { BOTTOM_NAV } from './navConfig';
import { handleNavRootReselect } from './shellScroll';

type BottomNavProps = {
  className?: string;
  /** Absolute over full-bleed media (reels) — position only; colors stay on the app theme. */
  overlay?: boolean;
};

/** Primary bottom tabs — re-tap root scrolls to top. */
export function BottomNav({ className, overlay = false }: BottomNavProps) {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Primary"
      className={cn(
        'border-border-subtle bg-veil flex justify-between border-t px-3 pt-2.5 pb-[max(22px,env(safe-area-inset-bottom))] backdrop-blur-[16px]',
        overlay && 'absolute inset-x-0 bottom-0 z-20',
        className
      )}
    >
      {BOTTOM_NAV.map(({ id, to, label, Glyph, dot, isActive }) => {
        const active = isActive(pathname);
        return (
          <NavLink
            key={id}
            to={to}
            end={id === 'home'}
            onClick={(event) => handleNavRootReselect(event, pathname, to)}
            className="focus-visible:outline-brand rounded-panel focus-visible:outline-2"
            aria-current={active ? 'page' : undefined}
          >
            <span
              className={cn('flex flex-col items-center gap-1.5 rounded-panel px-3.5 py-1.5', active && 'bg-brand/16')}
            >
              <span className="relative grid h-[17px] w-[17px] place-items-center">
                <Glyph active={active} />
                {dot ? (
                  <span className="bg-danger-text absolute -top-0.5 -right-1 h-1.5 w-1.5 rounded-full shadow-[0_0_0_2px_var(--c-surface)]" />
                ) : null}
              </span>
              <span className={cn('text-4xs leading-none', active ? 'font-bold text-ink' : 'text-dim font-semibold')}>
                {label}
              </span>
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
