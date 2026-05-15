/**
 * useApiMatchSync – Hydrates innings state from API scorecard and playing eleven.
 *
 * Runs once per match load (guarded by apiSynced). Resets when matchId changes
 * so navigating to a different match triggers a fresh sync.
 *
 * Responsibilities:
 *   - Hydrate squads with correct playing/bench roles from API playing-eleven
 *   - Hydrate ball history from scorecard (sorted by over ASC, ball_in_over ASC)
 *   - Replay ball history to restore crease + bowler table state
 *   - Activate innings 2 when it has ball data or innings 1 is marked completed
 *
 * KEY: API returns balls in indeterminate order. Sorting is CRITICAL before replay.
 */

import { useEffect, useState } from 'react';

import { squadPlayerProfileFields } from '@/lib/utils/playerUtils';
import {
  apiPartnershipsToUiState,
  buildPlayerIdToName,
  getTossWinnerTeamId,
  scorecardInningsToBallHistory,
} from '@/lib/utils/scoringMappers';
import { replayBallHistory } from '@/lib/utils/scoringReplay';

import {
  blankBatsman,
  blankBowler,
  INITIAL_PARTNERSHIP,
} from './useInningsState';

// ─── Helpers (used only by this hook) ────────────────────────────────────────

function buildRoleSquad(squadList, playingIds) {
  const playingSet = new Set((playingIds ?? []).map(String));
  return (squadList ?? [])
    .filter((p) => p.id != null)
    .map((p) => {
      const id = p.id ?? p.user_id;
      return {
        ...squadPlayerProfileFields(p),
        id,
        name: p.name ?? p.nickname ?? `Player ${id}`,
        role: playingSet.has(String(id)) ? 'playing' : 'bench',
      };
    });
}

function idsToPlayers(ids, nameMap) {
  return (ids ?? []).map((id) => ({
    id,
    name: nameMap[String(id)] ?? `Player ${id}`,
  }));
}

