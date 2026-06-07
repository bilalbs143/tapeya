/**
 * ScorecardStatusDetails.jsx
 *
 * Match detail screen showing live/result/upcoming match info with a
 * tab-based view switcher.  The available tabs and the default tab depend
 * on the current match status.
 *
 * Route: /scorecard/:tournamentId/match/:matchId
 *
 * -----------------------------------------------------------------------------
 * CURSOR — File structure guide
 * -----------------------------------------------------------------------------
 *
 * Data source
 * ───────────
 *   GET /matches/:matchId, GET /matches/:matchId/scorecard,
 *   GET /tournaments/:tournamentId/matches — see scorecardUtils mappers.
 *
 * Utils to move out of this file
 * ───────────────────────────────
 *   parseLiveScore(score)
 *     → move to: src/lib/utils/scorecardUtils.js → export { parseLiveScore }
 *     reason: pure string transform, unit-testable, potentially reused on
 *             match-card components.
 *
 * Components to extract into their own files
 * ───────────────────────────────────────────
 *   <ResultTextHighlighted>
 *     → move to: src/features/scorecard/components/ResultTextHighlighted.jsx
 *     reason: highlight-a-word-in-gold is a self-contained display component
 *             that may be reused in match summaries or notification cards.
 *
 *   <TeamFlag>
 *     → move to: src/features/scorecard/components/TeamFlag.jsx
 *     reason: flag-with-initial-fallback will appear on every screen that
 *             shows team identities (match cards, standings table).
 *
 *   <WinProbabilityCard>
 *     → move to: src/features/scorecard/components/WinProbabilityCard.jsx
 *     reason: self-contained card with its own layout and conditional colour
 *             logic — extracting makes it independently testable.
 *
 *   <MatchHeader>
 *     → move to: src/features/scorecard/components/MatchHeader.jsx
 *     reason: the largest sub-component here — renders differently for all
 *             three statuses (upcoming / live / result) and already accepts
 *             clean props.
 *
 * Hooks to extract
 * ─────────────────
 *   Sentinel-based sticky tabs visibility (tabsFixedVisible + IntersectionObserver)
 *     → move to: src/hooks/useFixedOnScroll.js → export { useFixedOnScroll }
 *     reason: **identical** pattern in ScorecardHome.jsx and ScorecardDetails.jsx.
 *             One hook replaces all three:
 *               const { sentinelRef, isFixed } = useFixedOnScroll(NAVBAR_HEIGHT);
 *     NOTE: ScorecardStatusDetails does NOT currently use this pattern — the
 *           fixed tab bar is not implemented here yet.  Add when needed and use
 *           the shared hook from the start.
 *
 * Constants to move
 * ──────────────────
 *   FLAGS
 *     → move to: src/lib/constants/teamFlags.js
 *     reason: hardcoded to `karachi` and `rawalpindi` only — needs to grow as
 *             more teams are added.  A constants file is easier to maintain
 *             than hunting through this component.
 *
 * Behaviour notes for Cursor
 * ──────────────────────────
 *   TODO: `tabProps` is rebuilt on every render and includes props for all
 *         tab keys even though only one tab is active at a time.  This is
 *         harmless for plain objects but could cause unnecessary re-renders if
 *         any value is a derived object/array.  Lazily compute only the active
 *         tab's props:
 *           const activeTabProps = tabProps[activeTab] ?? {};
 *
 *   TODO: The `useEffect([status, matchId])` that resets `activeTab` will
 *         silently reset the tab if `status` changes while the user is viewing
 *         a non-default tab (e.g. reading the scorecard when a live match ends).
 *         If that behaviour is undesired, gate the reset on `matchId` only and
 *         let the user stay on their current tab after a status change.
 *
 *   TODO: `FLAGS` only maps `karachi` and `rawalpindi`.  When new teams are
 *         added the `TeamFlag` fallback (coloured initial square) will be used
 *         silently.  Add a DEV-only console.warn when `team.flag` is set but
 *         not found in `FLAGS` so missing entries are caught early.
 * -----------------------------------------------------------------------------
 */

