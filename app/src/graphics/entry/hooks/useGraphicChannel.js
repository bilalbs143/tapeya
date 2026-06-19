import { useEffect, useRef } from 'react';

import { useGraphicEcho } from '../GraphicEchoProvider';

/**
 * Subscribes to the **public** Reverb channel `match.{matchId}.graphics` and
 * calls `onCommand(event)` whenever a `.match.graphic.activated` event arrives.
 *
 * Uses the shared Echo instance from {@link GraphicEchoProvider} — do not call
 * outside that provider.
 *
 * @param {string|number|undefined} matchId
 * @param {(event: object) => void} onCommand
 */
export function useGraphicChannel(matchId, onCommand) {
  const echo = useGraphicEcho();
  const onCommandRef = useRef(onCommand);
  onCommandRef.current = onCommand;

  useEffect(() => {
    if (!matchId || !echo) return undefined;

    echo.channel(`match.${matchId}.graphics`).listen('.match.graphic.activated', (event) => {
      onCommandRef.current(event);
    });

    return () => {
      echo.leave(`match.${matchId}.graphics`);
    };
  }, [matchId, echo]);
}