function getBattingBowlingTeamIds(apiMatch, scorecard) {
  if (!apiMatch) return { battingTeamId: null, bowlingTeamId: null };
  const homeId = apiMatch.home_team_id;
  const awayId = apiMatch.away_team_id;
  const tossWinnerId = getTossWinnerTeamId(apiMatch, scorecard);
  const choseBat = apiMatch.chose_to_bat_or_bowl === 'bat';
  const tw = tossWinnerId != null ? Number(tossWinnerId) : null;
  const hid = homeId != null ? Number(homeId) : null;
  const aid = awayId != null ? Number(awayId) : null;
  const battingTeamId = tw != null && choseBat ? tw : tw === hid ? aid : hid;
  const bowlingTeamId = battingTeamId === hid ? aid : hid;
  return { battingTeamId, bowlingTeamId };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * @param {object} params
 * @param {string|null} params.matchId
 * @param {object|null} params.apiMatch
 * @param {object|null} params.scorecard
 * @param {number|null} params.homeTeamId
 * @param {number|null} params.awayTeamId
 * @param {object|undefined} params.playingElevenHome
 * @param {object|undefined} params.playingElevenAway
 * @param {Array|undefined} params.squadHome
 * @param {Array|undefined} params.squadAway
 * @param {object} params.innings1 - useInningsState() result
 * @param {object} params.innings2 - useInningsState() result
 * @param {(innings: '1'|'2') => void} params.setCurrentInnings
 */
export function useApiMatchSync({
  matchId,
  apiMatch,
  scorecard,
  homeTeamId,
  awayTeamId,
  playingElevenHome,
  playingElevenAway,
  squadHome,
  squadAway,
  innings1,
  innings2,
  setCurrentInnings,
}) {
  const [apiSynced, setApiSynced] = useState(false);

  // Reset sync flag when match changes so we re-hydrate for the new match
  useEffect(() => {
    setApiSynced(false);
  }, [matchId]);

  useEffect(() => {
    if (!apiMatch || apiSynced) return;
    if (squadHome === undefined || squadAway === undefined) return;
    if (playingElevenHome === undefined || playingElevenAway === undefined)
      return;

    const needsScorecardForLegacyToss =
      apiMatch.status === 'completed' &&
      apiMatch.toss_winner_team_id == null &&
      apiMatch.chose_to_bat_or_bowl != null;
    if (needsScorecardForLegacyToss && scorecard == null) return;

    const homeSquadArr = Array.isArray(squadHome) ? squadHome : [];
    const awaySquadArr = Array.isArray(squadAway) ? squadAway : [];
    const scorecardInnings1 = scorecard?.innings?.[0];
    const scorecardInnings2 = scorecard?.innings?.[1];

    // ── Innings 1: determine batting/bowling teams ─────────────────────────
    const { battingTeamId: defaultBatId, bowlingTeamId: defaultBowlId } =
      getBattingBowlingTeamIds(apiMatch, scorecard);

    const bat1TeamId = scorecardInnings1?.batting_team_id ?? defaultBatId;
    const bowl1TeamId = scorecardInnings1?.bowling_team_id ?? defaultBowlId;

    const bat1SquadArr =
      bat1TeamId === homeTeamId ? homeSquadArr : awaySquadArr;
    const bowl1SquadArr =
      bowl1TeamId === homeTeamId ? homeSquadArr : awaySquadArr;

    const bat1Ids =
      bat1TeamId === homeTeamId
        ? (playingElevenHome?.player_ids ?? [])
        : (playingElevenAway?.player_ids ?? []);
    const bowl1Ids =
      bowl1TeamId === homeTeamId
        ? (playingElevenHome?.player_ids ?? [])
        : (playingElevenAway?.player_ids ?? []);

    const nameMap1 = {
      ...buildPlayerIdToName(bat1SquadArr, bat1Ids),
      ...buildPlayerIdToName(bowl1SquadArr, bowl1Ids),
    };

    const bat1Players = idsToPlayers(bat1Ids, nameMap1);
    const bowl1Players = idsToPlayers(bowl1Ids, nameMap1);

    innings1.setBattingSquad(buildRoleSquad(bat1SquadArr, bat1Ids));
    innings1.setBowlingSquad(buildRoleSquad(bowl1SquadArr, bowl1Ids));

    // ── Innings 1: hydrate ball history + crease ───────────────────────────
    if (!scorecard || !scorecardInnings1) {
      innings1.reset({
        batsmenOnCrease:
          bat1Players.length >= 2
            ? bat1Players.slice(0, 2).map(blankBatsman)
            : [],
        bowlersInTable:
          bowl1Players.length > 0
            ? bowl1Players.slice(0, 2).map(blankBowler)
            : [],
      });
      setApiSynced(true);
      return;
    }

    const history1 = scorecardInningsToBallHistory(scorecardInnings1, nameMap1);

    if (history1.length === 0) {
      innings1.reset({
        battingSquad: buildRoleSquad(bat1SquadArr, bat1Ids),
        bowlingSquad: buildRoleSquad(bowl1SquadArr, bowl1Ids),
        batsmenOnCrease: bat1Players.slice(0, 2).map(blankBatsman),
        bowlersInTable: bowl1Players.slice(0, 2).map(blankBowler),
      });
    } else {
      const r1 = replayBallHistory(history1, bat1Players, bowl1Players);
      const apiP1 = scorecardInnings1.partnerships ?? [];
      const hasApiP1 = apiP1.length > 0;
      const parsed1 = hasApiP1
        ? apiPartnershipsToUiState(apiP1, nameMap1)
        : { completed: [], current: null };
      const currentP1 = hasApiP1
        ? (parsed1.current ?? INITIAL_PARTNERSHIP)
        : (r1.currentPartnership ?? INITIAL_PARTNERSHIP);
      innings1.reset({
        ballHistory: history1,
        batsmenOnCrease: r1.batsmenOnCrease ?? [],
        bowlersInTable: r1.bowlersInTable ?? [],
        strikerIndex: r1.strikerIndex ?? 0,
        currentBowlerIndex: r1.currentBowlerIndex ?? 0,
        completedPartnerships: hasApiP1
          ? parsed1.completed
          : (r1.completedPartnerships ?? []),
        currentPartnership: currentP1,
        pendingFreeHit: r1.pendingFreeHit ?? false,
        retiredBatsmen: r1.retiredBatsmen ?? [],
      });
    }

    // ── Innings 2 (if present in scorecard) ───────────────────────────────

    if (scorecardInnings2) {
      const bat2TeamId = scorecardInnings2.batting_team_id;
      const bowl2TeamId = scorecardInnings2.bowling_team_id;

      const bat2SquadArr =
        bat2TeamId === homeTeamId ? homeSquadArr : awaySquadArr;
      const bowl2SquadArr =
        bowl2TeamId === homeTeamId ? homeSquadArr : awaySquadArr;

      const bat2Ids =
        bat2TeamId === homeTeamId
          ? (playingElevenHome?.player_ids ?? [])
          : (playingElevenAway?.player_ids ?? []);
      const bowl2Ids =
        bowl2TeamId === homeTeamId
          ? (playingElevenHome?.player_ids ?? [])
          : (playingElevenAway?.player_ids ?? []);

      const nameMap2 = {
        ...buildPlayerIdToName(bat2SquadArr, bat2Ids),
        ...buildPlayerIdToName(bowl2SquadArr, bowl2Ids),
      };

      const bat2Players = idsToPlayers(bat2Ids, nameMap2);
      const bowl2Players = idsToPlayers(bowl2Ids, nameMap2);

      innings2.setBattingSquad(buildRoleSquad(bat2SquadArr, bat2Ids));
      innings2.setBowlingSquad(buildRoleSquad(bowl2SquadArr, bowl2Ids));

      const history2 = scorecardInningsToBallHistory(
        scorecardInnings2,
        nameMap2,
      );

      if (history2.length === 0) {
        innings2.reset({
          batsmenOnCrease:
            bat2Players.length >= 2
              ? bat2Players.slice(0, 2).map(blankBatsman)
              : [],
          bowlersInTable:
            bowl2Players.length > 0
              ? bowl2Players.slice(0, 2).map(blankBowler)
              : [],
        });
      } else {
        const r2 = replayBallHistory(history2, bat2Players, bowl2Players);
        const apiP2 = scorecardInnings2.partnerships ?? [];
        const hasApiP2 = apiP2.length > 0;
        const parsed2 = hasApiP2
          ? apiPartnershipsToUiState(apiP2, nameMap2)
          : { completed: [], current: null };
        const currentP2 = hasApiP2
          ? (parsed2.current ?? INITIAL_PARTNERSHIP)
          : (r2.currentPartnership ?? INITIAL_PARTNERSHIP);
        innings2.reset({
          ballHistory: history2,
          batsmenOnCrease: r2.batsmenOnCrease ?? [],
          bowlersInTable: r2.bowlersInTable ?? [],
          strikerIndex: r2.strikerIndex ?? 0,
          currentBowlerIndex: r2.currentBowlerIndex ?? 0,
          completedPartnerships: hasApiP2
            ? parsed2.completed
            : (r2.completedPartnerships ?? []),
          currentPartnership: currentP2,
          pendingFreeHit: r2.pendingFreeHit ?? false,
          retiredBatsmen: r2.retiredBatsmen ?? [],
        });
      }

      if (history2.length > 0 || scorecardInnings1?.status === 'completed') {
        setCurrentInnings('2');
      }
    }

    setApiSynced(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- innings1/innings2 are stable refs; we sync when API data changes
  }, [
    apiMatch,
    scorecard,
    homeTeamId,
    awayTeamId,
    playingElevenHome,
    playingElevenAway,
    squadHome,
    squadAway,
    apiSynced,
  ]);
}
