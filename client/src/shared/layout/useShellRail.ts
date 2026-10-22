import { type ComponentType, createElement, type ReactNode, useContext, useLayoutEffect } from 'react';

import { ShellRailSetContext, ShellRailValueContext } from './shellRailContext';

export function useShellRailValue(): ReactNode {
  return useContext(ShellRailValueContext);
}

/** Register desktop rail — pass a component type, not an element, for stable effect deps. */
export function useShellRail(Rail: ComponentType | null): void {
  const setRail = useContext(ShellRailSetContext);

  useLayoutEffect(() => {
    if (!setRail) return;
    setRail(Rail ? createElement(Rail) : null);
    return () => setRail(null);
  }, [setRail, Rail]);
}
