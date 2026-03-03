import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import feedShareIcon from '@/assets/images/icons/feed-share.svg';
import { formatOrdinalDateRange } from '@/lib/format';
import { formatCount, ThumbsUpIcon } from '@/pages/feed/PostCard';
import { Container } from '@/ui/Container';
import { Tabs, TabsList, TabsTrigger } from '@/ui/Tabs';

import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TOURNAMENT_FALLBACK,
  DETAIL_TABS,
  PLACEHOLDER_BANNER,
  BANNER_HEIGHT_PX,
} from './constants';
import { FixturesTab, SquadsTab, TeamsTab } from './tabs';

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

  const tournament =
    stateTournament ?? {
      id: tournamentId,
      display_image: PLACEHOLDER_BANNER,
      ...DEFAULT_TOURNAMENT_FALLBACK,
    };

  const displayName = tournament.tournament_name ?? tournament.name ?? 'Tournament';
  const startDate = tournament.start_date ?? DEFAULT_TOURNAMENT_FALLBACK.start_date;
  const endDate = tournament.end_date ?? DEFAULT_TOURNAMENT_FALLBACK.end_date;
  const description =
    tournament.description ?? DEFAULT_DESCRIPTION;

  return (
    <div className="">
      {/* Banner: extends behind navbar; back button below nav */}
      <div
        className="relative w-full overflow-hidden bg-[#0d0d0b]"
        style={{ height: BANNER_HEIGHT_PX }}
      >
        <img
          src={tournament.display_image || tournament.cover_image || PLACEHOLDER_BANNER}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-4 top-20 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#4a4a4a] transition-opacity active:opacity-80"
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
          <h1 className="text-[22px] font-bold leading-tight text-white">
            {displayName}
          </h1>
          <p className="mt-1 text-[14px] text-[#A2A6AB]">
            {formatOrdinalDateRange(startDate, endDate)}
          </p>
        </div>

        {/* Engagement: like, dislike, share – centered, icons in white circles */}
        <div className="mt-4 flex justify-center gap-8">
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#141412]">
              <ThumbsUpIcon className="text-white" />
            </div>
            <span className="text-[12px] font-medium text-white">
              {formatCount(tournament.likes_count ?? 0)}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#141412]">
              <ThumbsDownIcon className="text-white" />
            </div>
            <span className="text-[12px] font-medium text-white">
              {formatCount(tournament.dislikes_count ?? 0)}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#141412]">
              <img
                src={feedShareIcon}
                alt=""
                className="h-5 w-5 brightness-0 invert"
                aria-hidden
              />
            </div>
            <span className="text-[12px] font-medium text-white">
              {formatCount(tournament.shares_count ?? 0)}
            </span>
          </div>
        </div>

        {/* Description – directly under socials, left-aligned, light text */}
        <p className="mt-4 text-left text-[14px] leading-relaxed text-white/95">
          {description}
        </p>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-5 w-full">
          <div className="-mx-4 px-4 pb-3">
            <TabsList className="flex justify-center gap-2 p-1">
              <TabsTrigger
                value={DETAIL_TABS.FIXTURES}
                className="rounded-lg px-3 py-2.5 text-[13px] font-bold uppercase transition-colors data-[state=inactive]:bg-[#1A1A1A] data-[state=inactive]:text-white data-[state=active]:bg-[#DA9811] data-[state=active]:text-black focus:outline-none"
              >
                Fixtures
              </TabsTrigger>
              <TabsTrigger
                value={DETAIL_TABS.TEAMS}
                className="rounded-lg px-3 py-2.5 text-[13px] font-bold uppercase transition-colors data-[state=inactive]:bg-[#1A1A1A] data-[state=inactive]:text-white data-[state=active]:bg-[#DA9811] data-[state=active]:text-black focus:outline-none"
              >
                Teams
              </TabsTrigger>
              <TabsTrigger
                value={DETAIL_TABS.SQUADS}
                className="rounded-lg px-3 py-2.5 text-[13px] font-bold uppercase transition-colors data-[state=inactive]:bg-[#1A1A1A] data-[state=inactive]:text-white data-[state=active]:bg-[#DA9811] data-[state=active]:text-black focus:outline-none"
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
