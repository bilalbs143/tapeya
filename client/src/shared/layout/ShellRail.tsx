import { type ReactNode, useCallback, useState } from 'react';

import { ShellRailSetContext, ShellRailValueContext } from './shellRailContext';

/** Lets a page (e.g. Feed) park a desktop third column without prop-drilling AppShell. */
export function ShellRailProvider({ children }: { children: ReactNode }) {
  const [rail, setRailState] = useState<ReactNode>(null);
  const setRail = useCallback((node: ReactNode) => {
    setRailState(node);
  }, []);

  return (
    <ShellRailSetContext.Provider value={setRail}>
      <ShellRailValueContext.Provider value={rail}>{children}</ShellRailValueContext.Provider>
    </ShellRailSetContext.Provider>
  );
}
