import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { Container } from '@/ui/Container';
import {
  scorecardListClass,
  scorecardTriggerClass,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/ui/Tabs';

import { MOCK_MATCHES } from './mockMatches';
import { ScheduleTab, SquadsTab, StatsTab, TableTab, TeamsTab } from './tabs';

const NAVBAR_HEIGHT = 64; // h-16 = 4rem

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

export default function ScorecardDetails() {
  const navigate = useNavigate();
  const { tournamentId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tabsFixedVisible, setTabsFixedVisible] = useState(false);
  const tabsSentinelRef = useRef(null);

  const tabParam = searchParams.get('tab');
  const activeTab = VALID_TABS.includes(tabParam) ? tabParam : 'schedule';

  const matches = MOCK_MATCHES.filter((m) => m.league === tournamentId);
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

  return (
    <div className="min-h-screen bg-black">
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
        <h1 className="min-w-0 flex-1 pr-[27px] text-center text-[16px] font-bold tracking-wide text-white uppercase">
          SCORE CARD -{' '}
          <span className="text-[#DA9811]">{tournamentId || ''}</span>
        </h1>
      </header>

      <Container className="!px-4 !py-0">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setSearchParams({ tab: value })}
          className="w-full"
        >
          <div className="flex flex-col">
            <div ref={tabsSentinelRef} className="h-px w-full" aria-hidden />
            <div className="-mx-4 bg-black px-4 pt-0.5 pb-2">
              <TabsList className={scorecardListClass}>
                {TOURNAMENT_TABS.map(({ value, label }) => (
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
          </div>

          {tabsFixedVisible && (
            <div
              className="fixed right-0 left-0 z-10 z-[100] bg-black pt-1 pb-2"
              style={{ top: NAVBAR_HEIGHT }}
            >
              <div className="mx-auto max-w-2xl px-4">
                <TabsList className={scorecardListClass}>
                  {TOURNAMENT_TABS.map(({ value, label }) => (
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
            </div>
          )}

          <ActiveView matches={matches} tournamentId={tournamentId} />
        </Tabs>
      </Container>
    </div>
  );
}
