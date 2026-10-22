import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGetRankingsQuery } from '../api/rankingApi';
import { RANKING_CRICKET_FORMAT, RANKING_TOURNAMENT_TYPE } from '../lib/constants';
import { isRankingHubTab, type RankingHubTab, topRankingSlice } from '../lib/rankingPage';
import { toBatterCard, toBowlerCard, toOtherCard } from '../model/schemas';

function useOpenRankings(category: 'batting' | 'bowling', sort: string) {
  return useGetRankingsQuery({
    tournamentType: RANKING_TOURNAMENT_TYPE,
    cricketFormat: RANKING_CRICKET_FORMAT,
    category,
    sort,
  });
}

/** Open-tournament hub: top-N batters / bowlers / sixes / fours. */
export function useRankingPage() {
  const navigate = useNavigate();
  const [tab, setTabState] = useState<RankingHubTab>('batters');

  const batting = useOpenRankings('batting', 'runs');
  const bowling = useOpenRankings('bowling', 'wickets');
  const sixes = useOpenRankings('batting', 'sixes');
  const fours = useOpenRankings('batting', 'fours');

  const topBatters = topRankingSlice(batting.data?.rankings).map(toBatterCard);
  const topBowlers = topRankingSlice(bowling.data?.rankings).map(toBowlerCard);
  const mostSixes = topRankingSlice(sixes.data?.rankings).map((r) => toOtherCard(r, 'sixes'));
  const mostFours = topRankingSlice(fours.data?.rankings).map((r) => toOtherCard(r, 'fours'));

  function setTab(value: string) {
    if (isRankingHubTab(value)) setTabState(value);
  }

  function goBack() {
    navigate(-1);
  }

  return {
    tab,
    setTab,
    batting,
    bowling,
    sixes,
    fours,
    topBatters,
    topBowlers,
    mostSixes,
    mostFours,
    goBack,
  };
}
