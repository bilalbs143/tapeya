import { useCallback, useState } from 'react';

/**
 * Media immersive landscape — **manual Full only**.
 * App stays portrait-locked; tilt-to-open is disabled (revisit later).
 */
export function useImmersiveLandscape(enabled = true): {
  landscape: boolean;
  /** Always false while the app is portrait-locked — stage uses CSS rotate. */
  deviceLandscape: boolean;
  enterLandscape: () => void;
  exitLandscape: () => void;
} {
  const [forced, setForced] = useState(false);

  const enterLandscape = useCallback(() => {
    if (!enabled) return;
    setForced(true);
  }, [enabled]);

  const exitLandscape = useCallback(() => {
    setForced(false);
  }, []);

  return {
    landscape: Boolean(enabled && forced),
    deviceLandscape: false,
    enterLandscape,
    exitLandscape,
  };
}
