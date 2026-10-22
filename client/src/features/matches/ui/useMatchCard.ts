import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';
import { shareLink } from '@/shared/native/share';
import { toast } from '@/shared/ui/toast';

import { useGetScorecardQuery, useGetScoringFixtureQuery, useGetScoringStateQuery } from '../api/matchesApi';
import { scorecardToBallLog } from '../lib/ballLog';
import { ballLogToCommentary } from '../lib/commentary';
import {
  faceChrome,
  fanTabDefs,
  type FanTabId,
  isNotStarted,
  resolveFanTab,
  toMatchBandModel,
} from '../lib/fanMatchView';
import {
  MATCH_CARD_LIVE_POLL_MS,
  matchCardNameById,
  matchCardShareTitle,
  matchCardShowsLiveDock,
  matchCardXiSides,
} from '../lib/matchCard';
import { toPartnershipInnings } from '../lib/partnerships';
import { toScorecardFaces } from '../lib/scorecardFace';
import { toStatsInnings } from '../lib/statsFromScorecard';
import { useMatchScoringChannel } from '../lib/useMatchScoringChannel';

/** Fan match card — fixture, live poll, tabs, share. */
export function useMatchCard(matchId: number, validId: boolean) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const fixtureQuery = useGetScoringFixtureQuery(matchId, { skip: !validId });
  const fixture = fixtureQuery.data;
  const phaseLive = fixture != null && !isNotStarted(fixture.status) && fixture.status !== 'completed';

  useMatchScoringChannel(validId ? matchId : null, { enabled: phaseLive });

  const stateQuery = useGetScoringStateQuery(matchId, {
    skip: !validId || !fixture || isNotStarted(fixture.status),
    pollingInterval: phaseLive ? MATCH_CARD_LIVE_POLL_MS : 0,
  });
  const scorecardQuery = useGetScorecardQuery(matchId, {
    skip: !validId || !fixture || isNotStarted(fixture.status),
    pollingInterval: phaseLive ? MATCH_CARD_LIVE_POLL_MS : 0,
  });

  const hasTable = fixture?.tournamentId != null && fixture.tournamentId > 0;
  const tabOptions = { hasTable };
  const tabDefs = fixture ? fanTabDefs(fixture.status, tabOptions) : [];
  const tab: FanTabId = fixture ? resolveFanTab(searchParams.get('tab'), fixture.status, tabOptions) : 'live';

  function selectTab(next: string) {
    if (!fixture) return;
    const defaultTab = resolveFanTab(null, fixture.status, tabOptions);
    const query = new URLSearchParams(searchParams);
    if (next === defaultTab) query.delete('tab');
    else query.set('tab', next);
    setSearchParams(query, { replace: true });
  }

  const session = stateQuery.data;

  const nameById = useMemo(() => matchCardNameById(session), [session]);

  const scorecardFaces = useMemo(() => {
    if (!scorecardQuery.data || !fixture) return [];
    return toScorecardFaces(scorecardQuery.data.innings, {
      homeTeamId: fixture.home?.id ?? null,
      awayTeamId: fixture.away?.id ?? null,
      homeShort: fixture.home?.short ?? null,
      awayShort: fixture.away?.short ?? null,
      activeBowlerId: session?.bowler?.id ?? null,
      runsToWin: session?.runsToWin ?? null,
      ballsRemaining: session?.ballsRemaining ?? null,
    });
  }, [scorecardQuery.data, fixture, session?.bowler?.id, session?.runsToWin, session?.ballsRemaining]);

  const ballLogInnings = useMemo(() => {
    if (!scorecardQuery.data) return [];
    return scorecardToBallLog(scorecardQuery.data.innings, nameById, {
      matchComplete: session?.matchComplete,
    });
  }, [scorecardQuery.data, nameById, session?.matchComplete]);

  const commentaryItems = useMemo(() => ballLogToCommentary(ballLogInnings), [ballLogInnings]);

  const partnershipInnings = useMemo(() => {
    if (!scorecardQuery.data || !fixture) return [];
    return toPartnershipInnings(scorecardQuery.data.innings, {
      nameById,
      homeTeamId: fixture.home?.id ?? null,
      awayTeamId: fixture.away?.id ?? null,
      homeShort: fixture.home?.short ?? null,
      awayShort: fixture.away?.short ?? null,
    });
  }, [scorecardQuery.data, fixture, nameById]);

  const statsInnings = useMemo(() => {
    if (!scorecardQuery.data || !fixture) return [];
    return toStatsInnings(scorecardQuery.data.innings, {
      oversPerSide: fixture.overs,
      homeTeamId: fixture.home?.id ?? null,
      awayTeamId: fixture.away?.id ?? null,
      homeShort: fixture.home?.short ?? null,
      awayShort: fixture.away?.short ?? null,
    });
  }, [scorecardQuery.data, fixture]);

  const band = useMemo(() => {
    if (!fixture) return null;
    return toMatchBandModel(fixture, session, scorecardFaces);
  }, [fixture, session, scorecardFaces]);

  const xiSides = useMemo(() => {
    if (!fixture) return [];
    return matchCardXiSides(fixture, session);
  }, [fixture, session]);

  const chrome = fixture ? faceChrome(tab, fixture) : { title: 'Match', subtitle: '' };
  const notStarted = fixture ? isNotStarted(fixture.status) : false;
  const showShare = Boolean(fixture && !notStarted && (tab === 'live' || tab === 'commentary'));
  const streamStatus = fixture?.stream?.status?.toLowerCase() ?? '';
  const showLiveDock = matchCardShowsLiveDock(fixture?.stream?.id, notStarted, streamStatus);

  async function share() {
    if (!fixture) return;
    const result = await shareLink({
      title: matchCardShareTitle(fixture),
      url: typeof window !== 'undefined' ? window.location.href : `${APP_PATHS.matchCard}/${matchId}`,
    });
    if (result === 'copied') toast({ title: 'Link Copied', tone: 'success' });
  }

  return {
    navigate,
    matchId,
    fixtureQuery,
    fixture,
    scorecardQuery,
    session,
    tab,
    tabDefs,
    selectTab,
    scorecardFaces,
    commentaryItems,
    partnershipInnings,
    statsInnings,
    band,
    xiSides,
    chrome,
    notStarted,
    showShare,
    showLiveDock,
    hasTable,
    share,
  };
}
