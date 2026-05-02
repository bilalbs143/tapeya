import { useEffect, useRef } from 'react';

import { createEcho } from '@/config/reverb';

/**
 * Subscribes to the **public** Reverb channel `match.{matchId}.graphics` and
 * calls `onCommand(event)` whenever a `.match.graphic.activated` event arrives.
 *
 * No auth token is required — the channel is public so the overlay page can
 * subscribe without a user session (OBS/vMix browser source).
 *
 * @param {string|number|undefined} matchId
 * @param {(event: object) => void} onCommand
 */
export function useGraphicChannel(matchId, onCommand) {
  const onCommandRef = useRef(onCommand);
  onCommandRef.current = onCommand;

  useEffect(() => {
    if (!matchId) return undefined;

    const echo = createEcho();
    if (!echo) return undefined;

    echo
      .channel(`match.${matchId}.graphics`)
      .listen('.match.graphic.activated', (event) => {
        onCommandRef.current(event);
      });

    return () => {
      echo.disconnect();
    };
  }, [matchId]);
}
