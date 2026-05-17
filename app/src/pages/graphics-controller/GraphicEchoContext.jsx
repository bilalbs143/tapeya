import { createContext, useContext, useEffect, useState } from 'react';

import { createEcho } from '@/config/reverb';

/**
 * One Laravel Echo instance per overlay mount / match id — avoids creating a
 * new WebSocket client on every `useGraphicChannel` re-run and prevents
 * overlapping connections during React strict-mode or route remounts.
 */
const GraphicEchoContext = createContext(null);

export function GraphicEchoProvider({ matchId, children }) {
  const [echo, setEcho] = useState(null);

  useEffect(() => {
    if (!matchId) {
      setEcho(null);
      return undefined;
    }

    const instance = createEcho();
    if (!instance) {
      setEcho(null);
      return undefined;
    }

    setEcho(instance);

    return () => {
      instance.disconnect();
      setEcho(null);
    };
  }, [matchId]);

  return <GraphicEchoContext.Provider value={echo}>{children}</GraphicEchoContext.Provider>;
}

/** @returns {import('laravel-echo').default|null} */
// eslint-disable-next-line react-refresh/only-export-components
export function useGraphicEcho() {
  return useContext(GraphicEchoContext);
}
