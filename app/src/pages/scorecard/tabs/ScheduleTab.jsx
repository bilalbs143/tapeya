/**
 * ScheduleTab
 *
 * Renders list of MatchCards for schedule. Tab panel for scorecard/upcoming.
 * Coding guidelines: docs/Coding guidelines.md (§14 focus-visible:outline-none)
 */

import { MatchCard } from '@/components/scorecard/MatchCard';

export function ScheduleTab({ matches, tournamentId }) {
  if (!matches?.length) {
    return (
      <div className="mt-4 space-y-3 pb-6">
        <p className="py-8 text-center text-[13px] text-[#A2A6AB]">
          No matches in this tournament
        </p>
      </div>
    );
  }
  return (
    <div className="mt-4 space-y-3 pb-6 focus-visible:outline-none">
      {matches.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          showScheduleTableLinks={false}
          to={
            tournamentId
              ? `/scorecard/${tournamentId}/match/${match.id}`
              : `/scorecard/match/${match.id}`
          }
        />
      ))}
    </div>
  );
}
