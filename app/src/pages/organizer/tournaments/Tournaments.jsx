import { Children, useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { formatDateRange } from '@/lib/utils/dateUtils';
import { areTournamentTeamsComplete, getTournamentDisplayImage, getTournamentTitle } from '@/lib/utils/tournamentUtils';
import { useGetTournamentsQuery } from '@/store/api/tournamentApi';
import { useGetMyTournamentRequestsQuery } from '@/store/api/tournamentRequestApi';
import { Container } from '@/ui/Container';

/** Same asset as upcoming tournament details (Fixtures) header. */
const FIXTURE_CARD_IMAGE = `${CLOUDFRONT_APP_BASE}/images/background/fixture-bg.png`;

const STATUS_STYLES = {
  pending: 'bg-brand/15 text-brand border-brand/40',
  approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/40',
};

function StatusBadge({ status, label }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase ${style}`}>
      {label ?? status}
    </span>
  );
}

function PendingRequestCard({ request }) {
  const dates = formatDateRange(request.start_date, request.end_date);
  const location = [request.city, request.country].filter(Boolean).join(', ');
  const venue = [request.venue_name, location].filter(Boolean).join(', ') || '—';

  return (
    <div className="flex gap-3 rounded-[17px] border border-brand/25 bg-surface p-3">
      <div className="flex h-[117px] w-[100px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-deep">
        <img src={FIXTURE_CARD_IMAGE} alt="" className="h-full w-full object-cover opacity-80" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <StatusBadge status={request.status} label={request.status_label} />
        </div>
        <h3 className="line-clamp-2 text-[13px] font-bold text-white">{request.tournament_name}</h3>
        {request.tournament_type_label && <p className="mt-0.5 text-[12px] text-muted">{request.tournament_type_label}</p>}
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
          <p className="mt-2 text-[11px] leading-snug text-muted">
            Our team is reviewing your request. We will contact you shortly.
          </p>
        )}
        {request.status === 'rejected' && (
          <p className="mt-2 text-[11px] leading-snug text-muted">
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
      className="flex cursor-pointer gap-3 rounded-[17px] bg-surface p-3"
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
      <div className="flex h-[117px] w-[100px] shrink-0 overflow-hidden rounded-xl bg-surface-deep">
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
              <span className="text-brand">Winning Team:</span>{' '}
              <span className="text-brand">{tournament.winning_team}</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

function Section({ title, children, emptyMessage = 'No tournaments' }) {
  const count = Children.count(children);
  return (
    <section>
      <h2 className="mb-3 text-[13px] font-bold tracking-wide text-muted uppercase">{title}</h2>
      {count > 0 ? (
        <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">{children}</div>
      ) : (
        <p className="rounded-[17px] bg-surface px-4 py-6 text-center text-[13px] text-muted">{emptyMessage}</p>
      )}
    </section>
  );
}

export default function Tournaments() {
  const navigate = useNavigate();
  const {
    data: tournamentsData,
    isLoading: isLoadingTournaments,
    isError: isTournamentsError,
  } = useGetTournamentsQuery({
    all: true,
    organizer_tournaments: true,
  });
  const { data: myRequests = [], isLoading: isLoadingRequests, isError: isRequestsError } = useGetMyTournamentRequestsQuery();

  const isLoading = isLoadingTournaments || isLoadingRequests;
  const isError = isTournamentsError || isRequestsError;

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
  const isEmpty = trackedRequests.length === 0 && !hasTournaments;

  if (isLoading) {
    return (
      <div className="bg-black">
        <AppSubpageHeader title="My Tournaments" />
        <Container>
          <p className="py-6 text-center text-[13px] text-muted">Loading tournaments…</p>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-black">
      <AppSubpageHeader title="My Tournaments" />
      <Container>
        {isError && <p className="mb-3 text-center text-[13px] text-red-400">Failed to load tournaments. Try again later.</p>}
        <div className="space-y-6 pb-6">
          {/* Pending / rejected requests — visible until the request becomes a real tournament */}
          {trackedRequests.length > 0 && (
            <Section title="My Requests" emptyMessage="">
              {trackedRequests.map((request) => (
                <PendingRequestCard key={request.id} request={request} />
              ))}
            </Section>
          )}

          {/* Tournaments the user organises */}
          {hasTournaments && (
            <>
              <Section title="Scheduled Tournaments" emptyMessage="No scheduled tournaments.">
                {scheduled.map((t) => (
                  <TournamentCard key={t.id} tournament={t} onClick={handleTournamentClick} />
                ))}
              </Section>

              <Section title="Previous Tournaments" emptyMessage="No previous tournaments.">
                {previous.map((t) => (
                  <TournamentCard key={t.id} tournament={t} showWinningTeam onClick={handleTournamentClick} />
                ))}
              </Section>
            </>
          )}

          {/* Nothing at all — prompt to request */}
          {isEmpty && !isError && (
            <div className="rounded-[17px] bg-surface px-4 py-8 text-center">
              <p className="text-[14px] text-muted">You have no tournaments yet.</p>
              <button
                type="button"
                onClick={() => navigate('/tournament-request')}
                className="mt-4 rounded-[6px] bg-brand px-6 py-2.5 text-[14px] font-bold text-black transition-opacity active:opacity-90"
              >
                Request a Tournament
              </button>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
