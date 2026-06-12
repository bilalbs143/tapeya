import { useEffect, useReducer } from 'react';

import { useGraphicEcho } from '@/pages/graphics-controller/GraphicEchoContext';

import {
  activeFlashItem,
  FLASH_DURATION_MS,
  graphicFlashEventToAction,
  graphicFlashReducer,
  initialGraphicFlashState,
} from './graphicFlashState';

/**
 * Subscribes to `.match.graphic.flash` on `match.{matchId}.graphics`.
 * Manages the sequential command queue and per-item timers.
 *
 * Returns the active flash item { commandKey, context, contextHash } or null.
 *
 * @param {string|number|undefined} matchId
 * @returns {{ commandKey: string, context: object|null, contextHash: string|null } | null}
 */
export function useGraphicFlash(matchId) {
  const echo = useGraphicEcho();
  const [state, dispatch] = useReducer(graphicFlashReducer, initialGraphicFlashState);

  // Advance queue by one item after FLASH_DURATION_MS whenever the queue changes.
  useEffect(() => {
    if (state.queue.length === 0) {
      return undefined;
    }

    const timer = setTimeout(() => {
      dispatch({ type: 'TICK' });
    }, FLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [state.queue]);

  useEffect(() => {
    if (!matchId || !echo) {
      return undefined;
    }

    const channelName = `match.${matchId}.graphics`;

    const handler = (event) => {
      const action = graphicFlashEventToAction(event);
      if (action) {
        dispatch(action);
      }
    };

    echo.channel(channelName).listen('.match.graphic.flash', handler);

    return () => {
      echo.channel(channelName).stopListening('.match.graphic.flash', handler);
    };
  }, [matchId, echo]);

  return activeFlashItem(state);
}
