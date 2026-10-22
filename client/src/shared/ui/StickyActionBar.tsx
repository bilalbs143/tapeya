import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

type StickyActionBarProps = {
  children: ReactNode;
  className?: string | undefined;
  /** Safe-area bottom when BottomNav is hidden; omit when nav owns inset. */
  edge?: boolean | undefined;
};

/** Sticky footer CTA — sibling of scroll body (not inside the form); lifts with `--keyboard-inset`. */
export function StickyActionBar({ children, className, edge = false }: StickyActionBarProps) {
  return (
    <div
      className={cn(
        'border-border-subtle bg-surface/95 sticky z-20 mt-auto shrink-0 border-t px-4 pt-3 backdrop-blur-sm',
        'bottom-[var(--keyboard-inset,0px)]',
        edge ? 'pb-[max(0.75rem,env(safe-area-inset-bottom))]' : 'pb-3',
        className
      )}
    >
      {children}
    </div>
  );
}
