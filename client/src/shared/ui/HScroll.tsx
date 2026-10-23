import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

type HScrollOwnProps = {
  /** `ul` for list rails; default `div`. */
  as?: 'div' | 'ul' | undefined;
  /**
   * Cancel a parent `px-4` gutter (`-mx-4`) so the first paint is inset but
   * scrolling goes edge-to-edge (Facebook-style). Use `false` when the parent
   * is already full-bleed.
   */
  bleed?: boolean | undefined;
  className?: string | undefined;
  children?: ReactNode;
};

type HScrollProps = HScrollOwnProps & Omit<ComponentPropsWithoutRef<'div'>, keyof HScrollOwnProps>;

/**
 * Horizontal product / story / chip rail.
 * Parent keeps labels in `px-4`; this rail bleeds full width while scrolling.
 */
export function HScroll({ as, bleed = true, className, children, ...props }: HScrollProps) {
  const Comp = (as ?? 'div') as ElementType;
  const list = as === 'ul';
  return (
    <Comp
      className={cn(
        'no-scrollbar flex overflow-x-auto overscroll-x-contain',
        list && 'list-none',
        bleed ? '-mx-4 px-4' : 'px-4',
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
