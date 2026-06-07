import { Fragment, useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import { TeamLogo } from '@/components/TeamLogo';
import { formatDate } from '@/lib/format';
import { normaliseMatchStatus } from '@/lib/utils/scorecardUtils';
import { isValidTournamentId } from '@/lib/utils/tournamentUtils';
import { useGetTournamentMatchesQuery } from '@/store/api/tournamentApi';
import { Button } from '@/ui/Button';

const STATUS_LABELS = { upcoming: 'Upcoming', live: 'Live', result: 'Result' };

export function FixturesTab({
  tournamentId,
  numberOfGroups,
  canManageTournament = false,
  preloadedMatches,
  isLoadingMatches = false,
}) {
  const navigate = useNavigate();

  const hasValidId = isValidTournamentId(tournamentId);
  const nGroups = numberOfGroups != null ? Number(numberOfGroups) : 1;
  const hasGroups = nGroups > 1;
  const hasEmbeddedMatches = Array.isArray(preloadedMatches);

  const {
    data: fetchedMatches = [],
    isLoading: isFetchingMatches,
    isError,
  } = useGetTournamentMatchesQuery({ tournamentId, all: true }, { skip: !hasValidId || hasEmbeddedMatches || isLoadingMatches });

  const matches = hasEmbeddedMatches ? preloadedMatches : fetchedMatches;
  const isLoading = isLoadingMatches || (!hasEmbeddedMatches && isFetchingMatches);

  const { matchesByGroup, knockoutMatches } = useMemo(() => {
    if (!hasGroups || !matches.length) {
      return { matchesByGroup: null, knockoutMatches: [] };
    }
    /** @type {Record<number, typeof matches>} */
    const byGroup = {};
    for (let i = 1; i <= nGroups; i++) {
      byGroup[i] = matches.filter((m) => Number(m.group_index) === i);
    }
    const ko = matches.filter(
      (m) => m.group_index == null || m.group_index === '' || Number(m.group_index) < 1 || Number(m.group_index) > nGroups,
    );
    return { matchesByGroup: byGroup, knockoutMatches: ko };
  }, [hasGroups, nGroups, matches]);

  const wrap = (children) => <div className="mt-4 pb-6">{children}</div>;

  // ------------------------------------------------------------------
  // Early-return states
  // ------------------------------------------------------------------

  if (!hasValidId) {
    return wrap(
      <p className="py-4 text-center text-[13px] text-[#A2A6AB]">Fixtures are not available for this sample tournament.</p>,
    );
  }

  if (isLoading) {
    return wrap(<p className="py-4 text-center text-[13px] text-[#A2A6AB]">Loading fixtures…</p>);
  }

  if (isError) {
    return wrap(<p className="py-4 text-center text-[13px] text-red-400">Failed to load fixtures.</p>);
  }

  if (!matches.length) {
    return wrap(
      <div className="py-8 text-center">
        <p className="text-[13px] text-[#A2A6AB]">No upcoming fixtures scheduled yet.</p>
      </div>,
    );
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  const renderFixtureCard = (match, { showGroupChip = true } = {}) => {
    const home = match.home_team ?? match.homeTeam ?? { name: 'Home team' };
    const away = match.away_team ?? match.awayTeam ?? { name: 'Away team' };
    const status = normaliseMatchStatus(match.status || 'scheduled');
    const dateLabel = match.match_date ? formatDate(match.match_date) : '';
    const timePart = match.match_time ? ` · ${match.match_time}` : '';
    const venue = match.venue_name ?? '';

    return (
      <div className="rounded-[17px] bg-[#141412] p-4 text-white">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-[#DA9811] uppercase">{STATUS_LABELS[status] ?? 'Upcoming'}</span>
            {showGroupChip &&
              (match.group_index != null ? (
                <span className="rounded bg-[#1A1A1A] px-2 py-0.5 text-[11px] font-medium text-[#A2A6AB]">
                  Group {match.group_index}
                </span>
              ) : hasGroups ? (
                <span className="rounded bg-[#1A1A1A] px-2 py-0.5 text-[11px] font-medium text-[#A2A6AB]">Knockout</span>
              ) : null)}
          </div>
          <span className="text-[12px] text-[#A2A6AB]">
            {dateLabel}
            {timePart}
          </span>
        </div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <TeamLogo team={home} variant="fixture" />
            <p className="truncate text-[14px] font-semibold">{home.name}</p>
          </div>
          <span className="shrink-0 text-[14px] font-semibold text-[#DA9811]">VS</span>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
            <TeamLogo team={away} variant="fixture" />
            <p className="truncate text-[14px] font-semibold">{away.name}</p>
          </div>
        </div>
        {venue && (
          <p className="text-[12px] text-[#A2A6AB]">
            Venue: <span className="text-white">{venue}</span>
          </p>
        )}
        {canManageTournament && match.id != null && (
          <div className="mt-3 flex justify-end border-t border-white/10 pt-3">
            <Button
              type="button"
              variant="orange"
              size="sm"
              className="min-w-[132px] px-4 py-2 text-[12px] font-bold tracking-wide uppercase"
              onClick={() => navigate(`/organizer/scoring/match/${match.id}`)}
            >
              {status === 'live' ? 'Continue scoring' : status === 'result' ? 'View fixture' : 'Start match'}
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-4 space-y-3 pb-6">
      {hasGroups && matchesByGroup != null ? (
        <div className="space-y-6">
          {Array.from({ length: nGroups }, (_, i) => i + 1).map((groupIndex) => {
            const groupMatches = matchesByGroup[groupIndex] ?? [];
            return (
              <section key={groupIndex}>
                <h3 className="mb-2 text-[13px] font-bold tracking-wide text-[#DA9811] uppercase">Group {groupIndex}</h3>
                {groupMatches.length === 0 ? (
                  <p className="rounded-[17px] bg-[#141412] px-4 py-4 text-center text-[13px] text-[#A2A6AB]">
                    No fixtures in this group yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {groupMatches.map((m) => (
                      <Fragment key={m.id}>{renderFixtureCard(m, { showGroupChip: false })}</Fragment>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
          {knockoutMatches.length > 0 && (
            <section>
              <h3 className="mb-2 text-[13px] font-bold tracking-wide text-[#DA9811] uppercase">Knockout</h3>
              <div className="space-y-3">
                {knockoutMatches.map((m) => (
                  <Fragment key={m.id}>{renderFixtureCard(m, { showGroupChip: false })}</Fragment>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <Fragment key={match.id}>{renderFixtureCard(match)}</Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
