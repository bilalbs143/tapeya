import { type ReactNode, useCallback, useMemo, useState } from 'react';

import { ShellDrawerContext } from './shellDrawerContext';

/** Phone drawer open state. */
export function ShellProvider({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const value = useMemo(
    () => ({ drawerOpen, openDrawer, closeDrawer, setDrawerOpen }),
    [drawerOpen, openDrawer, closeDrawer]
  );

  return <ShellDrawerContext.Provider value={value}>{children}</ShellDrawerContext.Provider>;
}
