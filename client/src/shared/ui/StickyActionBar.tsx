import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

type StickyActionBarProps = {
  children: ReactNode;
  className?: string | undefined;
  /** Safe-area bottom when BottomNav is hidden; omit when nav owns inset. */
  edge?: boolean | undefined;
};

/**
 * Footer CTA dock for `PageDock` (sibling of the page scroller — not sticky).
 * Keyboard lift + L/R fill: AppShell’s `KeyboardInsetPad` (opaque `bg-surface`).
 */
export function StickyActionBar({ children, className, edge = false }: StickyActionBarProps) {
  return (
    <div
      className={cn(
        // Opaque surface — same as comment compose / dialog footer (no see-through above keyboard).
        'border-border-subtle bg-surface isolate shrink-0 border-t px-4 pt-3 tab:border-t-0',
        // Normal: BottomNav owns home-indicator — fixed breathing room.
        // Edge (no nav): home-indicator via `--safe-above-keyboard` (0 while keyboard covers it).
        edge ? 'pb-[max(10px,var(--safe-above-keyboard))]' : 'pb-3',
        className
      )}
    >
      {children}
    </div>
  );
}
