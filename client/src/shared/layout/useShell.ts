import { useContext } from 'react';

import { type ShellContextValue, ShellDrawerContext } from './shellDrawerContext';

export function useShell(): ShellContextValue {
  const ctx = useContext(ShellDrawerContext);
  if (!ctx) {
    return {
      drawerOpen: false,
      openDrawer: () => undefined,
      closeDrawer: () => undefined,
      setDrawerOpen: () => undefined,
    };
  }
  return ctx;
}
