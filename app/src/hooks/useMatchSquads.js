import { useMemo } from 'react';

import { useScoringMatch } from '@/context/ScoringMatchContext';
import { buildInningsSquads, getDefaultInnings1TeamIds } from '@/lib/utils/scoringMappers';
import { useGetMatchQuery, useGetMatchStateQuery, useGetScorecardQuery } from '@/store/api/matchApi';
import { useGetTeamSquadQuery } from '@/store/api/teamApi';

/**
 * Returns innings1Squads and innings2Squads (battingSquad, bowlingSquad, nameMap).
 * Reads from the RTK cache — no extra network requests.
 */
export function useMatchSquads() {
  const { matchId } = useScoringMatch();

  const { data: apiMatch } = useGetMatchQuery(matchId, { skip: !matchId });
  const { data: scorecard } = useGetScorecardQuery(matchId, { skip: !matchId });
  const { data: matchState } = useGetMatchStateQuery(matchId, { skip: !matchId });

  const homeTeamId = apiMatch?.home_team_id ?? apiMatch?.home_team?.id;
  const awayTeamId = apiMatch?.away_team_id ?? apiMatch?.away_team?.id;

  const { data: squadHome } = useGetTeamSquadQuery(homeTeamId, { skip: !homeTeamId });
  const { data: squadAway } = useGetTeamSquadQuery(awayTeamId, { skip: !awayTeamId });

  const playingElevenHome = matchState?.playing_eleven?.home;
  const playingElevenAway = matchState?.playing_eleven?.away;

  const defaultTeams = useMemo(() => getDefaultInnings1TeamIds(apiMatch, scorecard), [apiMatch, scorecard]);

  const innings1Squads = useMemo(() => {
    const sc = scorecard?.innings?.[0];
    const bat1TeamId = sc?.batting_team_id ?? defaultTeams.battingTeamId;
    const bowl1TeamId = sc?.bowling_team_id ?? defaultTeams.bowlingTeamId;
    if (bat1TeamId == null || bowl1TeamId == null) return { battingSquad: [], bowlingSquad: [], nameMap: {} };
    return buildInningsSquads({
      battingTeamId: bat1TeamId,
      bowlingTeamId: bowl1TeamId,
      homeTeamId,
      squadHome,
      squadAway,
      playingElevenHome,
      playingElevenAway,
    });
  }, [scorecard?.innings, defaultTeams, homeTeamId, squadHome, squadAway, playingElevenHome, playingElevenAway]);

  const innings2Squads = useMemo(() => {
    const sc1 = scorecard?.innings?.[0];
    const sc2 = scorecard?.innings?.[1];
    const ai = matchState?.active_innings;
    const bat2TeamId = sc2?.batting_team_id ?? ai?.batting_team_id ?? sc1?.bowling_team_id;
    const bowl2TeamId = sc2?.bowling_team_id ?? ai?.bowling_team_id ?? sc1?.batting_team_id;
    if (bat2TeamId == null || bowl2TeamId == null) return { battingSquad: [], bowlingSquad: [], nameMap: {} };
    return buildInningsSquads({
      battingTeamId: bat2TeamId,
      bowlingTeamId: bowl2TeamId,
      homeTeamId,
      squadHome,
      squadAway,
      playingElevenHome,
      playingElevenAway,
    });
  }, [scorecard?.innings, matchState?.active_innings, homeTeamId, squadHome, squadAway, playingElevenHome, playingElevenAway]);

  return { innings1Squads, innings2Squads };
}
