import { type ReactNode, useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';
import { useKeyboardInset } from '@/shared/native/useKeyboardInset';

import { ensureShellFocusedFieldVisible } from './ensureShellFocusedFieldVisible';
import { scrollShellToTop } from './shellScroll';

if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

type ShellScrollportProps = {
  children: ReactNode;
  className?: string | undefined;
  /**
   * Cap the column to the shell slot (`h-full`) so nested `PageDock` / fixed-frame pages
   * can scroll inside. Default `min-h-full` lets document-scroll pages grow the shell.
   */
  fill?: boolean | undefined;
};

/** Main shell scroller — reset scrollTop on pathname/search change (window does not scroll). */
export function ShellScrollport({ children, className, fill = false }: ShellScrollportProps) {
  const { pathname, search } = useLocation();
  const routeKey = `${pathname}${search}`;
  const prevRouteKey = useRef(routeKey);
  const keyboardInset = useKeyboardInset();

  useLayoutEffect(() => {
    const pathChanged = prevRouteKey.current !== routeKey;
    prevRouteKey.current = routeKey;
    if (!pathChanged) return;

    // Shell column + PageDock `[data-scroll-to-top]` panes (page owns scroll when docked).
    scrollShellToTop('instant' as ScrollBehavior);
  }, [routeKey]);

  useEffect(() => {
    let raf = 0;
    let timer = 0;

    const schedule = () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      raf = requestAnimationFrame(() => {
        ensureShellFocusedFieldVisible();
        // Keyboard animation often finishes after the first inset paint.
        timer = window.setTimeout(() => ensureShellFocusedFieldVisible(), 120);
      });
    };

    document.addEventListener('focusin', schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      document.removeEventListener('focusin', schedule);
    };
  }, []);

  // Document pages only — docked/fill frames already `overflow-hidden` and skip shell pan
  // for footer composers in `ensureShellFocusedFieldVisible`.
  useEffect(() => {
    if (fill || keyboardInset <= 0) return;
    let raf = 0;
    let timer = 0;
    raf = requestAnimationFrame(() => {
      ensureShellFocusedFieldVisible();
      timer = window.setTimeout(() => ensureShellFocusedFieldVisible(), 120);
    });
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [keyboardInset, fill]);

  return (
    <div data-shell-scrollport className={cn(className)}>
      {/* Flex stays on the inner wrapper — sticky ScreenBar breaks if the overflow
          scroller itself is `display: flex`. `fill` caps height for PageDock scroll. */}
      <div className={cn('flex w-full flex-col', fill ? 'h-full min-h-0' : 'min-h-full')}>{children}</div>
    </div>
  );
}
