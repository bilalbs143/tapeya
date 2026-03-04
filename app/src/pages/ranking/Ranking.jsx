import { Link, useNavigate } from 'react-router-dom';

import { statsTotalPaths } from '@/pages/scorecard/statsTotalFlow';
import { useGetRankingsQuery } from '@/store/api/rankingApi';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/Avatar';
import { Container } from '@/ui/Container';
import {
  profileListClass,
  profileTriggerClass,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/ui/Tabs';

// Placeholder player image (backend can later return avatar URLs)
const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=96&h=96&fit=crop';

const OPEN_TOURNAMENT_TYPE = 'open_tournament';

function useOpenTournamentRankings(category, sort) {
  return useGetRankingsQuery({
    tournament_type: OPEN_TOURNAMENT_TYPE,
    category,
    sort,
  });
}

function PlayerCard({ player, rank, variant = 'batter' }) {
  const isBowler = variant === 'bowler';
  const isOther = variant === 'other';
  const keyStat = isBowler
    ? player.wickets
    : isOther
      ? player.stat
      : player.score;
  const detailText = isBowler
    ? `Innings: ${player.innings} Economy: ${
        player.economy != null ? Number(player.economy).toFixed(2) : '-'
      }`
    : `Innings: ${player.innings} Average: ${
        player.average != null ? Number(player.average).toFixed(2) : '-'
      }`;

  return (
    <div className="flex items-center gap-3 rounded-[17px] bg-[#141412] p-3">
      <Avatar className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/10">
        <AvatarImage
          src={player.image || DEFAULT_AVATAR}
          alt=""
          className="object-cover"
        />
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
        <p className="mt-0.5 text-[18px] font-bold text-[#DA9811]">{keyStat}</p>
        <p className="text-[12px] font-medium text-[#A2A6AB]">{detailText}</p>
      </div>
      <span
        className="text-[48px] leading-none font-bold text-[#DA9811]/40"
        aria-hidden
      >
        {rank}
      </span>
    </div>
  );
}

function RankingSection({
  title,
  linkTo,
  linkState,
  rows,
  variant = 'batter',
  loading,
  error,
  emptyMessage,
}) {
  return (
    <>
      <div className="flex items-center justify-between pb-3">
        <h2 className="text-[13px] font-bold tracking-wide text-[#A2A6AB] uppercase">
          {title}
        </h2>
        <Link
          to={linkTo}
          state={linkState}
          className="text-[12px] font-bold tracking-wide text-[#DA9811] uppercase transition-opacity active:opacity-80"
        >
          View More
        </Link>
      </div>
      {loading && (
        <p className="text-[13px] text-[#A2A6AB]">Loading rankings…</p>
      )}
      {error && !loading && (
        <p className="text-[13px] text-red-400">Failed to load rankings.</p>
      )}
      {!loading && !error && rows.length === 0 && (
        <p className="text-[13px] text-[#A2A6AB]">{emptyMessage}</p>
      )}
      <div className="space-y-3">
        {rows.slice(0, 5).map((player, index) => (
          <PlayerCard
            key={player.id}
            player={player}
            rank={index + 1}
            variant={variant}
          />
        ))}
      </div>
    </>
  );
}

export default function Ranking() {
  const navigate = useNavigate();

  const {
    data: battingData,
    isLoading: isLoadingBatting,
    isError: isErrorBatting,
  } = useOpenTournamentRankings('batting', 'runs');
  const {
    data: bowlingData,
    isLoading: isLoadingBowling,
    isError: isErrorBowling,
  } = useOpenTournamentRankings('bowling', 'wickets');
  const {
    data: sixesData,
    isLoading: isLoadingSixes,
    isError: isErrorSixes,
  } = useOpenTournamentRankings('batting', 'sixes');
  const {
    data: foursData,
    isLoading: isLoadingFours,
    isError: isErrorFours,
  } = useOpenTournamentRankings('batting', 'fours');

  const rawBatters =
    Array.isArray(battingData?.rankings) && battingData.rankings.length > 0
      ? battingData.rankings
      : [];
  const rawBowlers =
    Array.isArray(bowlingData?.rankings) && bowlingData.rankings.length > 0
      ? bowlingData.rankings
      : [];
  const rawSixes =
    Array.isArray(sixesData?.rankings) && sixesData.rankings.length > 0
      ? sixesData.rankings
      : [];
  const rawFours =
    Array.isArray(foursData?.rankings) && foursData.rankings.length > 0
      ? foursData.rankings
      : [];

  const toBatterCard = (row) => ({
    id: row.player_id,
    name: row.player?.name ?? '—',
    type: 'BAT', // backend could add detailed role later
    score: row.stats?.runs ?? 0,
    innings: row.stats?.innings ?? 0,
    average: row.stats?.average ?? null,
    image: null,
  });

  const toBowlerCard = (row) => ({
    id: row.player_id,
    name: row.player?.name ?? '—',
    type: 'BOWL',
    wickets: row.stats?.wickets ?? 0,
    innings: row.stats?.innings ?? 0,
    economy: row.stats?.economy ?? null,
    image: null,
  });

  const toOtherCard = (row, key) => ({
    id: row.player_id,
    name: row.player?.name ?? '—',
    type: 'BAT',
    stat: row.stats?.[key] ?? 0,
    innings: row.stats?.innings ?? 0,
    average: row.stats?.average ?? null,
    image: null,
  });

  const topBatters = rawBatters.map(toBatterCard);
  const topBowlers = rawBowlers.map(toBowlerCard);
  const mostSixes = rawSixes.map((row) => toOtherCard(row, 'sixes'));
  const mostFours = rawFours.map((row) => toOtherCard(row, 'fours'));

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
            <TabsTrigger value="batters" className={profileTriggerClass}>
              Top Batters
            </TabsTrigger>
            <TabsTrigger value="bowlers" className={profileTriggerClass}>
              Top Bowlers
            </TabsTrigger>
            <TabsTrigger value="others" className={profileTriggerClass}>
              Others
            </TabsTrigger>
          </TabsList>

          <TabsContent value="batters" className="mt-0">
            <RankingSection
              title="Top Run Scorers"
              linkTo={statsTotalPaths.ranking('run-scorers')}
              linkState={{
                fromRanking: true,
                rankingData: rawBatters,
              }}
              rows={topBatters}
              loading={isLoadingBatting}
              error={isErrorBatting}
              emptyMessage="No batting rankings available yet for open tournaments."
            />
          </TabsContent>

          <TabsContent value="bowlers" className="mt-0">
            <RankingSection
              title="Top Wicket Takers"
              linkTo={statsTotalPaths.ranking('wicket-takers')}
              linkState={{
                fromRanking: true,
                rankingData: rawBowlers,
              }}
              rows={topBowlers}
              variant="bowler"
              loading={isLoadingBowling}
              error={isErrorBowling}
              emptyMessage="No bowling rankings available yet for open tournaments."
            />
          </TabsContent>

          <TabsContent value="others" className="mt-0">
            <section className="mb-8">
              <RankingSection
                title="Most Sixes"
                linkTo={statsTotalPaths.ranking('sixes')}
                linkState={{
                  fromRanking: true,
                  rankingData: rawSixes,
                }}
                rows={mostSixes}
                variant="other"
                loading={isLoadingSixes}
                error={isErrorSixes}
                emptyMessage="No sixes rankings available yet for open tournaments."
              />
            </section>
            <section>
              <RankingSection
                title="Most Fours"
                linkTo={statsTotalPaths.ranking('fours')}
                linkState={{
                  fromRanking: true,
                  rankingData: rawFours,
                }}
                rows={mostFours}
                variant="other"
                loading={isLoadingFours}
                error={isErrorFours}
                emptyMessage="No fours rankings available yet for open tournaments."
              />
            </section>
          </TabsContent>
        </Tabs>
      </Container>
    </div>
  );
}
