import { type ReactNode, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';

if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

type ShellScrollportProps = {
  children: ReactNode;
  className?: string | undefined;
};

/** Main shell scroller — reset scrollTop on pathname/search change (window does not scroll). */
export function ShellScrollport({ children, className }: ShellScrollportProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { pathname, search } = useLocation();
  const routeKey = `${pathname}${search}`;
  const prevRouteKey = useRef(routeKey);

  useLayoutEffect(() => {
    const pathChanged = prevRouteKey.current !== routeKey;
    prevRouteKey.current = routeKey;
    if (!pathChanged) return;

    const node = ref.current;
    if (node) node.scrollTop = 0;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [routeKey]);

  return (
    <div ref={ref} data-shell-scrollport className={cn(className)}>
      {children}
    </div>
  );
}
