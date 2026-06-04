import { Children, useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { formatDateRange } from '@/lib/format';
import { areTournamentTeamsComplete, getTournamentDisplayImage, getTournamentTitle } from '@/lib/utils/tournamentUtils';
import { useGetTournamentsQuery } from '@/store/api/tournamentApi';
import { useGetMyTournamentRequestsQuery } from '@/store/api/tournamentRequestApi';
import { Container } from '@/ui/Container';

/** Same asset as upcoming tournament details (Fixtures) header. */
const FIXTURE_CARD_IMAGE = `${CLOUDFRONT_APP_BASE}/images/background/fixture-bg.png`;

const STATUS_STYLES = {
  pending: 'bg-[#DA9811]/15 text-[#DA9811] border-[#DA9811]/40',
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
    <div className="flex gap-3 rounded-[17px] border border-[#DA9811]/25 bg-[#141412] p-3">
      <div className="flex h-[117px] w-[100px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0d0d0b]">
        <img src={FIXTURE_CARD_IMAGE} alt="" className="h-full w-full object-cover opacity-80" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <StatusBadge status={request.status} label={request.status_label} />
        </div>
        <h3 className="line-clamp-2 text-[13px] font-bold text-white">{request.tournament_name}</h3>
        {request.tournament_type_label && <p className="mt-0.5 text-[12px] text-[#A2A6AB]">{request.tournament_type_label}</p>}
        <ul className="mt-1.5 space-y-0.5 text-xs">
          <li>
            <span className="text-[#A2A6AB]">Dates:</span> <span className="text-white">{dates}</span>
          </li>
          <li>
            <span className="text-[#A2A6AB]">Venue:</span> <span className="text-white">{venue}</span>
          </li>
          <li>
            <span className="text-[#A2A6AB]">Teams:</span> <span className="text-white">{request.number_of_teams ?? '—'}</span>
          </li>
        </ul>
        {request.status === 'pending' && (
          <p className="mt-2 text-[11px] leading-snug text-[#A2A6AB]">
            Our team is reviewing your request. We will contact you shortly.
          </p>
        )}
        {request.status === 'rejected' && (
          <p className="mt-2 text-[11px] leading-snug text-[#A2A6AB]">
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
      className="flex cursor-pointer gap-3 rounded-[17px] bg-[#141412] p-3"
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
      <div className="flex h-[117px] w-[100px] shrink-0 overflow-hidden rounded-xl bg-[#0d0d0b]">
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
            <span className="text-[#A2A6AB]">Dates:</span> <span className="text-white">{dates}</span>
          </li>
          <li>
            <span className="text-[#A2A6AB]">Format:</span>{' '}
            <span className="text-white">
              {tournament.number_of_groups == null || tournament.number_of_groups <= 1
                ? 'Single Table'
                : `Groups: ${tournament.number_of_groups}`}
            </span>
          </li>
          <li>
            <span className="text-[#A2A6AB]">Venue:</span> <span className="text-white">{venue}</span>
          </li>
          <li>
            <span className="text-[#A2A6AB]">Teams:</span> <span className="text-white">{tournament.number_of_teams ?? '—'}</span>
          </li>
          {tournament.prize != null && tournament.prize !== '' && (
            <li>
              <span className="text-[#A2A6AB]">Prize:</span> <span className="text-white">{tournament.prize}</span>
            </li>
          )}
          {showWinningTeam && tournament.winning_team && (
            <li>
              <span className="text-[#DA9811]">Winning Team:</span>{' '}
              <span className="text-[#DA9811]">{tournament.winning_team}</span>
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
      <h2 className="mb-3 text-[13px] font-bold tracking-wide text-[#A2A6AB] uppercase">{title}</h2>
      {count > 0 ? (
        <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">{children}</div>
      ) : (
        <p className="rounded-[17px] bg-[#141412] px-4 py-6 text-center text-[13px] text-[#A2A6AB]">{emptyMessage}</p>
      )}
    </section>
  );
}

export default function Tournaments() {
  const navigate = useNavigate();
  const { data: tournamentsData } = useGetTournamentsQuery({
    all: true,
    organizer_tournaments: true,
  });
  const { data: myRequests = [] } = useGetMyTournamentRequestsQuery();

  /**
   * Show pending + rejected requests so the player can track their request status.
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

  return (
    <div className="bg-black">
      <AppSubpageHeader title="My Tournaments" />
      <Container>
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
          {isEmpty && (
            <div className="rounded-[17px] bg-[#141412] px-4 py-8 text-center">
              <p className="text-[14px] text-[#A2A6AB]">You have no tournaments yet.</p>
              <button
                type="button"
                onClick={() => navigate('/tournament-request')}
                className="mt-4 rounded-[6px] bg-[#DA9811] px-6 py-2.5 text-[14px] font-bold text-black transition-opacity active:opacity-90"
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
