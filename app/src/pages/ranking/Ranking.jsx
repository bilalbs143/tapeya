/**
 * Ranking.jsx — Open-tournament rankings: Top Batters, Top Bowlers, Others (sixes/fours).
 * Route: /ranking. Sections show top 5 and link to RankingStatsTotal via location state.
 */

import { Link } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { formatDecimal, getInitials } from '@/lib/utils/displayUtils';
import { statsTotalPaths } from '@/pages/scorecard/statsTotalFlow';
import { useGetRankingsQuery } from '@/store/api/rankingApi';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/Avatar';
import { Container } from '@/ui/Container';
import { profileListClass, profileTriggerClass, Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/Tabs';

const defaultAvatar = `${CLOUDFRONT_APP_BASE}/images/standard/default-avatar.png`;

const OPEN_TOURNAMENT_TYPE = 'open_tournament';

/** Number of players shown per section before the "View More" link. */
const TOP_RANKINGS_LIMIT = 5;

function useOpenTournamentRankings(category, sort) {
  return useGetRankingsQuery({
    tournament_type: OPEN_TOURNAMENT_TYPE,
    category,
    sort,
  });
}

function safeRankings(data) {
  return Array.isArray(data?.rankings) ? data.rankings : [];
}

function toBatterCard(row) {
  return {
    id: row.player_id,
    name: row.player?.name ?? '—',
    type: 'BAT',
    score: row.stats?.runs ?? 0,
    innings: row.stats?.innings ?? 0,
    average: row.stats?.average ?? null,
    image: null,
  };
}

function toBowlerCard(row) {
  return {
    id: row.player_id,
    name: row.player?.name ?? '—',
    type: 'BOWL',
    wickets: row.stats?.wickets ?? 0,
    innings: row.stats?.innings ?? 0,
    economy: row.stats?.economy ?? null,
    image: null,
  };
}

function toOtherCard(row, key) {
  return {
    id: row.player_id,
    name: row.player?.name ?? '—',
    type: 'BAT',
    stat: row.stats?.[key] ?? 0,
    innings: row.stats?.innings ?? 0,
    average: row.stats?.average ?? null,
    image: null,
  };
}

function PlayerCard({ player, rank, variant = 'batter' }) {
  const isBowler = variant === 'bowler';
  const isOther = variant === 'other';
  const keyStat = isBowler ? player.wickets : isOther ? player.stat : player.score;
  const detailText = isBowler
    ? `Innings: ${player.innings} Economy: ${formatDecimal(player.economy, 2)}`
    : `Innings: ${player.innings} Average: ${formatDecimal(player.average, 2)}`;

  return (
    <div className="flex items-center gap-3 rounded-[17px] bg-surface p-3">
      <Avatar className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/10">
        <AvatarImage src={player.image || defaultAvatar} alt="" className="object-cover" />
        <AvatarFallback className="bg-zinc-700 text-white">{getInitials(player.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-[16px] font-bold text-white">{player.name}</span>
          <span className="shrink-0 text-[12px] font-medium text-[#DEDEDE]">{player.type}</span>
        </div>
        <p className="mt-0.5 text-[18px] font-bold text-brand">{keyStat}</p>
        <p className="text-[12px] font-medium text-muted">{detailText}</p>
      </div>
      <span className="text-[48px] leading-none font-bold text-brand/40" aria-hidden>
        {rank}
      </span>
    </div>
  );
}

function RankingSection({ title, linkTo, linkState, rows, variant = 'batter', loading, error, emptyMessage }) {
  const desktopCardWidthClass = 'lg:w-[calc((100%-0.75rem)/2)]';

  return (
    <>
      <div className={`flex items-center justify-between pb-3 lg:mx-auto ${desktopCardWidthClass}`}>
        <h2 className="text-[13px] font-bold tracking-wide text-muted uppercase">{title}</h2>
        <Link
          to={linkTo}
          state={linkState}
          className="text-[12px] font-bold tracking-wide text-brand uppercase transition-opacity active:opacity-80"
        >
          View More
        </Link>
      </div>
      {loading && <p className="text-[13px] text-muted">Loading rankings…</p>}
      {error && !loading && <p className="text-[13px] text-red-400">Failed to load rankings.</p>}
      {!loading && !error && rows.length === 0 && <p className="text-[13px] text-muted">{emptyMessage}</p>}
      <div className="space-y-3 lg:grid lg:grid-cols-1 lg:justify-items-center lg:gap-3 lg:space-y-0">
        {rows.slice(0, TOP_RANKINGS_LIMIT).map((player, index) => (
          <div key={player.id} className={desktopCardWidthClass}>
            <PlayerCard player={player} rank={index + 1} variant={variant} />
          </div>
        ))}
      </div>
    </>
  );
}

export default function Ranking() {
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
  const { data: sixesData, isLoading: isLoadingSixes, isError: isErrorSixes } = useOpenTournamentRankings('batting', 'sixes');
  const { data: foursData, isLoading: isLoadingFours, isError: isErrorFours } = useOpenTournamentRankings('batting', 'fours');

  const rawBatters = safeRankings(battingData);
  const rawBowlers = safeRankings(bowlingData);
  const rawSixes = safeRankings(sixesData);
  const rawFours = safeRankings(foursData);

  const topBatters = rawBatters.map(toBatterCard);
  const topBowlers = rawBowlers.map(toBowlerCard);
  const mostSixes = rawSixes.map((row) => toOtherCard(row, 'sixes'));
  const mostFours = rawFours.map((row) => toOtherCard(row, 'fours'));

  return (
    <div className="bg-black">
      <AppSubpageHeader title="Latest Ranking" />
      <Container>
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
              linkState={{ fromRanking: true, rankingData: rawBatters }}
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
              linkState={{ fromRanking: true, rankingData: rawBowlers }}
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
                linkState={{ fromRanking: true, rankingData: rawSixes }}
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
                linkState={{ fromRanking: true, rankingData: rawFours }}
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
