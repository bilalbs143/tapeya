import { Link } from 'react-router-dom';

import { LiveEventCard } from '@/components/live/LiveEventCard';
import { liveBroadcastPath } from '@/lib/utils/liveStreamUtils';

/**
 * "Starting Soon" tab — matches whose stream is in the `starting` state.
 * Still navigable so the user can enter the player and wait.
 */
export function UpcomingTab({ matches = [] }) {
  if (matches.length === 0) {
    return <p className="text-muted py-6 text-center text-[13px]">No streams starting soon.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 pb-6 lg:grid-cols-3">
      {matches.map((match) => (
        <Link key={match.id} to={liveBroadcastPath(match.id)} className="block h-full transition-opacity active:opacity-90">
          <LiveEventCard image={match.thumbnail_url} title={match.matchId} line2={match.tournament_name} line3="Starting soon…" />
        </Link>
      ))}
    </div>
  );
}
