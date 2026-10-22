import { useCallback, useState } from 'react';

import type { UiBall } from '../lib/storeBallPayload';
import type { WicketChoice } from './WicketSheet';

/**
 * Wicket sheet open/fromExtra state + confirm → UiBall mapping.
 * Does not call the API — callers pass `submit` (useStoreBallSubmit).
 */
export function useWicketFlow() {
  const [wicketOpen, setWicketOpen] = useState(false);
  const [wicketFromExtra, setWicketFromExtra] = useState<'wd' | 'nb' | null>(null);

  const openWicket = useCallback((fromExtra: 'wd' | 'nb' | null = null) => {
    setWicketFromExtra(fromExtra);
    setWicketOpen(true);
  }, []);

  const onWicketOpenChange = useCallback((open: boolean) => {
    setWicketOpen(open);
    if (!open) setWicketFromExtra(null);
  }, []);

  const confirmWicket = useCallback((choice: WicketChoice, submit: (ball: UiBall) => void | Promise<void>) => {
    setWicketOpen(false);
    setWicketFromExtra(null);
    void submit({
      type: 'out',
      dismissalType: choice.dismissalType,
      outPlayerId: choice.outPlayerId,
      fielderId: choice.fielderId,
      isWide: choice.isWide,
      isNoBall: choice.isNoBall,
      ...(choice.runoutExtraRuns != null ? { runoutExtraRuns: choice.runoutExtraRuns } : {}),
      ...(choice.dontCountBall != null ? { dontCountBall: choice.dontCountBall } : {}),
    });
  }, []);

  return {
    wicketOpen,
    wicketFromExtra,
    openWicket,
    onWicketOpenChange,
    confirmWicket,
  };
}
