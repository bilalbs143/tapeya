import { createContext, useContext, useEffect, useState } from 'react';

import { createEcho } from '@/config/reverb';

/** @typedef {import('laravel-echo').default<'reverb'>} GraphicEcho */

/**
 * One Laravel Echo instance per overlay mount — avoids creating a new WebSocket
 * client on every channel hook re-run and prevents overlapping connections during
 * React strict-mode remounts.
 */
const GraphicEchoContext = createContext(/** @type {GraphicEcho|null} */ (null));

/** @param {{ children?: import('react').ReactNode }} props */
export function GraphicEchoProvider({ children }) {
  const [echo, setEcho] = useState(/** @type {GraphicEcho|null} */ (null));

  useEffect(() => {
    let instance;
    try {
      instance = createEcho();
    } catch (err) {
      console.error('[graphics:echo] Failed to create Echo instance — WebSocket disabled.', err);
      setEcho(null);
      return undefined;
    }

    if (!instance) {
      setEcho(null);
      return undefined;
    }

    setEcho(instance);

    return () => {
      instance.disconnect();
      setEcho(null);
    };
  }, []);

  return <GraphicEchoContext.Provider value={echo}>{children}</GraphicEchoContext.Provider>;
}

/** @returns {GraphicEcho|null} */
// eslint-disable-next-line react-refresh/only-export-components
export function useGraphicEcho() {
  return useContext(GraphicEchoContext);
}
