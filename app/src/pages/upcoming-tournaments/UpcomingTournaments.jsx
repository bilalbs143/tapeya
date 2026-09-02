import { useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { formatDateRange, parseDate, toDateStr } from '@/lib/utils/dateUtils';
import { getTournamentDisplayImage, getTournamentTitle } from '@/lib/utils/tournamentUtils';
import { useGetTournamentsQuery } from '@/store/api/tournamentApi';
import { Container } from '@/ui/Container';
import { ListEmpty, ListError } from '@/ui/ListState';
import { LoaderBlock } from '@/ui/Loader';

const FALLBACK_IMAGE = `${CLOUDFRONT_APP_BASE}/images/background/fixture-bg.png`;

function UpcomingTournamentCard({ tournament, onClick }) {
  const imageUrl = getTournamentDisplayImage(tournament, FALLBACK_IMAGE);
  const title = getTournamentTitle(tournament);
  const location = [tournament.city, tournament.country].filter(Boolean).join(', ');

  return (
    <button
      type="button"
      onClick={() => onClick(tournament)}
      className="bg-surface focus-visible:ring-brand flex w-full flex-col overflow-hidden rounded-[17px] text-left transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:opacity-90"
    >
      <div className="bg-surface-deep h-[148px] w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover"
          onError={(e) => {
            if (e.currentTarget.src !== FALLBACK_IMAGE) {
              e.currentTarget.src = FALLBACK_IMAGE;
            }
          }}
        />
      </div>
      <div className="flex flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-[13px] font-bold text-white">{title}</h3>
        <p className="text-muted text-[12px]">{formatDateRange(tournament.start_date, tournament.end_date)}</p>
        {location ? <p className="text-muted text-[12px]">{location}</p> : null}
        {(tournament.matches_count ?? 0) > 0 ? (
          <p className="text-brand text-[11px] font-medium">{tournament.matches_count} fixtures — tap for schedule</p>
        ) : null}
      </div>
    </button>
  );
}

export default function UpcomingTournaments() {
  const navigate = useNavigate();
  const todayStr = toDateStr(new Date());

  const { data, isLoading, isError, refetch } = useGetTournamentsQuery({ all: true, with_matches: true });

  const upcoming = useMemo(() => {
    const list = data?.data ?? [];
    return list
      .filter((t) => {
        const end = parseDate(t.end_date);
        const endStr = end ? toDateStr(end) : '';
        return !endStr || endStr >= todayStr;
      })
      .sort((a, b) => String(a.start_date).localeCompare(String(b.start_date)));
  }, [data?.data, todayStr]);

  const handleCardClick = (tournament) => {
    if (tournament.id == null) return;
    navigate(`/upcoming-tournaments/${tournament.id}`, {
      state: {
        tournament: {
          ...tournament,
          name: tournament.tournament_name ?? tournament.name,
        },
      },
    });
  };

  return (
    <div>
      <AppSubpageHeader title="Upcoming Tournaments" />
      <Container>
        {isLoading ? <LoaderBlock label="Loading tournaments" className="py-16" /> : null}
        {isError ? <ListError message="Could not load tournaments." onRetry={() => refetch()} /> : null}

        {!isLoading && !isError ? (
          <div className="grid grid-cols-2 gap-3 pb-6 lg:grid-cols-3">
            {upcoming.map((tournament) => (
              <UpcomingTournamentCard key={tournament.id} tournament={tournament} onClick={handleCardClick} />
            ))}
          </div>
        ) : null}

        {!isLoading && !isError && upcoming.length === 0 ? (
          <ListEmpty title="No upcoming tournaments." description="Open tournaments with active schedules appear here." />
        ) : null}
      </Container>
    </div>
  );
}
