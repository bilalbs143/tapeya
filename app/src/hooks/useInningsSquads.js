/**
 * Squad state for the active innings in ScoringTab.
 * Receives battingTeamId/bowlingTeamId as params — called before InningsContext
 * is provided, so it cannot use useInnings().
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useScoringMatch } from '@/context/ScoringMatchContext';
import { buildInningsSquads } from '@/lib/utils/scoringMappers';
import { useGetMatchQuery, useGetMatchStateQuery } from '@/store/api/matchApi';
import { useGetTeamSquadQuery } from '@/store/api/teamApi';

export function useInningsSquads({ battingTeamId, bowlingTeamId }) {
  const { matchId, match } = useScoringMatch();

  const { data: apiMatch } = useGetMatchQuery(matchId, { skip: !matchId });
  const homeTeamId = apiMatch?.home_team_id ?? apiMatch?.home_team?.id;
  const awayTeamId = apiMatch?.away_team_id ?? apiMatch?.away_team?.id;

  const { data: squadHome } = useGetTeamSquadQuery(homeTeamId, { skip: !homeTeamId });
  const { data: squadAway } = useGetTeamSquadQuery(awayTeamId, { skip: !awayTeamId });

  const { data: matchState } = useGetMatchStateQuery(matchId, { skip: !matchId });
  const playingElevenHome = matchState?.playing_eleven?.home;
  const playingElevenAway = matchState?.playing_eleven?.away;

  const hid = homeTeamId != null ? Number(homeTeamId) : NaN;

  const battingPlayingElevenIds = useMemo(
    () => (Number(battingTeamId) === hid ? (playingElevenHome?.player_ids ?? []) : (playingElevenAway?.player_ids ?? [])),
    [battingTeamId, hid, playingElevenHome?.player_ids, playingElevenAway?.player_ids],
  );
  const bowlingPlayingElevenIds = useMemo(
    () => (Number(bowlingTeamId) === hid ? (playingElevenHome?.player_ids ?? []) : (playingElevenAway?.player_ids ?? [])),
    [bowlingTeamId, hid, playingElevenHome?.player_ids, playingElevenAway?.player_ids],
  );

  const serverSquads = useMemo(() => {
    if (battingTeamId == null || bowlingTeamId == null) {
      return { battingSquad: [], bowlingSquad: [], nameMap: {} };
    }
    return buildInningsSquads({
      battingTeamId,
      bowlingTeamId,
      homeTeamId,
      squadHome,
      squadAway,
      playingElevenHome,
      playingElevenAway,
    });
  }, [battingTeamId, bowlingTeamId, homeTeamId, squadHome, squadAway, playingElevenHome, playingElevenAway]);

  // Draft state — reset whenever server squads change after a save.

  const [battingDraft, setBattingDraft] = useState(null);
  const [bowlingDraft, setBowlingDraft] = useState(null);

  useEffect(() => {
    setBattingDraft(null);
  }, [serverSquads.battingSquad]);
  useEffect(() => {
    setBowlingDraft(null);
  }, [serverSquads.bowlingSquad]);

  const battingSquad = battingDraft ?? serverSquads.battingSquad;
  const bowlingSquad = bowlingDraft ?? serverSquads.bowlingSquad;

  const setBattingSquad = useCallback(
    (fn) => setBattingDraft((prev) => fn(prev ?? serverSquads.battingSquad)),
    [serverSquads.battingSquad],
  );
  const setBowlingSquad = useCallback(
    (fn) => setBowlingDraft((prev) => fn(prev ?? serverSquads.bowlingSquad)),
    [serverSquads.bowlingSquad],
  );

  const setBatsmanRole = useCallback(
    (id, role) => setBattingSquad((prev) => prev.map((b) => (String(b.id) === String(id) ? { ...b, role } : b))),
    [setBattingSquad],
  );
  const setBowlerRole = useCallback(
    (id, role) => setBowlingSquad((prev) => prev.map((b) => (String(b.id) === String(id) ? { ...b, role } : b))),
    [setBowlingSquad],
  );
  const addPlayerToBattingSquad = useCallback(
    (row) => {
      if (!row?.id) return;
      setBattingSquad((prev) => (prev.some((p) => String(p.id) === String(row.id)) ? prev : [...prev, row]));
    },
    [setBattingSquad],
  );
  const removePlayerFromBattingSquad = useCallback(
    (playerId) => setBattingSquad((prev) => prev.filter((p) => String(p.id) !== String(playerId))),
    [setBattingSquad],
  );
  const addPlayerToBowlingSquad = useCallback(
    (row) => {
      if (!row?.id) return;
      setBowlingSquad((prev) => (prev.some((p) => String(p.id) === String(row.id)) ? prev : [...prev, row]));
    },
    [setBowlingSquad],
  );
  const removePlayerFromBowlingSquad = useCallback(
    (playerId) => setBowlingSquad((prev) => prev.filter((p) => String(p.id) !== String(playerId))),
    [setBowlingSquad],
  );

  const expectedXiSize = useMemo(() => {
    const n = match?.playersPerSide;
    return n != null && Number.isFinite(Number(n)) ? Number(n) : 11;
  }, [match?.playersPerSide]);

  const battingXiSavedOnApi = useMemo(
    () => Array.isArray(battingPlayingElevenIds) && battingPlayingElevenIds.length >= expectedXiSize,
    [battingPlayingElevenIds, expectedXiSize],
  );
  const bowlingXiSavedOnApi = useMemo(
    () => Array.isArray(bowlingPlayingElevenIds) && bowlingPlayingElevenIds.length >= expectedXiSize,
    [bowlingPlayingElevenIds, expectedXiSize],
  );

  const addBatsmanDialogPlayers = useMemo(() => {
    if (!battingXiSavedOnApi) return battingSquad;
    const ids = new Set((battingPlayingElevenIds ?? []).map(String));
    const filtered = battingSquad.filter((p) => p.id != null && ids.has(String(p.id)));
    return filtered.length > 0 ? filtered : battingSquad;
  }, [battingSquad, battingPlayingElevenIds, battingXiSavedOnApi]);

  const addBowlerDialogPlayers = useMemo(() => {
    if (!bowlingXiSavedOnApi) return bowlingSquad;
    const ids = new Set((bowlingPlayingElevenIds ?? []).map(String));
    const filtered = bowlingSquad.filter((p) => p.id != null && ids.has(String(p.id)));
    return filtered.length > 0 ? filtered : bowlingSquad;
  }, [bowlingSquad, bowlingPlayingElevenIds, bowlingXiSavedOnApi]);

  const battingCount = battingSquad.filter((p) => Number.isFinite(Number(p.id))).length;
  const bowlingCount = bowlingSquad.filter((p) => Number.isFinite(Number(p.id))).length;
  const playersPerSide = match?.playersPerSide;
  const matchStatus = apiMatch?.status ?? null;
  const matchHasStarted = matchStatus === 'toss_done' || matchStatus === 'in_progress';
  const configuredPerSide =
    playersPerSide != null && Number.isFinite(Number(playersPerSide)) ? Number(playersPerSide) : expectedXiSize;

  const requiredBatting = matchHasStarted
    ? configuredPerSide
    : playersPerSide != null
      ? Math.min(configuredPerSide, battingCount)
      : battingCount;
  const requiredBowling = matchHasStarted
    ? configuredPerSide
    : playersPerSide != null
      ? Math.min(configuredPerSide, bowlingCount)
      : bowlingCount;

  const battingOrder = useMemo(() => battingSquad.filter((p) => p.role === 'playing'), [battingSquad]);
  const bowlingOrder = useMemo(() => bowlingSquad.filter((p) => p.role === 'playing'), [bowlingSquad]);

  return {
    battingSquad,
    bowlingSquad,
    nameMap: serverSquads.nameMap,
    battingPlayingElevenIds,
    bowlingPlayingElevenIds,
    battingXiSavedOnApi,
    bowlingXiSavedOnApi,
    addBatsmanDialogPlayers,
    addBowlerDialogPlayers,
    battingOrder,
    bowlingOrder,
    battingCount,
    bowlingCount,
    requiredBatting,
    requiredBowling,
    expectedXiSize,
    matchHasStarted,
    configuredPerSide,
    setBatsmanRole,
    setBowlerRole,
    addPlayerToBattingSquad,
    removePlayerFromBattingSquad,
    addPlayerToBowlingSquad,
    removePlayerFromBowlingSquad,
  };
}
