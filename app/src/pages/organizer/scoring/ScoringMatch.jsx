import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { useState, useMemo } from 'react';

import matchCenterHeader from '@/assets/images/background/match-center-header.png';
import { DEFAULT_MATCH_CONFIG, getMockPlayers, toSquadWithRole } from './matchConfig';
import { computeLiveScore } from './scoringUtils';
import { Container } from '@/ui/Container';
import {
  scorecardListClass,
  scorecardTriggerClass,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/ui/Tabs';

import {
  BallsTab,
  InfoTab,
  PartnershipTab,
  ScorecardTab,
  ScoringTab,
  StatsTab,
} from './scoring-tabs';

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

export default function ScoringMatch() {
  const navigate = useNavigate();
  const { matchId } = useParams();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Match config from Start Match page (team names, venue, format, toss, etc.)
  const match = { ...DEFAULT_MATCH_CONFIG, ...location.state?.match };

  // Lifted scoring state so it persists across tab switches and Partnership tab shares same data
  const [ballHistory, setBallHistory] = useState([]);
  const [batsmenOnCrease, setBatsmenOnCrease] = useState([]);
  const [squad, setSquad] = useState(() => {
    const teamA = match?.teamA ?? {};
    const players = teamA?.players?.length ? teamA.players : getMockPlayers('A');
    return toSquadWithRole(players, 'bench').map((p) => ({
      ...p,
      role: p.role === 'playing' ? 'playing' : 'bench',
    }));
  });
  const [bowlerSquad, setBowlerSquad] = useState(() => {
    const teamB = match?.teamB ?? {};
    const players = teamB?.players?.length ? teamB.players : getMockPlayers('B');
    return toSquadWithRole(players, 'bench').map((p) => ({
      ...p,
      role: p.role === 'playing' ? 'playing' : 'bench',
    }));
  });
  const [bowlersInTable, setBowlersInTable] = useState([]);
  const [strikerIndex, setStrikerIndex] = useState(0);
  const [currentBowlerIndex, setCurrentBowlerIndex] = useState(0);

  /** Completed partnerships (closed when a wicket falls). Each: { batter1, batter2, runs, balls }. */
  const [completedPartnerships, setCompletedPartnerships] = useState([]);

  /**
   * Current partnership runs/balls — counts only since THIS pair came together.
   * Resets to 0 each time a new pair forms. Updated by ScoringTab on every delivery.
   */
  const [currentPartnership, setCurrentPartnership] = useState({ runs: 0, balls: 0 });

  const liveScore = useMemo(
    () => computeLiveScore(ballHistory, match?.overs),
    [ballHistory, match?.overs],
  );

  const tabParam = searchParams.get('tab');
  const activeTab = VALID_TABS.includes(tabParam) ? tabParam : 'scoring';
  const ActiveView = TAB_VIEWS[activeTab];

  return (
    <div className="bg-black">
      <Container className="!px-4 !py-0">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setSearchParams({ tab: value })}
          className="w-full"
        >
          <header className="-mx-4 -mt-6 pb-10">
            <div className="relative w-full">
              <img
                src={matchCenterHeader}
                alt=""
                className="h-[167px] w-full object-cover"
                aria-hidden
              />
              <div className="absolute inset-0 flex items-start px-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex h-[27px] w-[27px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-[#4a4a4a] transition-opacity active:opacity-80"
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
            <ActiveView
              matchId={matchId}
              match={match}
              ballHistory={ballHistory}
              setBallHistory={setBallHistory}
              batsmenOnCrease={batsmenOnCrease}
              setBatsmenOnCrease={setBatsmenOnCrease}
              squad={squad}
              setSquad={setSquad}
              bowlerSquad={bowlerSquad}
              setBowlerSquad={setBowlerSquad}
              bowlersInTable={bowlersInTable}
              setBowlersInTable={setBowlersInTable}
              strikerIndex={strikerIndex}
              setStrikerIndex={setStrikerIndex}
              currentBowlerIndex={currentBowlerIndex}
              setCurrentBowlerIndex={setCurrentBowlerIndex}
              liveScore={liveScore}
              partnership={currentPartnership}
              currentPartnership={currentPartnership}
              setCurrentPartnership={setCurrentPartnership}
              completedPartnerships={completedPartnerships}
              setCompletedPartnerships={setCompletedPartnerships}
            />
          </div>
        </Tabs>
      </Container>
    </div>
  );
}
