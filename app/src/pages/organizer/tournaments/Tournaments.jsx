import { Children, useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import { formatDateRange } from '@/lib/format';
import { getTournamentTitle } from '@/lib/utils/tournamentUtils';
import { useGetTournamentsQuery } from '@/store/api/tournamentApi';
import { Container } from '@/ui/Container';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=200&h=200&fit=crop';

function TournamentCard({ tournament, showWinningTeam = false, onClick }) {
  const imageUrl =
    tournament.display_image || tournament.cover_image || PLACEHOLDER_IMAGE;
  const dates = formatDateRange(tournament.start_date, tournament.end_date);
  const location = [tournament.city, tournament.country]
    .filter(Boolean)
    .join(', ');
  const venue =
    [tournament.venue_name, location].filter(Boolean).join(', ') || '—';

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
          alt={`${getTournamentTitle(tournament)} cover`}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-[13px] font-bold text-white">
          {getTournamentTitle(tournament)}
        </h3>
        {tournament.tournament_type_label && (
          <p className="mt-0.5 text-[13px] font-bold text-white">
            {tournament.tournament_type_label}
          </p>
        )}
        <ul className="mt-1.5 space-y-0.5 text-xs">
          <li>
            <span className="text-[#A2A6AB]">Dates:</span>{' '}
            <span className="text-white">{dates}</span>
          </li>
          <li>
            <span className="text-[#A2A6AB]">Format:</span>{' '}
            <span className="text-white">
              {tournament.number_of_groups == null ||
              tournament.number_of_groups <= 1
                ? 'Single Table'
                : `Groups: ${tournament.number_of_groups}`}
            </span>
          </li>
          <li>
            <span className="text-[#A2A6AB]">Venue:</span>{' '}
            <span className="text-white">{venue}</span>
          </li>
          <li>
            <span className="text-[#A2A6AB]">Teams:</span>{' '}
            <span className="text-white">
              {tournament.number_of_teams ?? '—'}
            </span>
          </li>
          {tournament.prize != null && tournament.prize !== '' && (
            <li>
              <span className="text-[#A2A6AB]">Prize:</span>{' '}
              <span className="text-white">{tournament.prize}</span>
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

/**
 * Section — titled list wrapper with an empty-state message.
 * CURSOR: move to src/ui/Section.jsx → export { Section }
 *
 * Fixed: was counting children with a manual Array.isArray check which
 * mishandled single-element children.  Now uses React.Children.count.
 */
function Section({ title, children, emptyMessage = 'No tournaments' }) {
  const count = Children.count(children);
  return (
    <section>
      <h2 className="mb-3 text-[13px] font-bold tracking-wide text-[#A2A6AB] uppercase">
        {title}
      </h2>
      {count > 0 ? (
        <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-3">
          {children}
        </div>
      ) : (
        <p className="rounded-[17px] bg-[#141412] px-4 py-6 text-center text-[13px] text-[#A2A6AB]">
          {emptyMessage}
        </p>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function Tournaments() {
  const navigate = useNavigate();
  const { data } = useGetTournamentsQuery({ all: true });

  const { scheduled, previous } = useMemo(() => {
    const list = data?.data ?? [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const scheduled = [];
    const previous = [];

    list.forEach((t) => {
      // Append T12:00:00 for date-only strings to avoid UTC-midnight rollover in timezones west of UTC. Skip if end_date already contains 'T'.
      const endStr = t.end_date?.includes?.('T')
        ? t.end_date
        : t.end_date
          ? t.end_date + 'T12:00:00'
          : null;
      const endDate = endStr ? new Date(endStr) : null;
      if (endDate && endDate < today) {
        previous.push(t);
      } else {
        scheduled.push(t);
      }
    });

    return { scheduled, previous };
  }, [data?.data]);

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------

  const handleTournamentClick = (tournament) => {
    const payload = {
      ...tournament,
      name: getTournamentTitle(tournament),
    };
    const state = { tournament: payload };
    const teamsCount = tournament.teams_count ?? 0;
    const requiredTeams = tournament.number_of_teams ?? 0;
    const teamsComplete = requiredTeams > 0 && teamsCount >= requiredTeams;
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

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <div className="bg-black">
      <Container className="!px-4 !py-0">
        <header className="-mx-4 -mt-6 lg:mt-0 flex items-center gap-3 bg-black px-4 pt-6 pb-6">
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
            My Tournaments
          </h1>
        </header>

        <div className="space-y-6 pb-6">
          <Section
            title="Scheduled Tournaments"
            emptyMessage="No scheduled tournaments."
          >
            {scheduled.map((t) => (
              <TournamentCard
                key={t.id}
                tournament={t}
                onClick={handleTournamentClick}
              />
            ))}
          </Section>

          <Section
            title="Previous Tournaments"
            emptyMessage="No previous tournaments."
          >
            {previous.map((t) => (
              <TournamentCard
                key={t.id}
                tournament={t}
                showWinningTeam
                onClick={handleTournamentClick}
              />
            ))}
          </Section>
        </div>
      </Container>
    </div>
  );
}
