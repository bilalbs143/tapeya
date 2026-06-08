import { useEffect, useState } from 'react';

import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { AppSubpageBackButton } from '@/components/AppSubpageHeader';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { formatCount } from '@/lib/format';
import { formatOrdinalDateRange } from '@/lib/utils/dateUtils';
import { getTournamentCoverImage, getTournamentTitle, isValidTournamentId } from '@/lib/utils/tournamentUtils';
import { ThumbsUpIcon } from '@/pages/feed/PostCard';
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

const feedShareIcon = `${CLOUDFRONT_APP_BASE}/images/icons/feed-share.svg`;
const FIXTURE_TAB_BG = `${CLOUDFRONT_APP_BASE}/images/background/fixture-bg.png`;

const DETAIL_TABS = {
  FIXTURES: 'fixtures',
  TEAMS: 'teams',
  SQUADS: 'squads',
};

function tabFromSearchParams(searchParams) {
  const t = searchParams.get('tab');
  if (t === DETAIL_TABS.FIXTURES || t === DETAIL_TABS.TEAMS || t === DETAIL_TABS.SQUADS) {
    return t;
  }
  return DETAIL_TABS.FIXTURES;
}

const FALLBACK_IMAGE = FIXTURE_TAB_BG;

const DEFAULT_TOURNAMENT = {
  display_image: FALLBACK_IMAGE,
  tournament_name: 'Tournament',
  name: 'Tournament',
  start_date: '',
  end_date: '',
  description: '',
};

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
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(() => tabFromSearchParams(searchParams));
  const [counts, setCounts] = useState({
    likes_count: 0,
    dislikes_count: 0,
    shares_count: 0,
  });
  const [myReaction, setMyReaction] = useState(null);

  const [likeTournament, { isLoading: isLiking }] = useLikeTournamentMutation();
  const [dislikeTournament, { isLoading: isDisliking }] = useDislikeTournamentMutation();
  const [shareTournament, { isLoading: isSharing }] = useShareTournamentMutation();

  const hasValidId = isValidTournamentId(tournamentId);
  const numericId = hasValidId ? Number(tournamentId) : undefined;
  const hasValidNumericId = typeof numericId === 'number' && Number.isInteger(numericId) && numericId > 0;

  const { data: tournamentFromApi, isLoading: isLoadingTournament } = useGetTournamentQuery(
    { id: numericId, with_matches: true },
    { skip: !hasValidId || !hasValidNumericId },
  );

  const tournament = tournamentFromApi ?? stateTournament ?? { id: tournamentId, ...DEFAULT_TOURNAMENT };
  const embeddedMatches = Array.isArray(tournamentFromApi?.matches) ? tournamentFromApi.matches : undefined;
  const fixturesLoading = isLoadingTournament && embeddedMatches === undefined;

  /** Backoffice cover image — full-width detail banner (1920×600). */
  const headerImageSrc = getTournamentCoverImage(tournament, FALLBACK_IMAGE);
  const displayName = getTournamentTitle(tournament);
  const startDate = tournament.start_date ?? '';
  const endDate = tournament.end_date ?? '';
  const description = tournament.description ?? '';

  useEffect(() => {
    setCounts({
      likes_count: tournament.likes_count ?? 0,
      dislikes_count: tournament.dislikes_count ?? 0,
      shares_count: tournament.shares_count ?? 0,
    });
    const reaction = tournament.my_reaction ?? null;
    setMyReaction(reaction === 'like' || reaction === 'dislike' ? reaction : null);
  }, [tournament.id, tournament.likes_count, tournament.dislikes_count, tournament.shares_count, tournament.my_reaction]);

  useEffect(() => {
    setActiveTab(tabFromSearchParams(searchParams));
  }, [tournamentId, searchParams]);

  const handleDetailTabChange = (value) => {
    setActiveTab(value);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', value);
        return next;
      },
      { replace: true },
    );
  };

  const canReact = hasValidNumericId;
  const isReacting = isLiking || isDisliking || isSharing;
  const interestCampaignSlug = tournament.interest_campaign_slug ?? null;
  const canExpressInterest = canReact && interestCampaignSlug !== null;

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------

  const handleLike = async () => {
    if (!canReact || isReacting) return;
    try {
      const result = await likeTournament(numericId).unwrap();
      if (result && typeof result === 'object') {
        setCounts((prev) => ({ ...prev, ...result }));
        if (result.my_reaction !== undefined) setMyReaction(result.my_reaction);
      }
    } catch {
      // Optional: surface a toast here on error.
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
      // Ignore; counts stay unchanged on error.
    }
  };

  const handleInterestClick = () => {
    if (!canExpressInterest || !interestCampaignSlug) return;
    navigate(`/interest/${interestCampaignSlug}`);
  };

  const handleShare = async () => {
    if (!canReact || isReacting) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: displayName,
          text: description || displayName,
          url: window.location.href,
        });
        const result = await shareTournament(numericId).unwrap();
        if (result && typeof result === 'object') setCounts((prev) => ({ ...prev, ...result }));
      }
    } catch {
      // User cancelled or share failed; do not increment share count.
    }
  };

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <div className="">
      {/* Banner: extends behind navbar; back button positioned within the image */}
      <div className="bg-surface-deep relative h-[250px] w-full overflow-hidden lg:h-[400px]">
        <img
          key={headerImageSrc}
          src={headerImageSrc}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => {
            if (e.currentTarget.src !== FALLBACK_IMAGE) {
              e.currentTarget.src = FALLBACK_IMAGE;
            }
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <AppSubpageBackButton onClick={() => navigate(-1)} className="absolute top-20 left-4" aria-label="Back" />
      </div>

      <Container className="!px-4 !py-0">
        {/* Title & date */}
        <div className="mt-4">
          <h1 className="text-[22px] leading-tight font-bold text-white">{displayName}</h1>
          <p className="text-muted mt-1 text-[14px]">{formatOrdinalDateRange(startDate, endDate)}</p>
          {isLoadingTournament && !stateTournament && hasValidId && (
            <p className="text-muted mt-1 text-[12px]">Refreshing tournament details…</p>
          )}
        </div>

        {canExpressInterest && (
          <button
            type="button"
            onClick={handleInterestClick}
            className="bg-brand mt-4 flex w-full items-center justify-center gap-2 rounded-[10px] py-3 text-[14px] font-bold tracking-wide text-black uppercase transition-opacity active:opacity-90"
          >
            I'm Interested
          </button>
        )}

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
              className={`flex h-[44px] w-[44px] items-center justify-center rounded-full ${myReaction === 'like' ? 'bg-brand' : 'bg-surface'}`}
            >
              <ThumbsUpIcon className={myReaction === 'like' ? 'text-black' : 'text-white'} />
            </div>
            <span className="text-[12px] font-medium text-white">{formatCount(counts.likes_count)}</span>
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
              className={`flex h-[44px] w-[44px] items-center justify-center rounded-full ${myReaction === 'dislike' ? 'bg-brand' : 'bg-surface'}`}
            >
              <ThumbsDownIcon className={myReaction === 'dislike' ? 'text-black' : 'text-white'} />
            </div>
            <span className="text-[12px] font-medium text-white">{formatCount(counts.dislikes_count)}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            disabled={!canReact || isReacting}
            className="flex flex-col items-center gap-1.5 transition-opacity active:opacity-80 disabled:cursor-default disabled:opacity-60"
            aria-label={`Share. ${formatCount(counts.shares_count)} shares`}
          >
            <div className="bg-surface flex h-[44px] w-[44px] items-center justify-center rounded-full">
              <img src={feedShareIcon} alt="" className="h-5 w-5 brightness-0 invert" aria-hidden />
            </div>
            <span className="text-[12px] font-medium text-white">{formatCount(counts.shares_count)}</span>
          </button>
        </div>

        {/* Description */}
        <p className="mt-4 text-left text-[14px] leading-relaxed text-white/95">{description}</p>

        <Tabs value={activeTab} onValueChange={handleDetailTabChange} className="mt-5 w-full">
          <div className="-mx-4 px-4 pb-3">
            <TabsList className="flex justify-center gap-2 p-1">
              <TabsTrigger
                value={DETAIL_TABS.FIXTURES}
                className="data-[state=active]:bg-brand data-[state=inactive]:bg-surface-border rounded-lg px-3 py-2.5 text-[13px] font-bold uppercase transition-colors focus:outline-none data-[state=active]:text-black data-[state=inactive]:text-white"
              >
                Fixtures
              </TabsTrigger>
              <TabsTrigger
                value={DETAIL_TABS.TEAMS}
                className="data-[state=active]:bg-brand data-[state=inactive]:bg-surface-border rounded-lg px-3 py-2.5 text-[13px] font-bold uppercase transition-colors focus:outline-none data-[state=active]:text-black data-[state=inactive]:text-white"
              >
                Teams
              </TabsTrigger>
              <TabsTrigger
                value={DETAIL_TABS.SQUADS}
                className="data-[state=active]:bg-brand data-[state=inactive]:bg-surface-border rounded-lg px-3 py-2.5 text-[13px] font-bold uppercase transition-colors focus:outline-none data-[state=active]:text-black data-[state=inactive]:text-white"
              >
                Squads
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="mt-2 pb-6">
            {activeTab === DETAIL_TABS.FIXTURES && (
              <FixturesTab
                tournamentId={tournamentId}
                numberOfGroups={tournament.number_of_groups}
                canManageTournament={tournament.can_manage === true}
                preloadedMatches={embeddedMatches}
                isLoadingMatches={fixturesLoading}
              />
            )}
            {activeTab === DETAIL_TABS.TEAMS && <TeamsTab tournamentId={tournamentId} />}
            {activeTab === DETAIL_TABS.SQUADS && <SquadsTab tournamentId={tournamentId} />}
          </div>
        </Tabs>
      </Container>
    </div>
  );
}
