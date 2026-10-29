import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';
import { useKeyboardInset } from '@/shared/native/useKeyboardInset';

type StickyActionBarProps = {
  children: ReactNode;
  className?: string | undefined;
  /** Safe-area bottom when BottomNav is hidden; omit when nav owns inset. */
  edge?: boolean | undefined;
};

/**
 * Footer CTA dock for `PageDock` (sibling of the page scroller — not sticky).
 * Keyboard lift is owned by PageDock’s paddingBottom.
 */
export function StickyActionBar({ children, className, edge = false }: StickyActionBarProps) {
  const keyboardInset = useKeyboardInset();
  // Closed + edge: home-indicator via `--dock-above-keyboard` (subtracts inset → 0 while open).
  // Keyboard open (or non-edge): same `pb-3` breathing room as above BottomNav.
  const bottomPad = edge && keyboardInset <= 0 ? 'pb-[var(--dock-above-keyboard)]' : 'pb-3';

  return (
    <div
      className={cn(
        'border-border-subtle bg-surface/95 shrink-0 border-t px-4 pt-3 backdrop-blur-sm',
        bottomPad,
        className
      )}
    >
      {children}
    </div>
  );
}
