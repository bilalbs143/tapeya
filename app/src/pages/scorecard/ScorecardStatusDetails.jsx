/**
 * Match detail screen — live, result, or upcoming match info with tab navigation.
 * Routes:
 *   /scorecard/:tournamentId/match/:matchId  — tournament fixture (table/stats/fixture tabs)
 *   /scorecard/match/:matchId                — standalone / Quick Match (no tournament chrome)
 */

import { useEffect, useMemo, useState } from 'react';

import { useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { OpenInAppBanner } from '@/components/deepLinks/OpenInAppBanner';
import { CommentaryText } from '@/components/scorecard/CommentaryText';
import { TeamLogo } from '@/components/TeamLogo';
import { useMatchScoringChannel } from '@/hooks/useMatchScoringChannel';
import { useToast } from '@/hooks/useToast';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { buildQuickMatchScorecardPath, buildQuickMatchScorecardShareUrl, shareLink } from '@/lib/share';
import { calculateStrikeRate } from '@/lib/utils/matchPlayerStatsUtils';
import {
  apiTournamentMatchToStatusDetailsMatch,
  buildMatchStatusDetails,
  minimalStatusDetailsFromApi,
  normaliseTournamentMatches,
  oversDetailsFromScorecard,
  playingXIFromPlayingElevenResponses,
} from '@/lib/utils/scorecardUtils';
import { isValidTournamentId } from '@/lib/utils/tournamentUtils';
import { useGetMatchQuery, useGetMatchStateQuery, useGetScorecardQuery } from '@/store/api/matchApi';
import { useGetTournamentMatchesQuery } from '@/store/api/tournamentApi';
import { Container } from '@/ui/Container';
import { PageLoader } from '@/ui/Loader';
import { scorecardListClass, scorecardTriggerClass, Tabs, TabsList, TabsTrigger } from '@/ui/Tabs';

import {
  StatusDetailsLiveTab,
  StatusDetailsOversTab,
  StatusDetailsPlaceholderTab,
  StatusDetailsPlayingXITab,
  StatusDetailsScorecardTab,
} from './statusDetailsTabs';
import { ScheduleTab, StatsTab, TableTab } from './tabs';

const winProbabilityIcon = `${CLOUDFRONT_APP_BASE}/images/icons/win-probabilty.svg`;

const TOURNAMENT_STATUS_TABS = {
  live: [
    { value: 'live', label: 'Live' },
    { value: 'scorecard', label: 'Scorecard' },
    { value: 'overs', label: 'Overs' },
    { value: 'table', label: 'Table' },
    { value: 'playing-xi', label: 'Playing XI' },
  ],
  result: [
    { value: 'scorecard', label: 'Scorecard' },
    { value: 'overs', label: 'Overs' },
    { value: 'table', label: 'Table' },
    { value: 'playing-xi', label: 'Playing XI' },
  ],
  upcoming: [
    { value: 'table', label: 'Table' },
    { value: 'playing-xi', label: 'Playing XI' },
    { value: 'fixture', label: 'Fixture' },
    { value: 'stats', label: 'Stats' },
  ],
};

const STANDALONE_STATUS_TABS = {
  live: [
    { value: 'live', label: 'Live' },
    { value: 'scorecard', label: 'Scorecard' },
    { value: 'overs', label: 'Overs' },
    { value: 'playing-xi', label: 'Playing XI' },
  ],
  result: [
    { value: 'scorecard', label: 'Scorecard' },
    { value: 'overs', label: 'Overs' },
    { value: 'playing-xi', label: 'Playing XI' },
  ],
  upcoming: [{ value: 'playing-xi', label: 'Playing XI' }],
};

const STATUS_DEFAULT_TAB = {
  live: 'live',
  result: 'scorecard',
  upcoming: 'table',
};

const STANDALONE_DEFAULT_TAB = {
  live: 'live',
  result: 'scorecard',
  upcoming: 'playing-xi',
};

const TAB_VIEWS = {
  live: StatusDetailsLiveTab,
  scorecard: StatusDetailsScorecardTab,
  overs: StatusDetailsOversTab,
  'playing-xi': StatusDetailsPlayingXITab,
  table: TableTab,
  stats: StatsTab,
  fixture: ScheduleTab,
};

function parseLiveScore(score) {
  if (!score || typeof score !== 'string') return { current: score, overs: null };
  const idx = score.indexOf(' (');
  if (idx === -1) return { current: score, overs: null };
  return { current: score.slice(0, idx), overs: score.slice(idx) };
}

function ResultTextHighlighted({ text, highlight }) {
  if (!highlight || !text.includes(highlight)) {
    return <span className="text-white">{text}</span>;
  }
  const [before, after] = text.split(highlight);
  return (
    <span className="text-[14px] font-normal text-white">
      {before}
      <span className="text-brand font-semibold">{highlight}</span>
      {after}
    </span>
  );
}

function TeamFlag({ team }) {
  return <TeamLogo team={team} variant="scorecardInline" accent="green" />;
}

function WinProbabilityCard({ match, winProb }) {
  const p1 = winProb.team1;
  const p2 = winProb.team2;
  const higherIsTeam2 = p2 >= p1;

  return (
    <div className="border-surface-border border-t px-4 py-4">
      <div className="mt-2 mb-6 flex items-center justify-center gap-2">
        <img src={winProbabilityIcon} alt="" className="h-5 w-5 shrink-0" aria-hidden />
        <span className="text-muted text-[14px] font-bold">Win Probability</span>
      </div>
      <div className="flex items-stretch">
        <div className="flex flex-1 flex-col items-center justify-center">
          <span className="text-muted mb-1 text-[14px]">{match.team1.name}</span>
          <span className={`text-[14px] font-bold ${higherIsTeam2 ? 'text-white' : 'text-brand'}`}>{p1}%</span>
        </div>
        <div className="w-px shrink-0 self-stretch bg-gradient-to-b from-transparent via-white/40 to-transparent" aria-hidden />
        <div className="flex flex-1 flex-col items-center justify-center">
          <span className="text-muted mb-1 text-[12px]">{match.team2.name}</span>
          <span className={`text-[18px] font-bold ${higherIsTeam2 ? 'text-brand' : 'text-white'}`}>{p2}%</span>
        </div>
      </div>
    </div>
  );
}

function MatchHeader({ match, details, kindLabel }) {
  const { status, matchId, team1, team2, score1, score2, meta } = match;
  const isUpcoming = status === 'upcoming';
  const isLive = status === 'live';
  const isResult = status === 'result';
  const liveScore2 = !isUpcoming ? parseLiveScore(score2) : null;

  return (
    <div className="px-4 pb-4">
      {kindLabel ? <p className="text-brand mb-2 text-[11px] font-bold tracking-wide uppercase">{kindLabel}</p> : null}
      {isUpcoming ? (
        <>
          <p className="mb-1 text-[13px] font-bold text-white uppercase">{status}</p>
          <p className="text-muted mb-3 text-[12px]">{matchId}</p>
        </>
      ) : (
        <div className="mb-4">
          <span className="shrink-0 text-[13px] font-bold text-white uppercase">{isLive ? 'LIVE' : 'RESULT'}</span>
          <p className="text-muted mt-2 text-[12px]">{matchId}</p>
        </div>
      )}

      <div className="mb-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <TeamFlag team={team1} />
            <span className="truncate text-[14px] font-semibold text-white">{team1.name}</span>
          </div>
          {isUpcoming ? (
            <span className="text-muted shrink-0 text-[14px]">{meta?.time}</span>
          ) : (
            score1 && <span className="text-muted shrink-0 text-[14px] font-medium">{score1}</span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <TeamFlag team={team2} />
            <span className="truncate text-[14px] font-semibold text-white">{team2.name}</span>
          </div>
          {isUpcoming ? (
            <span className="shrink-0 text-[16px] font-bold text-white">{meta?.startsIn}</span>
          ) : (
            score2 && (
              <span className="shrink-0 text-right">
                {liveScore2?.overs && <span className="text-muted text-[14px]">{liveScore2.overs} </span>}
                <span className="text-brand text-[14px] font-bold">{liveScore2?.current ?? score2}</span>
              </span>
            )
          )}
        </div>
      </div>

      {isLive && meta?.commentary && (
        <p className="mb-3">
          <CommentaryText text={meta.commentary} className="text-[14px] text-white" />
        </p>
      )}

      {isLive && details?.crr && (
        <div className="mb-1 flex gap-2">
          <span className="bg-surface text-muted rounded-full px-3 py-3 text-[12px] font-medium">CRR: {details.crr}</span>
          <span className="bg-surface text-muted rounded-full px-3 py-3 text-[12px] font-medium">RRR: {details.rrr}</span>
        </div>
      )}

      {isResult && details?.resultText && <ResultTextHighlighted text={details.resultText} highlight={details.resultHighlight} />}
    </div>
  );
}

export default function ScorecardStatusDetails() {
  const { tournamentId, matchId } = useParams();
  const toast = useToast();

  const matchIdNum = matchId != null && matchId !== '' ? Number(matchId) : NaN;
  const matchIdOk = Number.isInteger(matchIdNum) && matchIdNum > 0;
  const tournamentOk = isValidTournamentId(tournamentId);
  /** Route `/scorecard/match/:matchId` has no tournament segment. */
  const standaloneRoute = tournamentId == null || tournamentId === '';

  const { data: apiMatch, isLoading: matchLoading, isError: matchIsError } = useGetMatchQuery(matchId, { skip: !matchIdOk });

  const isQuick = apiMatch?.kind === 'quick' || apiMatch?.tournament_id == null;
  const standalone = standaloneRoute || isQuick;

  const tournamentMismatch = !standalone && Boolean(apiMatch) && Number(apiMatch.tournament_id) !== Number(tournamentId);

  const { data: scorecard } = useGetScorecardQuery(matchId, {
    skip: !matchIdOk || !apiMatch || tournamentMismatch,
  });

  const { data: rawTournamentMatches = [] } = useGetTournamentMatchesQuery(
    { tournamentId, all: true },
    { skip: standalone || !tournamentOk || tournamentMismatch },
  );

  const isActive =
    !tournamentMismatch && matchIdOk && !!apiMatch && (apiMatch.status === 'toss_done' || apiMatch.status === 'in_progress');

  const { data: matchState } = useGetMatchStateQuery(matchId, {
    skip: !isActive,
  });

  useMatchScoringChannel(isActive ? matchId : null);

  const scheduleMatches = useMemo(
    () => normaliseTournamentMatches([{ id: tournamentId, matches: rawTournamentMatches }]),
    [tournamentId, rawTournamentMatches],
  );

  const match = useMemo(() => {
    if (!apiMatch || tournamentMismatch) return null;
    return apiTournamentMatchToStatusDetailsMatch(apiMatch, scorecard);
  }, [apiMatch, scorecard, tournamentMismatch]);

  const details = useMemo(() => {
    if (!apiMatch || tournamentMismatch) return null;
    const resultBits = minimalStatusDetailsFromApi(apiMatch);
    const overs = oversDetailsFromScorecard(scorecard, apiMatch.home_team_id, apiMatch.away_team_id);
    const xiHome = matchState?.playing_eleven?.home ?? null;
    const xiAway = matchState?.playing_eleven?.away ?? null;
    const playingXI = playingXIFromPlayingElevenResponses(xiHome, xiAway);
    return buildMatchStatusDetails(resultBits, overs, playingXI);
  }, [apiMatch, tournamentMismatch, scorecard, matchState?.playing_eleven]);

  const liveDetails = useMemo(() => {
    const ai = matchState?.active_innings;
    if (!ai) return null;

    const toBatter = (b) => {
      if (!b) return null;
      const sr = calculateStrikeRate(b.runs, b.balls, 2);
      return {
        name: b.name ?? '',
        r: b.runs ?? 0,
        b: b.balls ?? 0,
        fours: b.fours ?? 0,
        sixes: b.sixes ?? 0,
        sr,
      };
    };

    const batters = [ai.striker, ai.non_striker].map(toBatter).filter(Boolean);
    const bowlers = ai.bowler
      ? [
          {
            name: ai.bowler.name ?? '',
            o: ai.bowler.overs ?? '0',
            m: ai.bowler.maidens ?? 0,
            r: ai.bowler.runs ?? 0,
            w: ai.bowler.wickets ?? 0,
          },
        ]
      : [];
    const cp = ai.current_partnership;
    const partnership = cp ? `${cp.runs} runs (${cp.balls} balls)` : null;

    return {
      ...details,
      batters,
      bowlers,
      partnership,
      crr: ai.current_run_rate ?? details?.crr ?? null,
      rrr: ai.required_run_rate ?? details?.rrr ?? null,
    };
  }, [matchState, details]);

  const liveMatch = useMemo(() => {
    const ai = matchState?.active_innings;
    if (!match) return match;

    let next = match;
    if (ai && ai.innings_status !== 'completed') {
      const liveScore = `${ai.total_runs ?? 0}/${ai.total_wickets ?? 0}`;
      const hid = apiMatch?.home_team_id != null ? Number(apiMatch.home_team_id) : null;
      const battingTeamId = ai.batting_team_id != null ? Number(ai.batting_team_id) : null;
      next = battingTeamId === hid ? { ...match, score1: liveScore } : { ...match, score2: liveScore };
    }

    if (match.status === 'live' && ai) {
      let commentary = next.meta?.commentary ?? null;
      if (ai.innings_number === 1) {
        commentary = `Current run rate: ${ai.current_run_rate ?? '0.00'}.`;
      } else if (ai.runs_to_win != null) {
        const battingName = Number(ai.batting_team_id) === Number(apiMatch?.home_team_id) ? match.team1?.name : match.team2?.name;
        const balls = ai.balls_remaining;
        if (balls == null) commentary = `${battingName} need ${ai.runs_to_win} runs.`;
        else if (balls % 6 === 0) commentary = `${battingName} need ${ai.runs_to_win} runs from ${balls / 6} overs.`;
        else commentary = `${battingName} need ${ai.runs_to_win} runs from ${balls} balls.`;
      }
      if (commentary) {
        next = { ...next, meta: { ...(next.meta ?? {}), commentary } };
      }
    }

    return next;
  }, [match, matchState?.active_innings, apiMatch?.home_team_id]);

  const status = match?.status ?? 'upcoming';
  const tabSets = standalone ? STANDALONE_STATUS_TABS : TOURNAMENT_STATUS_TABS;
  const defaults = standalone ? STANDALONE_DEFAULT_TAB : STATUS_DEFAULT_TAB;
  const tabs = tabSets[status] ?? [];
  const defaultTab = defaults[status] ?? tabs[0]?.value;

  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    const nextDefault = defaults[status] ?? tabSets[status]?.[0]?.value;
    setActiveTab(nextDefault);
  }, [status, matchId, standalone]);

  if (!matchIdOk || (!standaloneRoute && !tournamentOk)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-black px-4">
        <p className="text-muted text-center text-[13px]">Invalid match or tournament link.</p>
      </div>
    );
  }

  if (matchLoading) {
    return <PageLoader label="Loading match" className="min-h-[40vh] bg-black py-12" />;
  }

  if (matchIsError || tournamentMismatch || !apiMatch || !match) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-black px-4">
        <p className="text-muted text-center text-[13px]">
          {tournamentMismatch ? 'This match does not belong to this tournament.' : 'Match not found.'}
        </p>
      </div>
    );
  }

  const ActiveView = TAB_VIEWS[activeTab] ?? StatusDetailsPlaceholderTab;

  const tabProps = {
    live: { details: liveDetails ?? details },
    scorecard: { details },
    overs: { match, details },
    'playing-xi': { match, details },
    table: { tournamentId },
    stats: { tournamentId },
    fixture: { matches: scheduleMatches, tournamentId },
  };

  const kindLabel =
    apiMatch.kind === 'quick'
      ? [
          'Quick Match',
          apiMatch.cricket_format_label ?? apiMatch.cricket_format,
          apiMatch.overs != null ? `${apiMatch.overs} ov` : null,
        ]
          .filter(Boolean)
          .join(' · ')
      : null;

  const sharePath = standalone ? buildQuickMatchScorecardPath(matchId) : null;

  const handleShare = async () => {
    if (!sharePath) return;
    const url = buildQuickMatchScorecardShareUrl(matchId);
    const home = apiMatch.home_team?.name ?? 'Home';
    const away = apiMatch.away_team?.name ?? 'Away';
    const result = await shareLink({
      url,
      title: `${home} vs ${away}`,
      text: `Watch on Tapeya: ${home} vs ${away}`,
    });
    if (result === 'copy_link') {
      toast.success('Link copied.');
    }
  };

  return (
    <div className="bg-black">
      {sharePath ? <OpenInAppBanner path={sharePath} /> : null}
      <AppSubpageHeader
        title="SCORE CARD"
        right={
          standalone ? (
            <button
              type="button"
              onClick={handleShare}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-opacity active:opacity-80"
              aria-label="Share Match"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : null
        }
      />

      <MatchHeader match={liveMatch} details={liveDetails ?? details} kindLabel={kindLabel} />

      {status === 'live' && details?.winProb && <WinProbabilityCard match={match} winProb={details.winProb} />}

      <Container className="!py-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="-mx-4 bg-black px-4 pt-3 pb-2">
            <TabsList className={scorecardListClass}>
              {tabs.map(({ value, label }) => (
                <TabsTrigger key={value} value={value} className={scorecardTriggerClass}>
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="mt-4">
            <ActiveView {...(tabProps[activeTab] ?? {})} />
          </div>
        </Tabs>
      </Container>
    </div>
  );
}
