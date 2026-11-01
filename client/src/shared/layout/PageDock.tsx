import { type ReactNode, useLayoutEffect } from 'react';

import { cn } from '@/shared/lib/cn';

import { retainPageDock } from './pageDockStore';

export const PAGE_SCROLL_ATTR = 'data-page-scroll';

type PageDockProps = {
  children: ReactNode;
  header?: ReactNode | undefined;
  footer?: ReactNode | undefined;
  className?: string | undefined;
  /**
   * Page kind (middle pane):
   * - `scroll` (default) — **dock-scroll**: lists, forms, gates; middle is the page scroller.
   * - `fill` — **dock-fill**: media/upload stages; middle is a flex column children can `flex-1`.
   * Prefer [`DockScreen`](./DockScreen.tsx) when the header is a plain ScreenBar.
   * Home feed = document (no PageDock). Reels / on-air = immersive bare shell.
   */
  body?: 'scroll' | 'fill' | undefined;
  /**
   * Ask AppShell to mount `KeyboardInsetPad` (default on).
   * Off for landscape media — shell pad suppressed while mounted.
   */
  padKeyboard?: boolean | undefined;
};

/**
 * Fixed-height page chrome for ScreenBar and/or footer dock.
 * One PageDock per route — switch loading/error/empty/success as children, not nested shells.
 * Registers with the shell so AppShell uses a fixed frame + owns keyboard lift.
 */
export function PageDock({ children, header, footer, className, body = 'scroll', padKeyboard = true }: PageDockProps) {
  const fill = body === 'fill';

  // Layout effect so AppShell flips to fixed-frame / keyboard policy before paint.
  useLayoutEffect(() => retainPageDock({ padKeyboard }), [padKeyboard]);

  return (
    <div data-page-dock="" className={cn('bg-surface flex h-full min-h-0 flex-col overflow-hidden', className)}>
      {header}
      <div
        {...(fill ? { 'data-page-stage': '' } : { 'data-page-scroll': '', 'data-scroll-to-top': '' })}
        className={cn(
          'min-h-0 flex-1',
          fill ? 'flex flex-col overflow-hidden' : 'overflow-y-auto overscroll-y-contain'
        )}
      >
        {children}
      </div>
      {footer}
    </div>
  );
}
