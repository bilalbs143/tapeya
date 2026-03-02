import { Link, useNavigate } from 'react-router-dom';

import { statsTotalPaths } from '@/pages/scorecard/statsTotalFlow';
import { Container } from '@/ui/Container';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  profileListClass,
  profileTriggerClass,
} from '@/ui/Tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/ui/Avatar';

// Placeholder player image
const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=96&h=96&fit=crop';

const TOP_RUN_SCORERS = [
  {
    id: '1',
    name: 'Arsalan Butt',
    type: 'RHB',
    score: 154,
    innings: 2,
    average: 154.0,
    image: DEFAULT_AVATAR,
  },
  {
    id: '2',
    name: 'Player Two',
    type: 'RHB',
    score: 142,
    innings: 2,
    average: 71.0,
    image: DEFAULT_AVATAR,
  },
  {
    id: '3',
    name: 'Player Three',
    type: 'LHB',
    score: 128,
    innings: 3,
    average: 42.67,
    image: DEFAULT_AVATAR,
  },
  {
    id: '4',
    name: 'Player Four',
    type: 'RHB',
    score: 118,
    innings: 2,
    average: 59.0,
    image: DEFAULT_AVATAR,
  },
  {
    id: '5',
    name: 'Player Five',
    type: 'RHB',
    score: 105,
    innings: 3,
    average: 35.0,
    image: DEFAULT_AVATAR,
  },
];

const TOP_WICKET_TAKERS = [
  {
    id: 'b1',
    name: 'Arsalan Butt',
    type: 'RFM',
    wickets: 5,
    innings: 2,
    economy: 6.2,
    image: DEFAULT_AVATAR,
  },
  {
    id: 'b2',
    name: 'Player Two',
    type: 'OB',
    wickets: 2,
    innings: 2,
    economy: 5.8,
    image: DEFAULT_AVATAR,
  },
  {
    id: 'b3',
    name: 'Player Three',
    type: 'LFM',
    wickets: 7,
    innings: 3,
    economy: 7.1,
    image: DEFAULT_AVATAR,
  },
];

const MOST_SIXES = [
  {
    id: 's1',
    name: 'Arsalan Butt',
    type: 'RHB',
    stat: 5,
    innings: 2,
    average: 154.0,
    image: DEFAULT_AVATAR,
  },
  {
    id: 's2',
    name: 'Player Two',
    type: 'RHB',
    stat: 2,
    innings: 2,
    average: 154.0,
    image: DEFAULT_AVATAR,
  },
  {
    id: 's3',
    name: 'Player Three',
    type: 'RHB',
    stat: 7,
    innings: 2,
    average: 154.0,
    image: DEFAULT_AVATAR,
  },
];

const MOST_FOURS = [
  {
    id: 'f1',
    name: 'Arsalan Butt',
    type: 'RHB',
    stat: 5,
    innings: 2,
    average: 154.0,
    image: DEFAULT_AVATAR,
  },
  {
    id: 'f2',
    name: 'Player Two',
    type: 'RHB',
    stat: 2,
    innings: 2,
    average: 154.0,
    image: DEFAULT_AVATAR,
  },
];

