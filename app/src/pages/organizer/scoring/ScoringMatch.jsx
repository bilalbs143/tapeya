/**
 * Scoring Match – live scoring page with banner, tabs, and shared scoring state.
 * Match config comes from Start Match (location.state); state is lifted so it
 * persists across tab switches and is shared with Partnership tab.
 */
import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import matchCenterHeader from '@/assets/images/background/match-center-header.png';
import { Container } from '@/ui/Container';
import { Tabs, TabsList, TabsTrigger, scorecardListClass, scorecardTriggerClass } from '@/ui/Tabs';

import { DEFAULT_MATCH_CONFIG, getMockPlayers, toSquadWithRole } from './matchConfig';
import { computeLiveScore } from './scoringUtils';
import {
  BallsTab,
  InfoTab,
  PartnershipTab,
  ScorecardTab,
  ScoringTab,
  StatsTab,
} from './scoring-tabs';

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const SCORING_TABS = [
  { value: 'scoring', label: 'Scoring' },
  { value: 'scorecard', label: 'Scorecard' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'stats', label: 'Stats' },
  { value: 'balls', label: 'Balls' },
  { value: 'info', label: 'Info' },
];

const VALID_TABS = SCORING_TABS.map((t) => t.value);

const TAB_VIEWS = {
  balls: BallsTab,
  info: InfoTab,
  partnership: PartnershipTab,
  scorecard: ScorecardTab,
  scoring: ScoringTab,
  stats: StatsTab,
};

const INITIAL_PARTNERSHIP = { runs: 0, balls: 0 };

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function getInitialSquad(match, side) {
  const team = side === 'A' ? match?.teamA : match?.teamB;
  const players = team?.players?.length ? team.players : getMockPlayers(side);
  return toSquadWithRole(players, 'bench').map((p) => ({
    ...p,
    role: p.role === 'playing' ? 'playing' : 'bench',
  }));
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function ScoringMatch() {
  const navigate = useNavigate();
  const { matchId } = useParams();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const match = useMemo(
    () => ({ ...DEFAULT_MATCH_CONFIG, ...location.state?.match }),
    [location.state?.match],
  );

  const [ballHistory, setBallHistory] = useState([]);
  const [batsmenOnCrease, setBatsmenOnCrease] = useState([]);
  const [squad, setSquad] = useState(() => getInitialSquad(match, 'A'));
  const [bowlerSquad, setBowlerSquad] = useState(() => getInitialSquad(match, 'B'));
  const [bowlersInTable, setBowlersInTable] = useState([]);
  const [strikerIndex, setStrikerIndex] = useState(0);
  const [currentBowlerIndex, setCurrentBowlerIndex] = useState(0);
  const [completedPartnerships, setCompletedPartnerships] = useState([]);
  const [currentPartnership, setCurrentPartnership] = useState(INITIAL_PARTNERSHIP);

  const liveScore = useMemo(
    () => computeLiveScore(ballHistory, match?.overs),
    [ballHistory, match?.overs],
  );

  const tabParam = searchParams.get('tab');
  const activeTab = VALID_TABS.includes(tabParam) ? tabParam : 'scoring';
  const ActiveView = TAB_VIEWS[activeTab];

  const tabViewProps = useMemo(
    () => ({
      matchId,
      match,
      ballHistory,
      setBallHistory,
      batsmenOnCrease,
      setBatsmenOnCrease,
      squad,
      setSquad,
      bowlerSquad,
      setBowlerSquad,
      bowlersInTable,
      setBowlersInTable,
      strikerIndex,
      setStrikerIndex,
      currentBowlerIndex,
      setCurrentBowlerIndex,
      liveScore,
      partnership: currentPartnership,
      currentPartnership,
      setCurrentPartnership,
      completedPartnerships,
      setCompletedPartnerships,
    }),
    [
      matchId,
      match,
      ballHistory,
      batsmenOnCrease,
      squad,
      bowlerSquad,
      bowlersInTable,
      strikerIndex,
      currentBowlerIndex,
      liveScore,
      currentPartnership,
      completedPartnerships,
    ],
  );

  return (
    <div className="bg-black">
      <Container className="!px-4 !py-0">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setSearchParams({ tab: value })}
          className="w-full"
        >
          <header className="-mx-4 pb-10">
            <div className="relative w-full">
              <img
                src={matchCenterHeader}
                alt=""
                className="h-auto w-full"
                aria-hidden
              />
              <div className="absolute inset-0 flex items-start px-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex h-[27px] w-[27px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-[#4a4a4a] transition-opacity active:opacity-80"
                  aria-label="Back"
                >
                  <BackIcon />
                </button>
              </div>
              <div className="pointer-events-auto absolute inset-x-0 bottom-0 translate-y-1/2 px-4">
                <div className="rounded-[24px] bg-black/0">
                  <TabsList className={scorecardListClass}>
                  {SCORING_TABS.map(({ value, label }) => (
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
            </div>
          </header>

          <div className="-mx-4 bg-black px-4 pb-2">
            <ActiveView {...tabViewProps} />
          </div>
        </Tabs>
      </Container>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Subcomponents
// -----------------------------------------------------------------------------

function BackIcon() {
  return (
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
  );
}
