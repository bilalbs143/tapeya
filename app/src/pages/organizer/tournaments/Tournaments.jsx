import { useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { formatDateRange } from '@/lib/utils/dateUtils';
import { areTournamentTeamsComplete, getTournamentDisplayImage, getTournamentTitle } from '@/lib/utils/tournamentUtils';
import { useGetTournamentsQuery } from '@/store/api/tournamentApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { ListEmpty, ListError } from '@/ui/ListState';
import { PageLoader } from '@/ui/Loader';

const FIXTURE_CARD_IMAGE = `${CLOUDFRONT_APP_BASE}/images/background/fixture-bg.png`;

function TournamentCard({ tournament, showWinningTeam = false, onClick }) {
  const imageUrl = getTournamentDisplayImage(tournament, FIXTURE_CARD_IMAGE);
  const dates = formatDateRange(tournament.start_date, tournament.end_date);
  const location = [tournament.city, tournament.country].filter(Boolean).join(', ');
  const venue = [tournament.venue_name, location].filter(Boolean).join(', ') || '—';

  return (
    <div
      className="bg-surface flex cursor-pointer gap-3 rounded-[17px] p-3"
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={() => onClick?.(tournament)}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(tournament);
        }
      }}
    >
      <div className="bg-surface-deep flex h-[117px] w-[100px] shrink-0 overflow-hidden rounded-xl">
        <img
          src={imageUrl}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => {
            if (e.currentTarget.src !== FIXTURE_CARD_IMAGE) {
              e.currentTarget.src = FIXTURE_CARD_IMAGE;
            }
          }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-[13px] font-bold text-white">{getTournamentTitle(tournament)}</h3>
        {tournament.tournament_type_label && <p className="text-muted mt-0.5 text-[12px]">{tournament.tournament_type_label}</p>}
        <ul className="mt-1.5 space-y-0.5 text-xs">
          <li>
            <span className="text-muted">Dates:</span> <span className="text-white">{dates}</span>
          </li>
          <li>
            <span className="text-muted">Venue:</span> <span className="text-white">{venue}</span>
          </li>
          <li>
            <span className="text-muted">Teams:</span>{' '}
            <span className="text-white">
              {tournament.teams_count ?? 0} / {tournament.number_of_teams ?? '—'}
            </span>
          </li>
          {showWinningTeam && tournament.winning_team && (
            <li>
              <span className="text-brand">Winning Team:</span> <span className="text-brand">{tournament.winning_team}</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  if (!children?.length) return null;
  return (
    <section>
      <h2 className="text-muted mb-3 text-[13px] font-bold tracking-wide uppercase">{title}</h2>
      <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">{children}</div>
    </section>
  );
}

export default function Tournaments() {
  const navigate = useNavigate();
  const {
    data: tournamentsData,
    isLoading,
    isError,
    refetch,
  } = useGetTournamentsQuery({
    all: true,
    organizer_tournaments: true,
  });

  const { scheduled, previous } = useMemo(() => {
    const list = tournamentsData?.data ?? [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const scheduled = [];
    const previous = [];

    list.forEach((t) => {
      const endStr = t.end_date?.includes?.('T') ? t.end_date : t.end_date ? `${t.end_date}T12:00:00` : null;
      const endDate = endStr ? new Date(endStr) : null;
      if (endDate && endDate < today) {
        previous.push(t);
      } else {
        scheduled.push(t);
      }
    });

    return { scheduled, previous };
  }, [tournamentsData?.data]);

  const handleTournamentClick = (tournament) => {
    const payload = {
      ...tournament,
      name: getTournamentTitle(tournament),
    };
    const state = { tournament: payload };
    const teamsCount = tournament.teams_count ?? 0;
    const teamsComplete = areTournamentTeamsComplete(tournament, teamsCount);
    const noTeams = teamsCount === 0;

    if (noTeams || teamsComplete) {
      navigate(`/organizer/tournaments/${tournament.id}/create-team-intro`, { state });
    } else {
      navigate(`/organizer/tournaments/${tournament.id}/saved-teams`, { state });
    }
  };

  const hasTournaments = scheduled.length > 0 || previous.length > 0;

  if (isLoading) {
    return (
      <div className="bg-black">
        <AppSubpageHeader title="My Tournaments" />
        <Container>
          <PageLoader label="Loading tournaments" className="py-16" />
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-black">
      <AppSubpageHeader
        title="My Tournaments"
        right={
          <button
            type="button"
            onClick={() => navigate('/organizer/tournaments/create')}
            className="bg-brand flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold text-black"
            aria-label="Create tournament"
          >
            +
          </button>
        }
      />
      <Container>
        {isError ? <ListError message="Could not load tournaments." onRetry={() => refetch()} /> : null}

        {!isError && !hasTournaments ? (
          <ListEmpty
            title="No Tournaments Yet."
            description="Create a tournament, add teams, and start scoring matches."
            action={
              <Button type="button" variant="orange" onClick={() => navigate('/organizer/tournaments/create')}>
                Create Tournament
              </Button>
            }
          />
        ) : null}

        {!isError && hasTournaments ? (
          <div className="space-y-6 pb-10">
            <Section title="Active">
              {scheduled.map((t) => (
                <TournamentCard key={t.id} tournament={t} onClick={handleTournamentClick} />
              ))}
            </Section>

            <Section title="Previous">
              {previous.map((t) => (
                <TournamentCard key={t.id} tournament={t} showWinningTeam onClick={handleTournamentClick} />
              ))}
            </Section>
          </div>
        ) : null}
      </Container>
    </div>
  );
}
