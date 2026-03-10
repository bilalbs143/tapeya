import { useGetTournamentMatchesQuery } from '@/store/api/tournamentApi';

export function FixturesTab({ tournamentId }) {
  const hasValidId =
    tournamentId != null &&
    String(tournamentId).trim() !== '' &&
    !String(tournamentId).startsWith('placeholder-');

  const {
    data: matches = [],
    isLoading,
    isError,
  } = useGetTournamentMatchesQuery(
    { tournamentId },
    {
      skip: !hasValidId,
    },
  );

  if (!hasValidId) {
    return (
      <div className="mt-4 pb-6">
        <p className="py-4 text-center text-[13px] text-[#A2A6AB]">
          Fixtures are not available for this sample tournament.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-4 pb-6">
        <p className="py-4 text-center text-[13px] text-[#A2A6AB]">
          Loading fixtures…
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-4 pb-6">
        <p className="py-4 text-center text-[13px] text-red-400">
          Failed to load fixtures.
        </p>
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div className="mt-4 pb-6">
        <p className="py-8 text-center text-[13px] text-[#A2A6AB]">
          No upcoming fixtures scheduled yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3 pb-6">
      {matches.map((match) => {
        const home = match.home_team ?? match.homeTeam ?? { name: 'Home team' };
        const away = match.away_team ?? match.awayTeam ?? { name: 'Away team' };
        const date = match.match_date ?? '';
        const time = match.match_time ?? '';
        const venue = match.venue_name ?? '';

        return (
          <div
            key={match.id}
            className="rounded-[17px] bg-[#141412] p-4 text-white"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-[12px] font-bold text-[#DA9811] uppercase">
                Upcoming
              </span>
              <span className="text-[12px] text-[#A2A6AB]">
                {date}
                {time ? ` · ${time}` : ''}
              </span>
            </div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold">
                  {home.name ?? 'Home team'}
                </p>
              </div>
              <span className="shrink-0 text-[14px] font-semibold text-[#DA9811]">
                VS
              </span>
              <div className="min-w-0 flex-1 text-right">
                <p className="truncate text-[14px] font-semibold">
                  {away.name ?? 'Away team'}
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
