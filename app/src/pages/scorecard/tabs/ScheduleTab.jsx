/**
 * ScheduleTab — list of MatchCards for a tournament schedule (scorecard / upcoming).
 * With multiple groups, matches are grouped (Group 1, Group 2, …).
 */

import { useMemo } from 'react';

import { MatchCard } from '@/components/scorecard/MatchCard';

function MatchCardList({ matches, tournamentId }) {
  return (
    <div className="space-y-3">
      {matches.map((match) => {
        const tid = tournamentId ?? match.tournament_id;
        const to = tid ? `/scorecard/${tid}/match/${match.id}` : `/scorecard/match/${match.id}`;
        return <MatchCard key={match.id} match={match} showScheduleTableLinks={false} to={to} />;
      })}
    </div>
  );
}

export function ScheduleTab({ matches, tournamentId, tournament }) {
  const numberOfGroups = tournament?.number_of_groups ?? 1;
  const hasGroups = numberOfGroups > 1;

  const matchesByGroup = useMemo(() => {
    if (!hasGroups || !matches?.length) return null;
    const byGroup = /** @type {Record<number, typeof matches>} */ ({});
    for (let i = 1; i <= numberOfGroups; i++) {
      byGroup[i] = matches.filter((m) => Number(m.group_index) === i);
    }
    return byGroup;
  }, [hasGroups, numberOfGroups, matches]);

  const knockoutMatches = useMemo(
    () =>
      hasGroups && matches?.length
        ? matches.filter(
            (m) =>
              m.group_index == null ||
              m.group_index === '' ||
              Number(m.group_index) < 1 ||
              Number(m.group_index) > numberOfGroups,
          )
        : [],
    [hasGroups, matches, numberOfGroups],
  );

  if (!matches?.length) {
    return (
      <div className="mt-4 space-y-3 pb-6">
        <p className="py-8 text-center text-[13px] text-[#A2A6AB]">No matches in this tournament</p>
      </div>
    );
  }

  if (matchesByGroup != null) {
    return (
      <div className="mt-4 space-y-6 pb-6 focus-visible:outline-none">
        {Array.from({ length: numberOfGroups }, (_, i) => i + 1).map((groupIndex) => (
          <section key={groupIndex}>
            <h3 className="mb-2 text-[13px] font-bold tracking-wide text-[#DA9811] uppercase">Group {groupIndex}</h3>
            <MatchCardList matches={matchesByGroup[groupIndex]} tournamentId={tournamentId} />
            {matchesByGroup[groupIndex].length === 0 && (
              <p className="rounded-[17px] bg-[#141412] px-4 py-4 text-center text-[13px] text-[#A2A6AB]">
                No matches in this group
              </p>
            )}
          </section>
        ))}
        {knockoutMatches.length > 0 && (
          <section>
            <h3 className="mb-2 text-[13px] font-bold tracking-wide text-[#DA9811] uppercase">Knockout / Playoff</h3>
            <MatchCardList matches={knockoutMatches} tournamentId={tournamentId} />
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3 pb-6 focus-visible:outline-none">
      <MatchCardList matches={matches} tournamentId={tournamentId} />
    </div>
  );
}
