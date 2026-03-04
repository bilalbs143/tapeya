import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import feedShareIcon from '@/assets/images/icons/feed-share.svg';
import { formatOrdinalDateRange } from '@/lib/format';
import { formatCount, ThumbsUpIcon } from '@/pages/feed/PostCard';
import { FixturesTab } from '@/pages/upcoming-tournaments/tabs/FixturesTab';
import { SquadsTab } from '@/pages/upcoming-tournaments/tabs/SquadsTab';
import { TeamsTab } from '@/pages/upcoming-tournaments/tabs/TeamsTab';
import {
  useDislikeTournamentMutation,
  useGetTournamentQuery,
  useLikeTournamentMutation,
  useShareTournamentMutation,
} from '@/store/api/tournamentApi';
import { Container } from '@/ui/Container';
import { Tabs, TabsList, TabsTrigger } from '@/ui/Tabs';

const DETAIL_TABS = {
  FIXTURES: 'fixtures',
  TEAMS: 'teams',
  SQUADS: 'squads',
};
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=320&fit=crop';

/** cover_image → fallback (detail page uses cover) */
function getTournamentImage(tournament, fallback = FALLBACK_IMAGE) {
  return tournament?.cover_image || fallback;
}

function ThumbsDownIcon({ className = '' }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path
        d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"
        fill="none"
      />
    </svg>
  );
}

