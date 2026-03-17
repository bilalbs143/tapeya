import { formatDate } from '@/lib/format';
import { normaliseMatchStatus } from '@/lib/utils/scorecardUtils';
import { isValidTournamentId } from '@/lib/utils/tournamentUtils';
import { useGetTournamentMatchesQuery } from '@/store/api/tournamentApi';

const STATUS_LABELS = { upcoming: 'Upcoming', live: 'Live', result: 'Result' };

export function FixturesTab({ tournamentId }) {
  const hasValidId = isValidTournamentId(tournamentId);

  const {
    data: matches = [],
    isLoading,
    isError,
  } = useGetTournamentMatchesQuery(
    { tournamentId, all: true },
    { skip: !hasValidId },
  );

  const wrap = (children) => <div className="mt-4 pb-6">{children}</div>;

  // ------------------------------------------------------------------
  // Early-return states
  // ------------------------------------------------------------------

  if (!hasValidId) {
    return wrap(
      <p className="py-4 text-center text-[13px] text-[#A2A6AB]">
        Fixtures are not available for this sample tournament.
      </p>,
    );
  }

  if (isLoading) {
    return wrap(
      <p className="py-4 text-center text-[13px] text-[#A2A6AB]">
        Loading fixtures…
      </p>,
    );
  }

  if (isError) {
    return wrap(
      <p className="py-4 text-center text-[13px] text-red-400">
        Failed to load fixtures.
      </p>,
    );
  }

  if (!matches.length) {
    return wrap(
      <p className="py-8 text-center text-[13px] text-[#A2A6AB]">
        No upcoming fixtures scheduled yet.
      </p>,
    );
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <div className="mt-4 space-y-3 pb-6">
      {matches.map((match) => {
        const home = match.home_team ?? match.homeTeam ?? { name: 'Home team' };
        const away = match.away_team ?? match.awayTeam ?? { name: 'Away team' };
        const status = normaliseMatchStatus(match.status || 'scheduled');
        const dateLabel = match.match_date ? formatDate(match.match_date) : '';
        const timePart = match.match_time ? ` · ${match.match_time}` : '';
        const venue = match.venue_name ?? '';

        return (
          <div
            key={match.id}
            className="rounded-[17px] bg-[#141412] p-4 text-white"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-[12px] font-bold text-[#DA9811] uppercase">
                {STATUS_LABELS[status] ?? 'Upcoming'}
              </span>
              <span className="text-[12px] text-[#A2A6AB]">
                {dateLabel}
                {timePart}
              </span>
            </div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold">
                  {home.name}
                </p>
              </div>
              <span className="shrink-0 text-[14px] font-semibold text-[#DA9811]">
                VS
              </span>
              <div className="min-w-0 flex-1 text-right">
                <p className="truncate text-[14px] font-semibold">
                  {away.name}
                </p>
              </div>
            </div>
            {venue && (
              <p className="text-[12px] text-[#A2A6AB]">
                Venue: <span className="text-white">{venue}</span>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
