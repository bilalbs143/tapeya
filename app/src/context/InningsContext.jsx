/**
 * InningsContext
 *
 * Provides per-innings identity values to any hook or component inside ScoringTab
 * without prop drilling.
 *
 * Provider:  ScoringTab.jsx
 * Consumers: useActionMenu, usePlayerDialogs, useSquadPersistence (and their successors)
 */

import { createContext, useContext } from 'react';

export const InningsContext = createContext(null);

/**
 * @returns {{
 *   inningsNumber: string,
 *   inningsId: string | null,
 *   battingTeamId: number,
 *   bowlingTeamId: number,
 *   battingTeamName: string,
 *   bowlingTeamName: string,
 *   battingTeamLogo: string | null,
 *   bowlingTeamLogo: string | null,
 *   battingPlayingElevenIds: number[],
 *   bowlingPlayingElevenIds: number[],
 *   firstInningsComplete: boolean,
 *   isLiveInnings: boolean,
 *   battingSquad: object[],
 *   bowlingSquad: object[],
 *   addBatsmanDialogPlayers: object[],
 *   addBowlerDialogPlayers: object[],
 *   battingXiSavedOnApi: boolean,
 *   bowlingXiSavedOnApi: boolean,
 *   battingOrder: object[],
 *   bowlingOrder: object[],
 *   requiredBatting: number,
 *   requiredBowling: number,
 *   setBatsmanRole: Function,
 *   setBowlerRole: Function,
 *   addPlayerToBattingSquad: Function,
 *   removePlayerFromBattingSquad: Function,
 *   addPlayerToBowlingSquad: Function,
 *   removePlayerFromBowlingSquad: Function,
 * }}
 */
export function useInnings() {
  const ctx = useContext(InningsContext);
  if (!ctx) throw new Error('useInnings must be used inside ScoringTab');
  return ctx;
}
