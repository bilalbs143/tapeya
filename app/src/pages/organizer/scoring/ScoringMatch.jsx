import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

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
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const activeTab = VALID_TABS.includes(tabParam) ? tabParam : 'scoring';
  const ActiveView = TAB_VIEWS[activeTab];

  return (
    <div className="">
      <header className="flex flex-col items-center bg-black px-4 pt-6 pb-4">
        <div className="flex w-full max-w-2xl items-center gap-3">
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
          <h1 className="min-w-0 flex-1 pr-[27px] text-center text-[16px] font-bold uppercase tracking-wide text-white">
            MATCH CENTER
          </h1>
        </div>
        {/* Illustration area – cricket batsman / match visual */}
        <div className="relative mt-4 w-full max-w-2xl overflow-hidden rounded-[12px] bg-[#141412]">
          <div className="aspect-[2/1] w-full bg-gradient-to-br from-[#1a1a18] via-[#141412] to-[#0d0d0c]" />
          <div className="absolute inset-0 flex items-center justify-center opacity-90">
            <svg
              className="h-24 w-24 text-[#DA9811]/30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              aria-hidden
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v12M8 12h8" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </header>

      <Container className="!px-4 !py-0">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setSearchParams({ tab: value })}
          className="w-full"
        >
          <div className="-mx-4 bg-black px-4 pt-0.5 pb-2">
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

          <ActiveView matchId={matchId} />
        </Tabs>
      </Container>
    </div>
  );
}
