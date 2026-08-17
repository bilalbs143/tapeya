/**
 * ScoringMatchContext
 *
 * Provides match-wide, slowly-changing values to any component in the
 * ScoringMatch subtree without prop drilling.
 *
 * Provider:  ScoringMatch.jsx
 * Consumers: ScoringTab, ScorecardTab, StatsTab, BallsTab, InfoTab (and their hooks)
 */

import { createContext, useContext } from 'react';

export const ScoringMatchContext = createContext(null);

/**
 * @returns {{
 *   matchId: string,
 *   match: object | null,
 *   apiMatch: object | null,
 *   matchComplete: boolean,
 *   canOperate: boolean,
 *   wagonWheelEnabled: boolean,
 *   innings1Id: string | null,
 *   innings2Id: string | null,
 * }}
 */
export function useScoringMatch() {
  const ctx = useContext(ScoringMatchContext);
  if (!ctx) throw new Error('useScoringMatch must be used inside ScoringMatch');
  return ctx;
}