import { useEffect, useMemo, useState } from 'react';

import { useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { CommentaryText } from '@/components/scorecard/CommentaryText';
import { TeamLogo } from '@/components/TeamLogo';
import { useMatchScoringChannel } from '@/hooks/useMatchScoringChannel';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
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
import { scorecardListClass, scorecardTriggerClass, Tabs, TabsList, TabsTrigger } from '@/ui/Tabs';

import {
  StatusDetailsLiveTab,
  StatusDetailsOversTab,
  StatusDetailsPlaceholderTab,
  StatusDetailsPlayingXITab,
  StatusDetailsScorecardTab,
} from './statusDetailsTabs';
import { ScheduleTab, StatsTab, TableTab } from './tabs';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const winProbabilityIcon = `${CLOUDFRONT_APP_BASE}/images/icons/win-probabilty.svg`;

const STATUS_TABS = {
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

const STATUS_DEFAULT_TAB = {
  live: 'live',
  result: 'scorecard',
  upcoming: 'table',
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

// ---------------------------------------------------------------------------
// Utils
// CURSOR: move parseLiveScore to src/lib/utils/scorecardUtils.js (see top).
// ---------------------------------------------------------------------------

/**
 * Parses a live score string into current score and overs context.
 * e.g. "27/1 (4.4/50 OV, T:235)" → { current: "27/1", overs: "(4.4/50 OV, T:235)" }
 * CURSOR: move to src/lib/utils/scorecardUtils.js → export { parseLiveScore }
 */
function parseLiveScore(score) {
  if (!score || typeof score !== 'string') return { current: score, overs: null };
  const idx = score.indexOf(' (');
  if (idx === -1) return { current: score, overs: null };
  return { current: score.slice(0, idx), overs: score.slice(idx) };
}

// ---------------------------------------------------------------------------
// Sub-components
// CURSOR: move each to its own file once extracted (see top).
// ---------------------------------------------------------------------------

/**
 * ResultTextHighlighted — highlights a specific word/phrase in gold.
 * CURSOR: move to src/features/scorecard/components/ResultTextHighlighted.jsx
 */
function ResultTextHighlighted({ text, highlight }) {
  if (!highlight || !text.includes(highlight)) {
    return <span className="text-white">{text}</span>;
  }
  const [before, after] = text.split(highlight);
  return (
    <span className="text-[14px] font-normal text-white">
      {before}
      <span className="font-semibold text-[#DA9811]">{highlight}</span>
      {after}
    </span>
  );
}

/**
 * TeamFlag — team logo with coloured-initial fallback.
 * CURSOR: replaced by shared TeamLogo; keep alias for local readability.
 */
function TeamFlag({ team }) {
  return <TeamLogo team={team} variant="scorecardInline" accent="green" />;
}

/**
 * WinProbabilityCard — win probability bar shown only for LIVE matches.
 * CURSOR: move to src/features/scorecard/components/WinProbabilityCard.jsx
 */
function WinProbabilityCard({ match, winProb }) {
  const p1 = winProb.team1;
  const p2 = winProb.team2;
  const higherIsTeam2 = p2 >= p1;

  return (
    <div className="border-t border-[#1A1A1A] px-4 py-4">
      <div className="mt-2 mb-6 flex items-center justify-center gap-2">
        <img src={winProbabilityIcon} alt="" className="h-5 w-5 shrink-0" aria-hidden />
        <span className="text-[14px] font-bold text-[#A2A6AB]">Win Probability</span>
      </div>
      <div className="flex items-stretch">
        <div className="flex flex-1 flex-col items-center justify-center">
          <span className="mb-1 text-[14px] text-[#A2A6AB]">{match.team1.name}</span>
          <span className={`text-[14px] font-bold ${higherIsTeam2 ? 'text-white' : 'text-[#DA9811]'}`}>{p1}%</span>
        </div>
        <div className="w-px shrink-0 self-stretch bg-gradient-to-b from-transparent via-white/40 to-transparent" aria-hidden />
        <div className="flex flex-1 flex-col items-center justify-center">
          <span className="mb-1 text-[12px] text-[#A2A6AB]">{match.team2.name}</span>
          <span className={`text-[18px] font-bold ${higherIsTeam2 ? 'text-[#DA9811]' : 'text-white'}`}>{p2}%</span>
        </div>
      </div>
    </div>
  );
}

/**
 * MatchHeader — renders match identity and score differently per status.
 * CURSOR: move to src/features/scorecard/components/MatchHeader.jsx
 */
function MatchHeader({ match, details }) {
  const { status, matchId, team1, team2, score1, score2, meta } = match;
  const isUpcoming = status === 'upcoming';
  const isLive = status === 'live';
  const isResult = status === 'result';
  const liveScore2 = !isUpcoming ? parseLiveScore(score2) : null;

  return (
    <div className="px-4 pb-4">
      {isUpcoming ? (
        <>
          <p className="mb-1 text-[13px] font-bold text-white uppercase">{status}</p>
          <p className="mb-3 text-[12px] text-[#A2A6AB]">{matchId}</p>
        </>
      ) : (
        <div className="mb-4">
          <span className="shrink-0 text-[13px] font-bold text-white uppercase">{isLive ? 'LIVE' : 'RESULT'}</span>
          <p className="mt-2 text-[12px] text-[#A2A6AB]">{matchId}</p>
        </div>
      )}

      <div className="mb-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <TeamFlag team={team1} />
            <span className="truncate text-[14px] font-semibold text-white">{team1.name}</span>
          </div>
          {isUpcoming ? (
            <span className="shrink-0 text-[14px] text-[#A2A6AB]">{meta?.time}</span>
          ) : (
            score1 && <span className="shrink-0 text-[14px] font-medium text-[#A2A6AB]">{score1}</span>
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
                {liveScore2?.overs && <span className="text-[14px] text-[#A2A6AB]">{liveScore2.overs} </span>}
                <span className="text-[14px] font-bold text-[#DA9811]">{liveScore2?.current ?? score2}</span>
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
          <span className="rounded-full bg-[#141412] px-3 py-3 text-[12px] font-medium text-[#A2A6AB]">CRR: {details.crr}</span>
          <span className="rounded-full bg-[#141412] px-3 py-3 text-[12px] font-medium text-[#A2A6AB]">RRR: {details.rrr}</span>
        </div>
      )}

      {isResult && details?.resultText && <ResultTextHighlighted text={details.resultText} highlight={details.resultHighlight} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function ScorecardStatusDetails() {
  const { tournamentId, matchId } = useParams();

  const matchIdNum = matchId != null && matchId !== '' ? Number(matchId) : NaN;
  const matchIdOk = Number.isInteger(matchIdNum) && matchIdNum > 0;
  const tournamentOk = isValidTournamentId(tournamentId);

  const { data: apiMatch, isLoading: matchLoading, isError: matchIsError } = useGetMatchQuery(matchId, { skip: !matchIdOk });

  const tournamentMismatch = Boolean(apiMatch) && Number(apiMatch.tournament_id) !== Number(tournamentId);

  const { data: scorecard } = useGetScorecardQuery(matchId, {
    skip: !matchIdOk || !apiMatch || tournamentMismatch,
  });

  const { data: rawTournamentMatches = [] } = useGetTournamentMatchesQuery(
    { tournamentId, all: true },
    { skip: !tournamentOk || tournamentMismatch },
  );

  // Active = match has innings data (toss done or scoring in progress).
  // We subscribe to match_state and the scoring channel for both toss_done and
  // in_progress so that opener / playing-XI assignments are visible before
  // ball 1 and live score updates arrive without delay.
  const isActive =
    !tournamentMismatch && matchIdOk && !!apiMatch && (apiMatch.status === 'toss_done' || apiMatch.status === 'in_progress');

  const { data: matchState } = useGetMatchStateQuery(matchId, {
    skip: !isActive,
  });

  // Subscribe to the scoring WebSocket channel while the match is active
  // (toss done → completion).  This patches MatchState cache in real time and
  // handles reconnection recovery (see useMatchScoringChannel).
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
    // Playing XI comes from match_state (single source) — avoids 2 extra HTTP
    // round-trips and is kept live by the WebSocket subscription above.
    const xiHome = matchState?.playing_eleven?.home ?? null;
    const xiAway = matchState?.playing_eleven?.away ?? null;
    const playingXI = playingXIFromPlayingElevenResponses(xiHome, xiAway);
    return buildMatchStatusDetails(resultBits, overs, playingXI);
  }, [apiMatch, tournamentMismatch, scorecard, matchState?.playing_eleven]);

  // Derive live batter/bowler display directly from match_state so the Live
  // tab updates in real-time via the WebSocket patch without a network refetch.
  const liveDetails = useMemo(() => {
    const ai = matchState?.active_innings;
    if (!ai) return null;

    const toBatter = (b) => {
      if (!b) return null;
      const sr = b.balls ? ((b.runs / b.balls) * 100).toFixed(2) : '0.00';
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

    return { ...details, batters, bowlers, partnership };
  }, [matchState, details]);

  // Override header scores with live match_state totals for zero-latency display.
  // The scorecard-derived score1/score2 lags by ~4s (scorecard invalidation cycle);
  // active_innings.total_runs/total_wickets is patched immediately by the WS event.
  // Only the batting team's score for the active (non-completed) innings is overridden;
  // the other team's score (completed innings) is already final on the scorecard.
  const liveMatch = useMemo(() => {
    const ai = matchState?.active_innings;
    if (!match || !ai || ai.innings_status === 'completed') return match;
    const liveScore = `${ai.total_runs ?? 0}/${ai.total_wickets ?? 0}`;
    const hid = apiMatch?.home_team_id != null ? Number(apiMatch.home_team_id) : null;
    const battingTeamId = ai.batting_team_id != null ? Number(ai.batting_team_id) : null;
    if (battingTeamId === hid) return { ...match, score1: liveScore };
    return { ...match, score2: liveScore };
  }, [match, matchState?.active_innings, apiMatch?.home_team_id]);

  const status = match?.status ?? 'upcoming';
  const tabs = STATUS_TABS[status] ?? [];
  const defaultTab = STATUS_DEFAULT_TAB[status] ?? tabs[0]?.value;

  const [activeTab, setActiveTab] = useState(defaultTab);

  // Reset active tab when the match or its status changes.
  // TODO: gate on matchId only if you want to preserve the active tab when
  //       a live match ends and status flips to 'result' (see top).
  useEffect(() => {
    const nextDefault = STATUS_DEFAULT_TAB[status] ?? STATUS_TABS[status]?.[0]?.value;
    setActiveTab(nextDefault);
  }, [status, matchId]);

  if (!matchIdOk || !tournamentOk) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-black px-4">
        <p className="text-center text-[13px] text-[#A2A6AB]">Invalid match or tournament link.</p>
      </div>
    );
  }

  if (matchLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-black">
        <p className="text-[13px] text-[#A2A6AB]">Loading match…</p>
      </div>
    );
  }

  if (matchIsError || tournamentMismatch || !apiMatch || !match) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-black px-4">
        <p className="text-center text-[13px] text-[#A2A6AB]">
          {tournamentMismatch ? 'This match does not belong to this tournament.' : 'Match not found.'}
        </p>
      </div>
    );
  }

  const ActiveView = TAB_VIEWS[activeTab] ?? StatusDetailsPlaceholderTab;

  // TODO: compute only the active tab's props to avoid rebuilding all keys
  //       on every render (see top).
  const tabProps = {
    live: { details: liveDetails ?? details },
    scorecard: { details },
    overs: { match, details },
    'playing-xi': { match, details },
    table: { tournamentId },
    stats: { tournamentId },
    fixture: { matches: scheduleMatches, tournamentId },
  };

  return (
    <div className="bg-black">
      <AppSubpageHeader title="SCORE CARD" />

      <MatchHeader match={liveMatch} details={details} />

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
