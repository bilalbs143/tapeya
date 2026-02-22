import { MatchCard } from '@/components/scorecard/MatchCard';

export function ScheduleTab({ matches }) {
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
    <div className="mt-4 space-y-3 pb-6 focus:outline-none">
      {matches.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          showScheduleTableLinks={false}
        />
      ))}
    </div>
  );
}
