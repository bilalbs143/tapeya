import { useMemo } from 'react';

import { apiMatchToUiMatchConfig, getDefaultInnings1TeamIds } from '@/lib/utils/scoringMappers';
import { useGetMatchQuery, useGetMatchStateQuery, useGetScorecardQuery } from '@/store/api/matchApi';
import { useGetTeamSquadQuery } from '@/store/api/teamApi';

/** @param {string|undefined} matchId */
export function useScoringMatchData(matchId) {
  const { data: apiMatch, isLoading: matchLoading, isError: matchError } = useGetMatchQuery(matchId, { skip: !matchId });

  const { data: scorecard } = useGetScorecardQuery(matchId, {
    skip: !matchId || !apiMatch,
  });

  const homeTeamId = apiMatch?.home_team_id ?? apiMatch?.home_team?.id;
  const awayTeamId = apiMatch?.away_team_id ?? apiMatch?.away_team?.id;

  const { data: squadHome } = useGetTeamSquadQuery(homeTeamId, { skip: !matchId || !homeTeamId });
  const { data: squadAway } = useGetTeamSquadQuery(awayTeamId, { skip: !matchId || !awayTeamId });

  const { data: matchState } = useGetMatchStateQuery(matchId, { skip: !matchId || !apiMatch });

  const wagonWheelEnabled = Boolean(
    apiMatch?.analytics_settings?.wagon_wheel_enabled ?? matchState?.analytics_settings?.wagon_wheel_enabled,
  );

  const playingElevenHome = matchState?.playing_eleven?.home;
  const playingElevenAway = matchState?.playing_eleven?.away;

  const match = useMemo(() => {
    if (!apiMatch) return null;
    const needsScorecardForLegacyToss =
      apiMatch.status === 'completed' && apiMatch.toss_winner_team_id == null && apiMatch.chose_to_bat_or_bowl != null;
    if (needsScorecardForLegacyToss && !scorecard?.innings?.[0]) return null;

    const homeSquadArr = Array.isArray(squadHome) ? squadHome : [];
    const awaySquadArr = Array.isArray(squadAway) ? squadAway : [];
    const { battingTeamId } = getDefaultInnings1TeamIds(apiMatch, scorecard);
    const hid = apiMatch.home_team_id != null ? Number(apiMatch.home_team_id) : null;
    const homeIsBatting = battingTeamId != null && hid != null && Number(battingTeamId) === hid;

    const batSquadArr = homeIsBatting ? homeSquadArr : awaySquadArr;
    const bowlSquadArr = homeIsBatting ? awaySquadArr : homeSquadArr;
    const batIds = homeIsBatting ? (playingElevenHome?.player_ids ?? []) : (playingElevenAway?.player_ids ?? []);
    const bowlIds = homeIsBatting ? (playingElevenAway?.player_ids ?? []) : (playingElevenHome?.player_ids ?? []);

    const battingPlayers = batIds.map((id) => {
      const u = batSquadArr.find((x) => x.id === id);
      return { id, name: u?.name ?? u?.nickname ?? `Player ${id}` };
    });
    const bowlingPlayers = bowlIds.map((id) => {
      const u = bowlSquadArr.find((x) => x.id === id);
      return { id, name: u?.name ?? u?.nickname ?? `Player ${id}` };
    });

    return apiMatchToUiMatchConfig(apiMatch, battingPlayers, bowlingPlayers, scorecard);
  }, [apiMatch, scorecard, playingElevenHome?.player_ids, playingElevenAway?.player_ids, squadHome, squadAway]);

  const innings1Id = useMemo(() => (scorecard?.innings?.[0] ? scorecard.innings[0].id : null), [scorecard?.innings]);
  const innings2Id = useMemo(() => (scorecard?.innings?.[1] ? scorecard.innings[1].id : null), [scorecard?.innings]);

  const matchComplete = useMemo(() => {
    if (!apiMatch) return false;
    if (apiMatch.status === 'completed' || apiMatch.status === 'cancelled') return true;
    const i1 = scorecard?.innings?.[0];
    const i2 = scorecard?.innings?.[1];
    if (!i1 || !i2) return false;
    return i1.status === 'completed' && i2.status === 'completed';
  }, [apiMatch, scorecard?.innings]);

  return {
    apiMatch,
    matchLoading,
    matchError,
    scorecard,
    matchState,
    match,
    homeTeamId,
    awayTeamId,
    wagonWheelEnabled,
    innings1Id,
    innings2Id,
    matchComplete,
  };
}
