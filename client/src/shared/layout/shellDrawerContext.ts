import { createContext } from 'react';

export type ShellContextValue = {
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
};

export const ShellDrawerContext = createContext<ShellContextValue | null>(null);
