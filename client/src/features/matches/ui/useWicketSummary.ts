import { useMemo } from 'react';

import {
  wicketSummaryBoundariesValue,
  type WicketSummaryModel,
  wicketSummaryOversLine,
  wicketSummaryPartnershipValue,
  wicketSummaryScoreHero,
} from '../lib/wicketSummary';

/** Derived display strings for WicketSummaryScreen. */
export function useWicketSummary(model: WicketSummaryModel | null) {
  return useMemo(() => {
    if (!model) {
      return {
        ready: false as const,
        scoreHero: null,
        oversLine: null,
        partnershipValue: null,
        boundariesValue: null,
      };
    }

    return {
      ready: true as const,
      scoreHero: wicketSummaryScoreHero(model.scoreDisplay),
      oversLine: wicketSummaryOversLine(model),
      partnershipValue: wicketSummaryPartnershipValue(model.partnership),
      boundariesValue: wicketSummaryBoundariesValue(model.batter.fours, model.batter.sixes),
    };
  }, [model]);
}
