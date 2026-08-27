import { Fragment, useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import { TeamLogo } from '@/components/TeamLogo';
import { formatDate } from '@/lib/utils/dateUtils';
import { normaliseMatchStatus } from '@/lib/utils/scorecardUtils';
import { isValidTournamentId } from '@/lib/utils/tournamentUtils';
import { useGetTournamentMatchesQuery } from '@/store/api/tournamentApi';
import { Button } from '@/ui/Button';
import { ListEmpty, ListError } from '@/ui/ListState';
import { LoaderBlock } from '@/ui/Loader';

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
    refetch,
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
    return wrap(<ListEmpty title="Fixtures Unavailable." description="Fixtures are not available for this sample tournament." />);
  }

  if (isLoading) {
    return wrap(<LoaderBlock label="Loading fixtures" className="py-4" />);
  }

  if (isError) {
    return wrap(<ListError message="Could not load fixtures." onRetry={() => refetch()} />);
  }

  if (!matches.length) {
    return wrap(<ListEmpty title="No Fixtures Yet." description="No upcoming fixtures scheduled yet." />);
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
      <div className="bg-surface rounded-[17px] p-4 text-white">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-brand text-[12px] font-bold uppercase">{STATUS_LABELS[status] ?? 'Upcoming'}</span>
            {showGroupChip &&
              (match.group_index != null ? (
                <span className="bg-surface-border text-muted rounded px-2 py-0.5 text-[11px] font-medium">
                  Group {match.group_index}
                </span>
              ) : hasGroups ? (
                <span className="bg-surface-border text-muted rounded px-2 py-0.5 text-[11px] font-medium">Knockout</span>
              ) : null)}
          </div>
          <span className="text-muted text-[12px]">
            {dateLabel}
            {timePart}
          </span>
        </div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <TeamLogo team={home} variant="fixture" />
            <p className="truncate text-[14px] font-semibold">{home.name}</p>
          </div>
          <span className="text-brand shrink-0 text-[14px] font-semibold">VS</span>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
            <TeamLogo team={away} variant="fixture" />
            <p className="truncate text-[14px] font-semibold">{away.name}</p>
          </div>
        </div>
        {venue && (
          <p className="text-muted text-[12px]">
            <span className="text-white">{venue}</span>
          </p>
        )}
        {canManageTournament && match.id != null && (
          <div className="mt-3 flex justify-end border-t border-white/10 pt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => navigate(`/organizer/scoring/match/${match.id}`)}>
              {status === 'live' ? 'Continue Scoring' : status === 'result' ? 'View Fixture' : 'Start Match'}
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
                <h3 className="text-brand mb-2 text-[13px] font-bold tracking-wide uppercase">Group {groupIndex}</h3>
                {groupMatches.length === 0 ? (
                  <ListEmpty title="No Fixtures In This Group Yet." />
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
              <h3 className="text-brand mb-2 text-[13px] font-bold tracking-wide uppercase">Knockout</h3>
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
