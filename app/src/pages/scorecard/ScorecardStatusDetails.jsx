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

import { useNavigate, useParams } from 'react-router-dom';

import { CommentaryText } from '@/components/scorecard/CommentaryText';
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
import {
  useGetMatchQuery,
  useGetPlayingElevenQuery,
  useGetScorecardQuery,
} from '@/store/api/matchApi';
import { useGetTournamentMatchesQuery } from '@/store/api/tournamentApi';
import { Container } from '@/ui/Container';
import {
  scorecardListClass,
  scorecardTriggerClass,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/ui/Tabs';

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
// CURSOR: move FLAGS to src/lib/constants/teamFlags.js (see top).
// ---------------------------------------------------------------------------


const karachiFlag = `${CLOUDFRONT_APP_BASE}/images/icons/karachi-flag.png`;
const rawalpindiFlag = `${CLOUDFRONT_APP_BASE}/images/icons/rawalpindi-flag.png`;
const winProbabilityIcon = `${CLOUDFRONT_APP_BASE}/images/icons/win-probabilty.svg`;

const FLAGS = { karachi: karachiFlag, rawalpindi: rawalpindiFlag };

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
  if (!score || typeof score !== 'string')
    return { current: score, overs: null };
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
 * TeamFlag — team flag image with coloured-initial fallback.
 * CURSOR: move to src/features/scorecard/components/TeamFlag.jsx
 * TODO: add DEV console.warn when team.flag is set but not in FLAGS (see top).
 */
function TeamFlag({ team }) {
  const src = team.flag ? FLAGS[team.flag] : null;
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="h-5 w-5 shrink-0 rounded-sm object-cover"
        aria-hidden
      />
    );
  }
  return (
    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-emerald-600 text-[10px] font-bold text-white">
      {team.initial}
    </div>
  );
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
        <img
          src={winProbabilityIcon}
          alt=""
          className="h-5 w-5 shrink-0"
          aria-hidden
        />
        <span className="text-[14px] font-bold text-[#A2A6AB]">
          Win Probability
        </span>
      </div>
      <div className="flex items-stretch">
        <div className="flex flex-1 flex-col items-center justify-center">
          <span className="mb-1 text-[14px] text-[#A2A6AB]">
            {match.team1.name}
          </span>
          <span
            className={`text-[14px] font-bold ${higherIsTeam2 ? 'text-white' : 'text-[#DA9811]'}`}
          >
            {p1}%
          </span>
        </div>
        <div
          className="w-px shrink-0 self-stretch bg-gradient-to-b from-transparent via-white/40 to-transparent"
          aria-hidden
        />
        <div className="flex flex-1 flex-col items-center justify-center">
          <span className="mb-1 text-[12px] text-[#A2A6AB]">
            {match.team2.name}
          </span>
          <span
            className={`text-[18px] font-bold ${higherIsTeam2 ? 'text-[#DA9811]' : 'text-white'}`}
          >
            {p2}%
          </span>
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
          <p className="mb-1 text-[13px] font-bold text-white uppercase">
            {status}
          </p>
          <p className="mb-3 text-[12px] text-[#A2A6AB]">{matchId}</p>
        </>
      ) : (
        <div className="mb-4">
          <span className="shrink-0 text-[13px] font-bold text-white uppercase">
            {isLive ? 'LIVE' : 'RESULT'}
          </span>
          <p className="mt-2 text-[12px] text-[#A2A6AB]">{matchId}</p>
        </div>
      )}

      <div className="mb-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <TeamFlag team={team1} />
            <span className="truncate text-[14px] font-semibold text-white">
              {team1.name}
            </span>
          </div>
          {isUpcoming ? (
            <span className="shrink-0 text-[14px] text-[#A2A6AB]">
              {meta?.time}
            </span>
          ) : (
            score1 && (
              <span className="shrink-0 text-[14px] font-medium text-[#A2A6AB]">
                {score1}
              </span>
            )
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <TeamFlag team={team2} />
            <span className="truncate text-[14px] font-semibold text-white">
              {team2.name}
            </span>
          </div>
          {isUpcoming ? (
            <span className="shrink-0 text-[16px] font-bold text-white">
              {meta?.startsIn}
            </span>
          ) : (
            score2 && (
              <span className="shrink-0 text-right">
                {liveScore2?.overs && (
                  <span className="text-[14px] text-[#A2A6AB]">
                    {liveScore2.overs}{' '}
                  </span>
                )}
                <span className="text-[14px] font-bold text-[#DA9811]">
                  {liveScore2?.current ?? score2}
                </span>
              </span>
            )
          )}
        </div>
      </div>

      {isLive && meta?.commentary && (
        <p className="mb-3">
          <CommentaryText
            text={meta.commentary}
            className="text-[14px] text-white"
          />
        </p>
      )}

      {isLive && details?.crr && (
        <div className="mb-1 flex gap-2">
          <span className="rounded-full bg-[#141412] px-3 py-3 text-[12px] font-medium text-[#A2A6AB]">
            CRR: {details.crr}
          </span>
          <span className="rounded-full bg-[#141412] px-3 py-3 text-[12px] font-medium text-[#A2A6AB]">
            RRR: {details.rrr}
          </span>
        </div>
      )}

      {isResult && details?.resultText && (
        <ResultTextHighlighted
          text={details.resultText}
          highlight={details.resultHighlight}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function ScorecardStatusDetails() {
  const navigate = useNavigate();
  const { tournamentId, matchId } = useParams();

  const matchIdNum = matchId != null && matchId !== '' ? Number(matchId) : NaN;
  const matchIdOk = Number.isInteger(matchIdNum) && matchIdNum > 0;
  const tournamentOk = isValidTournamentId(tournamentId);

  const {
    data: apiMatch,
    isLoading: matchLoading,
    isError: matchIsError,
  } = useGetMatchQuery(matchId, { skip: !matchIdOk });

  const tournamentMismatch =
    Boolean(apiMatch) &&
    Number(apiMatch.tournament_id) !== Number(tournamentId);

  const { data: scorecard } = useGetScorecardQuery(matchId, {
    skip: !matchIdOk || !apiMatch || tournamentMismatch,
  });

  const homeTeamId = apiMatch?.home_team_id;
  const awayTeamId = apiMatch?.away_team_id;

  const { data: xiHome } = useGetPlayingElevenQuery(
    { matchId, teamId: homeTeamId },
    {
      skip:
        !matchIdOk ||
        homeTeamId == null ||
        homeTeamId === '' ||
        !apiMatch ||
        tournamentMismatch,
    },
  );

  const { data: xiAway } = useGetPlayingElevenQuery(
    { matchId, teamId: awayTeamId },
    {
      skip:
        !matchIdOk ||
        awayTeamId == null ||
        awayTeamId === '' ||
        !apiMatch ||
        tournamentMismatch,
    },
  );

  const { data: rawTournamentMatches = [] } = useGetTournamentMatchesQuery(
    { tournamentId, all: true },
    { skip: !tournamentOk || tournamentMismatch },
  );

  const scheduleMatches = useMemo(
    () =>
      normaliseTournamentMatches([
        { id: tournamentId, matches: rawTournamentMatches },
      ]),
    [tournamentId, rawTournamentMatches],
  );

  const match = useMemo(() => {
    if (!apiMatch || tournamentMismatch) return null;
    return apiTournamentMatchToStatusDetailsMatch(apiMatch, scorecard);
  }, [apiMatch, scorecard, tournamentMismatch]);

  const details = useMemo(() => {
    if (!apiMatch || tournamentMismatch) return null;
    const resultBits = minimalStatusDetailsFromApi(apiMatch);
    const overs = oversDetailsFromScorecard(
      scorecard,
      apiMatch.home_team_id,
      apiMatch.away_team_id,
    );
    const playingXI = playingXIFromPlayingElevenResponses(xiHome, xiAway);
    return buildMatchStatusDetails(resultBits, overs, playingXI);
  }, [apiMatch, tournamentMismatch, scorecard, xiHome, xiAway]);

  const status = match?.status ?? 'upcoming';
  const tabs = STATUS_TABS[status] ?? [];
  const defaultTab = STATUS_DEFAULT_TAB[status] ?? tabs[0]?.value;

  const [activeTab, setActiveTab] = useState(defaultTab);

  // Reset active tab when the match or its status changes.
  // TODO: gate on matchId only if you want to preserve the active tab when
  //       a live match ends and status flips to 'result' (see top).
  useEffect(() => {
    const nextDefault =
      STATUS_DEFAULT_TAB[status] ?? STATUS_TABS[status]?.[0]?.value;
    setActiveTab(nextDefault);
  }, [status, matchId]);

  if (!matchIdOk || !tournamentOk) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-black px-4">
        <p className="text-center text-[13px] text-[#A2A6AB]">
          Invalid match or tournament link.
        </p>
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
          {tournamentMismatch
            ? 'This match does not belong to this tournament.'
            : 'Match not found.'}
        </p>
      </div>
    );
  }

  const ActiveView = TAB_VIEWS[activeTab] ?? StatusDetailsPlaceholderTab;

  // TODO: compute only the active tab's props to avoid rebuilding all keys
  //       on every render (see top).
  const tabProps = {
    live: { details },
    scorecard: { details },
    overs: { match, details },
    'playing-xi': { match, details },
    table: { tournamentId },
    stats: { tournamentId },
    fixture: { matches: scheduleMatches, tournamentId },
  };

  return (
    <div className="bg-black">
      <header className="flex items-center gap-3 bg-black px-4 pt-6 pb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full bg-white text-[#4a4a4a] transition-opacity active:opacity-80"
          aria-label="Back"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="min-w-0 flex-1 pr-[27px] text-center text-[16px] font-bold tracking-wide text-white uppercase">
          SCORE CARD
        </h1>
      </header>

      <MatchHeader match={match} details={details} />

      {status === 'live' && details?.winProb && (
        <WinProbabilityCard match={match} winProb={details.winProb} />
      )}

      <Container className="!px-4 !py-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="-mx-4 bg-black px-4 pt-3 pb-2">
            <TabsList className={scorecardListClass}>
              {tabs.map(({ value, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={scorecardTriggerClass}
                >
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
