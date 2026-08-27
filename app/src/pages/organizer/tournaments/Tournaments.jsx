import { Children, useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { formatDateRange } from '@/lib/utils/dateUtils';
import { areTournamentTeamsComplete, getTournamentDisplayImage, getTournamentTitle } from '@/lib/utils/tournamentUtils';
import { useGetTournamentsQuery } from '@/store/api/tournamentApi';
import { useGetMyTournamentRequestsQuery } from '@/store/api/tournamentRequestApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { ListEmpty, ListError } from '@/ui/ListState';
import { PageLoader } from '@/ui/Loader';
import { StatusPill } from '@/ui/StatusPill';
import { tournamentRequestStatusTone } from '@/ui/statusPillTones';

/** Same asset as upcoming tournament details (Fixtures) header. */
const FIXTURE_CARD_IMAGE = `${CLOUDFRONT_APP_BASE}/images/background/fixture-bg.png`;

function PendingRequestCard({ request }) {
  const dates = formatDateRange(request.start_date, request.end_date);
  const location = [request.city, request.country].filter(Boolean).join(', ');
  const venue = [request.venue_name, location].filter(Boolean).join(', ') || '—';

  return (
    <div className="border-brand/25 bg-surface flex gap-3 rounded-[17px] border p-3">
      <div className="bg-surface-deep flex h-[117px] w-[100px] shrink-0 items-center justify-center overflow-hidden rounded-xl">
        <img src={FIXTURE_CARD_IMAGE} alt="" className="h-full w-full object-cover opacity-80" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <StatusPill
            tone={tournamentRequestStatusTone(request.status)}
            size="sm"
            label={request.status_label ?? request.status}
          />
        </div>
        <h3 className="line-clamp-2 text-[13px] font-bold text-white">{request.tournament_name}</h3>
        {request.tournament_type_label && <p className="text-muted mt-0.5 text-[12px]">{request.tournament_type_label}</p>}
        <ul className="mt-1.5 space-y-0.5 text-xs">
          <li>
            <span className="text-muted">Dates:</span> <span className="text-white">{dates}</span>
          </li>
          <li>
            <span className="text-muted">Venue:</span> <span className="text-white">{venue}</span>
          </li>
          <li>
            <span className="text-muted">Teams:</span> <span className="text-white">{request.number_of_teams ?? '—'}</span>
          </li>
        </ul>
        {request.status === 'pending' && (
          <p className="text-muted mt-2 text-[11px] leading-snug">
            Our team is reviewing your request. We will contact you shortly.
          </p>
        )}
        {request.status === 'rejected' && (
          <p className="text-muted mt-2 text-[11px] leading-snug">
            This request was not approved. Contact support for more information.
          </p>
        )}
      </div>
    </div>
  );
}

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
        {tournament.tournament_type_label && (
          <p className="mt-0.5 text-[13px] font-bold text-white">{tournament.tournament_type_label}</p>
        )}
        <ul className="mt-1.5 space-y-0.5 text-xs">
          <li>
            <span className="text-muted">Dates:</span> <span className="text-white">{dates}</span>
          </li>
          <li>
            <span className="text-muted">Format:</span>{' '}
            <span className="text-white">
              {tournament.number_of_groups == null || tournament.number_of_groups <= 1
                ? 'Single Table'
                : `Groups: ${tournament.number_of_groups}`}
            </span>
          </li>
          <li>
            <span className="text-muted">Venue:</span> <span className="text-white">{venue}</span>
          </li>
          <li>
            <span className="text-muted">Teams:</span> <span className="text-white">{tournament.number_of_teams ?? '—'}</span>
          </li>
          {tournament.prize != null && tournament.prize !== '' && (
            <li>
              <span className="text-muted">Prize:</span> <span className="text-white">{tournament.prize}</span>
            </li>
          )}
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
  const count = Children.count(children);
  if (count === 0) return null;
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
    isLoading: isLoadingTournaments,
    isError: isTournamentsError,
    refetch: refetchTournaments,
  } = useGetTournamentsQuery({
    all: true,
    organizer_tournaments: true,
  });
  const {
    data: myRequests = [],
    isLoading: isLoadingRequests,
    isError: isRequestsError,
    refetch: refetchRequests,
  } = useGetMyTournamentRequestsQuery();

  const isLoading = isLoadingTournaments || isLoadingRequests;
  const isError = isTournamentsError || isRequestsError;

  const handleRetry = () => {
    if (isTournamentsError) refetchTournaments();
    if (isRequestsError) refetchRequests();
  };

  /**
   * Show pending + rejected requests so the organizer can track their request status.
   * Approved requests that have been converted to a tournament appear in the
   * Scheduled / Previous sections below — no need to duplicate them here.
   */
  const trackedRequests = useMemo(
    () => myRequests.filter((r) => r.status === 'pending' || r.status === 'rejected'),
    [myRequests],
  );

  const { scheduled, previous } = useMemo(() => {
    const list = tournamentsData?.data ?? [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const scheduled = [];
    const previous = [];

    list.forEach((t) => {
      const endStr = t.end_date?.includes?.('T') ? t.end_date : t.end_date ? t.end_date + 'T12:00:00' : null;
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
      navigate(`/organizer/tournaments/${tournament.id}/create-team-intro`, {
        state,
      });
    } else {
      navigate(`/organizer/tournaments/${tournament.id}/saved-teams`, {
        state,
      });
    }
  };

  const hasTournaments = scheduled.length > 0 || previous.length > 0;
  const hasContent = trackedRequests.length > 0 || hasTournaments;
  const isEmpty = !hasContent;

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
          hasContent ? (
            <button
              type="button"
              onClick={() => navigate('/tournament-request')}
              className="bg-brand flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold text-black"
              aria-label="Request a Tournament"
            >
              +
            </button>
          ) : undefined
        }
      />
      <Container>
        {isError ? <ListError message="Could not load tournaments." onRetry={handleRetry} /> : null}

        {!isError && isEmpty ? (
          <ListEmpty
            title="No Tournaments Yet."
            description="Want to host one? Request a tournament."
            action={
              <Button type="button" variant="orange" onClick={() => navigate('/tournament-request')}>
                Request a Tournament
              </Button>
            }
          />
        ) : null}

        {!isError && hasContent ? (
          <div className="space-y-6 pb-10">
            <Section title="My Requests">
              {trackedRequests.map((request) => (
                <PendingRequestCard key={request.id} request={request} />
              ))}
            </Section>

            <Section title="Scheduled Tournaments">
              {scheduled.map((t) => (
                <TournamentCard key={t.id} tournament={t} onClick={handleTournamentClick} />
              ))}
            </Section>

            <Section title="Previous Tournaments">
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
