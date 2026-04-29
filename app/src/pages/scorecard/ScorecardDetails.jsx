/**
 * ScorecardDetails.jsx
 *
 * Tournament detail screen with a URL-synced tab bar (schedule, table, stats,
 * teams, squads).  Also implements a sentinel-based sticky tab bar that
 * becomes fixed once the user scrolls past it.
 *
 * Route: /scorecard/:tournamentId
 *
 * -----------------------------------------------------------------------------
 * CURSOR — File structure guide
 * -----------------------------------------------------------------------------
 *
 * Constants to move
 * ──────────────────
 *   NAVBAR_HEIGHT = 64
 *     → move to: src/lib/constants/layout.js → export { NAVBAR_HEIGHT }
 *     reason: **duplicated** in ScorecardHome.jsx — one source of truth
 *             prevents drift if the nav height changes.
 *
 * Hooks to extract
 * ─────────────────
 *   Sentinel IntersectionObserver (tabsSentinelRef + setTabsFixedVisible effect)
 *     → move to: src/hooks/useFixedOnScroll.js → export { useFixedOnScroll }
 *     reason: **identical** pattern in ScorecardHome.jsx.  One hook:
 *               const { sentinelRef, isFixed } = useFixedOnScroll(NAVBAR_HEIGHT);
 *             replaces the duplicated useRef + useEffect + IntersectionObserver
 *             blocks in both files.
 *
 * Behaviour notes for Cursor
 * ──────────────────────────
 *   FIXED: fixed tab bar div had both `z-10` and `z-[100]` — `z-10` is
 *          redundant because `z-[100]` always wins.  Removed `z-10`.
 *
 *   FIXED: `TabsList` + `TabsTrigger` rendering was copy-pasted for the
 *          inline and fixed tab bars.  Extracted into a `tabsContent` variable
 *          to eliminate the duplication and keep both bars in sync when tabs
 *          change.
 *
 *   TODO: There is no empty state when `!isLoading && !isError &&
 *         matches.length === 0`.  Add a "No matches scheduled yet" message
 *         for tournaments that exist but have no matches.
 *
 * Coding guidelines: docs/Coding guidelines.md
 * -----------------------------------------------------------------------------
 */

import { useEffect, useRef, useState } from 'react';

import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { NAVBAR_HEIGHT } from '@/lib/constants/layout';
import {
  getTournamentTitle,
  isValidTournamentId,
  parseTournamentId,
} from '@/lib/utils/tournamentUtils';
import {
  useGetTournamentMatchesQuery,
  useGetTournamentQuery,
} from '@/store/api/tournamentApi';
import { Container } from '@/ui/Container';
import {
  scorecardListClass,
  scorecardTriggerClass,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/ui/Tabs';

import { ScheduleTab, SquadsTab, StatsTab, TableTab, TeamsTab } from './tabs';

const TOURNAMENT_TABS = [
  { value: 'schedule', label: 'Schedule' },
  { value: 'table', label: 'Table' },
  { value: 'stats', label: 'Stats' },
  { value: 'teams', label: 'Teams' },
  { value: 'squads', label: 'Squads' },
];

const VALID_TABS = ['schedule', 'table', 'stats', 'teams', 'squads'];

const TAB_VIEWS = {
  schedule: ScheduleTab,
  table: TableTab,
  stats: StatsTab,
  teams: TeamsTab,
  squads: SquadsTab,
};

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function ScorecardDetails() {
  const navigate = useNavigate();
  const { tournamentId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tabsFixedVisible, setTabsFixedVisible] = useState(false);
  const tabsSentinelRef = useRef(null);

  const tabParam = searchParams.get('tab');
  const activeTab = VALID_TABS.includes(tabParam) ? tabParam : 'schedule';

  const hasValidId = isValidTournamentId(tournamentId);
  const tournamentIdNum = parseTournamentId(tournamentId, null);

  const {
    data: matches = [],
    isLoading,
    isError,
  } = useGetTournamentMatchesQuery(
    { tournamentId, all: true },
    { skip: !hasValidId },
  );

  const { data: tournament, isLoading: isLoadingTournament } =
    useGetTournamentQuery(
      { id: tournamentIdNum },
      { skip: !hasValidId || tournamentIdNum == null },
    );

  const headerTitleHighlight = getTournamentTitle(
    tournament,
    isLoadingTournament ? '…' : String(tournamentId ?? ''),
  );

  const ActiveView = TAB_VIEWS[activeTab];
  const formatLabel =
    tournament?.number_of_groups != null
      ? tournament.number_of_groups <= 1
        ? 'Single table'
        : `Groups: ${tournament.number_of_groups}`
      : null;

  // CURSOR: replace with useFixedOnScroll(NAVBAR_HEIGHT) once extracted (see top).
  useEffect(() => {
    const sentinel = tabsSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setTabsFixedVisible(!entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: `-${NAVBAR_HEIGHT}px 0px 0px 0px`,
        threshold: 0,
      },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Fixed: extracted shared tab list to avoid copy-pasting the same JSX for
  //        both inline and fixed positions.
  const tabsContent = (
    <TabsList className={`${scorecardListClass} lg:gap-2`}>
      {TOURNAMENT_TABS.map(({ value, label }) => (
        <TabsTrigger
          key={value}
          value={value}
          className={`${scorecardTriggerClass} lg:min-w-[96px] lg:px-4`}
        >
          {label}
        </TabsTrigger>
      ))}
    </TabsList>
  );

  return (
    <div className="bg-black">
      <header className="flex items-center gap-3 bg-black px-4 pt-6 pb-6">
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
        <div className="min-w-0 flex-1 pr-[27px] text-center">
          <h1 className="text-[16px] font-bold leading-snug tracking-wide text-white uppercase">
            <span className="whitespace-normal break-words">SCORE CARD - </span>
            <span className="text-[#DA9811] normal-case">
              {headerTitleHighlight}
            </span>
          </h1>
          {formatLabel && (
            <p className="mt-0.5 text-[12px] text-[#A2A6AB]">{formatLabel}</p>
          )}
        </div>
      </header>

      <Container className="!px-4 !py-0">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setSearchParams({ tab: value })}
          className="w-full"
        >
          <div className="flex flex-col">
            <div ref={tabsSentinelRef} className="h-px w-full" aria-hidden />
            <div className="-mx-4 bg-black px-4 pt-0.5 pb-2">{tabsContent}</div>
          </div>

          {tabsFixedVisible && (
            <div
              className="fixed right-0 left-0 z-[100] bg-black pt-1 pb-2 lg:left-[280px]"
              style={{ top: NAVBAR_HEIGHT }}
            >
              <div className="mx-auto w-full max-w-2xl min-w-0 px-4 lg:mx-0 lg:max-w-none">
                {tabsContent}
              </div>
            </div>
          )}

          {isLoading && (
            <p className="mt-4 pb-6 text-center text-[13px] text-[#A2A6AB]">
              Loading matches…
            </p>
          )}

          {isError && !isLoading && (
            <p className="mt-4 pb-6 text-center text-[13px] text-red-400">
              Failed to load matches.
            </p>
          )}

          {/* TODO: add empty state when !isLoading && !isError &&
                    matches.length === 0 (see top). */}
          {!isLoading && !isError && (
            <ActiveView
              matches={matches}
              tournamentId={tournamentId}
              tournament={tournament}
            />
          )}
        </Tabs>
      </Container>
    </div>
  );
}