export default function UpcomingTournamentDetails() {
  const navigate = useNavigate();
  const { tournamentId } = useParams();
  const location = useLocation();
  const stateTournament = location.state?.tournament;

  const [activeTab, setActiveTab] = useState(DETAIL_TABS.FIXTURES);
  const [counts, setCounts] = useState({
    likes_count: 0,
    dislikes_count: 0,
    shares_count: 0,
  });
  const [myReaction, setMyReaction] = useState(null); // 'like' | 'dislike' | null

  const [likeTournament, { isLoading: isLiking }] = useLikeTournamentMutation();
  const [dislikeTournament, { isLoading: isDisliking }] =
    useDislikeTournamentMutation();
  const [shareTournament, { isLoading: isSharing }] =
    useShareTournamentMutation();

  const isPlaceholderRoute =
    !tournamentId || String(tournamentId).startsWith('placeholder-');

  const numericId = !isPlaceholderRoute ? Number(tournamentId) : undefined;
  const hasValidNumericId =
    typeof numericId === 'number' &&
    Number.isInteger(numericId) &&
    numericId > 0;

  const { data: tournamentFromApi, isLoading: isLoadingTournament } =
    useGetTournamentQuery(
      { id: numericId },
      { skip: isPlaceholderRoute || !hasValidNumericId },
    );

  const tournament = tournamentFromApi ??
    stateTournament ?? {
      id: tournamentId,
      display_image: FALLBACK_IMAGE,
      tournament_name: 'Tournament',
      name: 'Tournament',
      start_date: '',
      end_date: '',
      description: '',
    };

  const bannerImage = getTournamentImage(tournament);

  const displayName =
    tournament.tournament_name ?? tournament.name ?? 'Tournament';
  const startDate = tournament.start_date ?? '';
  const endDate = tournament.end_date ?? '';
  const description = tournament.description ?? '';

  useEffect(() => {
    setCounts({
      likes_count: tournament.likes_count ?? 0,
      dislikes_count: tournament.dislikes_count ?? 0,
      shares_count: tournament.shares_count ?? 0,
    });
  }, [
    tournament.likes_count,
    tournament.dislikes_count,
    tournament.shares_count,
  ]);

  useEffect(() => {
    const reaction = tournament.my_reaction ?? null;
    setMyReaction(
      reaction === 'like' || reaction === 'dislike' ? reaction : null,
    );
  }, [tournament.my_reaction, tournament.id]);

  const canReact = hasValidNumericId && !isPlaceholderRoute;
  const isReacting = isLiking || isDisliking || isSharing;

  const handleLike = async () => {
    if (!canReact || isReacting) return;
    try {
      const result = await likeTournament(numericId).unwrap();
      if (result && typeof result === 'object') {
        setCounts((prev) => ({ ...prev, ...result }));
        if (result.my_reaction !== undefined) setMyReaction(result.my_reaction);
      }
    } catch {
      // Optional: toast on error
    }
  };

  const handleDislike = async () => {
    if (!canReact || isReacting) return;
    try {
      const result = await dislikeTournament(numericId).unwrap();
      if (result && typeof result === 'object') {
        setCounts((prev) => ({ ...prev, ...result }));
        if (result.my_reaction !== undefined) setMyReaction(result.my_reaction);
      }
    } catch {
      // Ignore; counts stay unchanged
    }
  };

  const handleShare = async () => {
    if (!canReact || isReacting) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({
            title: displayName,
            text: description || displayName,
            url: window.location.href,
          });
        } catch {
          // User cancelled or share failed; still record share count
        }
      }
      const result = await shareTournament(numericId).unwrap();
      if (result && typeof result === 'object')
        setCounts((prev) => ({ ...prev, ...result }));
    } catch {
      // Ignore; counts stay unchanged
    }
  };

  return (
    <div className="">
      {/* Banner: extends behind navbar; back button below nav */}
      <div className="relative h-[200px] w-full overflow-hidden bg-[#0d0d0b]">
        <img
          src={bannerImage}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => {
            if (e.currentTarget.src !== FALLBACK_IMAGE) {
              e.currentTarget.src = FALLBACK_IMAGE;
            }
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute top-20 left-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#4a4a4a] transition-opacity active:opacity-80"
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

      <Container className="!px-4 !py-0">
        {/* Title & date */}
        <div className="mt-4">
          <h1 className="text-[22px] leading-tight font-bold text-white">
            {displayName}
          </h1>
          <p className="mt-1 text-[14px] text-[#A2A6AB]">
            {formatOrdinalDateRange(startDate, endDate)}
          </p>
          {isLoadingTournament && !stateTournament && !isPlaceholderRoute && (
            <p className="mt-1 text-[12px] text-[#A2A6AB]">
              Refreshing tournament details…
            </p>
          )}
        </div>

        {/* Engagement: like, dislike, share – centered, icons in white circles */}
        <div className="mt-4 flex justify-center gap-8">
          <button
            type="button"
            onClick={handleLike}
            disabled={!canReact || isReacting}
            className="flex flex-col items-center gap-1.5 transition-opacity active:opacity-80 disabled:cursor-default disabled:opacity-60"
            aria-label={`Like. ${formatCount(counts.likes_count)} likes`}
            aria-pressed={myReaction === 'like'}
          >
            <div
              className={`flex h-[44px] w-[44px] items-center justify-center rounded-full ${
                myReaction === 'like' ? 'bg-[#DA9811]' : 'bg-[#141412]'
              }`}
            >
              <ThumbsUpIcon
                className={myReaction === 'like' ? 'text-black' : 'text-white'}
              />
            </div>
            <span className="text-[12px] font-medium text-white">
              {formatCount(counts.likes_count)}
            </span>
          </button>
          <button
            type="button"
            onClick={handleDislike}
            disabled={!canReact || isReacting}
            className="flex flex-col items-center gap-1.5 transition-opacity active:opacity-80 disabled:cursor-default disabled:opacity-60"
            aria-label={`Dislike. ${formatCount(counts.dislikes_count)} dislikes`}
            aria-pressed={myReaction === 'dislike'}
          >
            <div
              className={`flex h-[44px] w-[44px] items-center justify-center rounded-full ${
                myReaction === 'dislike' ? 'bg-[#DA9811]' : 'bg-[#141412]'
              }`}
            >
              <ThumbsDownIcon
                className={
                  myReaction === 'dislike' ? 'text-black' : 'text-white'
                }
              />
            </div>
            <span className="text-[12px] font-medium text-white">
              {formatCount(counts.dislikes_count)}
            </span>
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={!canReact || isReacting}
            className="flex flex-col items-center gap-1.5 transition-opacity active:opacity-80 disabled:cursor-default disabled:opacity-60"
            aria-label={`Share. ${formatCount(counts.shares_count)} shares`}
          >
            <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#141412]">
              <img
                src={feedShareIcon}
                alt=""
                className="h-5 w-5 brightness-0 invert"
                aria-hidden
              />
            </div>
            <span className="text-[12px] font-medium text-white">
              {formatCount(counts.shares_count)}
            </span>
          </button>
        </div>

        {/* Description – directly under socials, left-aligned, light text */}
        <p className="mt-4 text-left text-[14px] leading-relaxed text-white/95">
          {description}
        </p>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-5 w-full"
        >
          <div className="-mx-4 px-4 pb-3">
            <TabsList className="flex justify-center gap-2 p-1">
              <TabsTrigger
                value={DETAIL_TABS.FIXTURES}
                className="data-[state=inactive]:text:white rounded-lg px-3 py-2.5 text-[13px] font-bold uppercase transition-colors focus:outline-none data-[state=active]:bg-[#DA9811] data-[state=active]:text-black data-[state=inactive]:bg-[#1A1A1A]"
              >
                Fixtures
              </TabsTrigger>
              <TabsTrigger
                value={DETAIL_TABS.TEAMS}
                className="data-[state=inactive]:text:white rounded-lg px-3 py-2.5 text-[13px] font-bold uppercase transition-colors focus:outline-none data-[state=active]:bg-[#DA9811] data-[state=active]:text-black data-[state=inactive]:bg-[#1A1A1A]"
              >
                Teams
              </TabsTrigger>
              <TabsTrigger
                value={DETAIL_TABS.SQUADS}
                className="data-[state=inactive]:text:white rounded-lg px-3 py-2.5 text-[13px] font-bold uppercase transition-colors focus:outline-none data-[state=active]:bg-[#DA9811] data-[state=active]:text-black data-[state=inactive]:bg-[#1A1A1A]"
              >
                Squads
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="mt-2 pb-6">
            {activeTab === DETAIL_TABS.FIXTURES && (
              <FixturesTab
                tournamentId={tournamentId}
                startDate={startDate}
                endDate={endDate}
              />
            )}
            {activeTab === DETAIL_TABS.TEAMS && (
              <TeamsTab tournamentId={tournamentId} />
            )}
            {activeTab === DETAIL_TABS.SQUADS && (
              <SquadsTab tournamentId={tournamentId} />
            )}
          </div>
        </Tabs>
      </Container>
    </div>
  );
}
