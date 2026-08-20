import { useEffect, useRef, useState } from 'react';

import { useParams, useSearchParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { NAVBAR_HEIGHT, STICKY_TABS_Z } from '@/lib/constants/layout';
import { getTournamentTitle, isValidTournamentId, parseTournamentId } from '@/lib/utils/tournamentUtils';
import { useGetTournamentMatchesQuery, useGetTournamentQuery } from '@/store/api/tournamentApi';
import { Container } from '@/ui/Container';
import { LoaderBlock } from '@/ui/Loader';
import { scorecardListClass, scorecardTriggerClass, Tabs, TabsList, TabsTrigger } from '@/ui/Tabs';

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
  } = useGetTournamentMatchesQuery({ tournamentId, all: true }, { skip: !hasValidId });

  const { data: tournament, isLoading: isLoadingTournament } = useGetTournamentQuery(
    { id: tournamentIdNum },
    { skip: !hasValidId || tournamentIdNum == null },
  );

  const headerTitleHighlight = getTournamentTitle(tournament, isLoadingTournament ? '…' : String(tournamentId ?? ''));

  const ActiveView = TAB_VIEWS[activeTab];

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
        <TabsTrigger key={value} value={value} className={`${scorecardTriggerClass} lg:min-w-[96px] lg:px-4`}>
          {label}
        </TabsTrigger>
      ))}
    </TabsList>
  );

  return (
    <div className="bg-black">
      <AppSubpageHeader title="SCORE CARD" subtitle={headerTitleHighlight} />

      <Container className="!pb-0">
        <Tabs value={activeTab} onValueChange={(value) => setSearchParams({ tab: value })} className="w-full">
          <div className="flex flex-col">
            <div ref={tabsSentinelRef} className="h-px w-full" aria-hidden />
            <div className="-mx-4 bg-black px-4 pt-0.5 pb-2">{tabsContent}</div>
          </div>

          {tabsFixedVisible && (
            <div
              className="fixed right-0 left-0 bg-black pt-1 pb-2 lg:left-[280px]"
              style={{ top: NAVBAR_HEIGHT, zIndex: STICKY_TABS_Z }}
            >
              <div className="mx-auto w-full max-w-2xl min-w-0 px-4 lg:mx-0 lg:max-w-none">{tabsContent}</div>
            </div>
          )}

          {isLoading && <LoaderBlock label="Loading scorecard" className="py-6" />}

          {isError && !isLoading && <p className="mt-4 pb-6 text-center text-[13px] text-red-400">Failed to load matches.</p>}

          {/* TODO: add empty state when !isLoading && !isError &&
                    matches.length === 0 (see top). */}
          {!isLoading && !isError && <ActiveView matches={matches} tournamentId={tournamentId} tournament={tournament} />}
        </Tabs>
      </Container>
    </div>
  );
}