function PlayerCard({ player, rank, variant = 'batter' }) {
  const isBowler = variant === 'bowler';
  const isOther = variant === 'other';
  const keyStat = isBowler
    ? player.wickets
    : isOther
      ? player.stat
      : player.score;
  const detailText = isBowler
    ? `Innings: ${player.innings} Economy: ${player.economy?.toFixed(2) ?? player.economy}`
    : `Innings: ${player.innings} Average: ${player.average.toFixed(2)}`;

  return (
    <div className="flex items-center gap-3 rounded-[17px] bg-[#141412] p-3">
      <Avatar className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/10">
        <AvatarImage src={player.image} alt="" className="object-cover" />
        <AvatarFallback className="bg-zinc-700 text-white">
          {player.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-[16px] font-bold text-white">
            {player.name}
          </span>
          <span className="shrink-0 text-[12px] font-medium text-[#DEDEDE]">
            {player.type}
          </span>
        </div>
        <p className="mt-0.5 text-[18px] font-bold text-[#DA9811]">
          {keyStat}
        </p>
        <p className="text-[12px] font-medium text-[#A2A6AB]">
          {detailText}
        </p>
      </div>
      <span
        className="text-[48px] font-bold leading-none text-[#DA9811]/40"
        aria-hidden
      >
        {rank}
      </span>
    </div>
  );
}

export default function Ranking() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black">
      <Container className="!px-4 !py-0">
        <header className="-mx-4 -mt-6 flex items-center gap-3 bg-black px-4 pt-6 pb-4">
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
            Latest Ranking
          </h1>
        </header>

        <Tabs defaultValue="batters" className="w-full">
          <TabsList className={`${profileListClass} mb-4`}>
            <TabsTrigger
              value="batters"
              className={profileTriggerClass}
            >
              Top Batters
            </TabsTrigger>
            <TabsTrigger
              value="bowlers"
              className={profileTriggerClass}
            >
              Top Bowlers
            </TabsTrigger>
            <TabsTrigger value="others" className={profileTriggerClass}>
              Others
            </TabsTrigger>
          </TabsList>

          <TabsContent value="batters" className="mt-0">
            <div className="flex items-center justify-between pb-3">
              <h2 className="text-[13px] font-bold uppercase tracking-wide text-[#A2A6AB]">
                Top Run Scorers
              </h2>
              <Link
                to={statsTotalPaths.ranking('run-scorers')}
                state={{ fromRanking: true, rankingData: TOP_RUN_SCORERS }}
                className="text-[12px] font-bold uppercase tracking-wide text-[#DA9811] transition-opacity active:opacity-80"
              >
                View More
              </Link>
            </div>
            <div className="space-y-3">
              {TOP_RUN_SCORERS.map((player, index) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  rank={index + 1}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bowlers" className="mt-0">
            <div className="flex items-center justify-between pb-3">
              <h2 className="text-[13px] font-bold uppercase tracking-wide text-[#A2A6AB]">
                Top Wicket Takers
              </h2>
              <Link
                to={statsTotalPaths.ranking('wicket-takers')}
                state={{ fromRanking: true, rankingData: TOP_WICKET_TAKERS }}
                className="text-[12px] font-bold uppercase tracking-wide text-[#DA9811] transition-opacity active:opacity-80"
              >
                View More
              </Link>
            </div>
            <div className="space-y-3">
              {TOP_WICKET_TAKERS.map((player, index) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  rank={index + 1}
                  variant="bowler"
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="others" className="mt-0">
            <section className="mb-8">
              <div className="flex items-center justify-between pb-3">
                <h2 className="text-[13px] font-bold uppercase tracking-wide text-[#A2A6AB]">
                  Most Sixes
                </h2>
                <Link
                  to={statsTotalPaths.ranking('sixes')}
                  state={{ fromRanking: true, rankingData: MOST_SIXES }}
                  className="text-[12px] font-bold uppercase tracking-wide text-[#DA9811] transition-opacity active:opacity-80"
                >
                  View More
                </Link>
              </div>
              <div className="space-y-3">
                {MOST_SIXES.map((player, index) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    rank={index + 1}
                    variant="other"
                  />
                ))}
              </div>
            </section>
            <section>
              <div className="flex items-center justify-between pb-3">
                <h2 className="text-[13px] font-bold uppercase tracking-wide text-[#A2A6AB]">
                  Most Fours
                </h2>
                <Link
                  to={statsTotalPaths.ranking('fours')}
                  state={{ fromRanking: true, rankingData: MOST_FOURS }}
                  className="text-[12px] font-bold uppercase tracking-wide text-[#DA9811] transition-opacity active:opacity-80"
                >
                  View More
                </Link>
              </div>
              <div className="space-y-3">
                {MOST_FOURS.map((player, index) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    rank={index + 1}
                    variant="other"
                  />
                ))}
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </Container>
    </div>
  );
}
