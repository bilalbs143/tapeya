import { Link } from 'react-router-dom';

import { LiveEventCard } from '@/components/live/LiveEventCard';
import { liveBroadcastPath } from '@/lib/utils/liveStreamUtils';

export function LiveTab({ matches = [] }) {
  if (matches.length === 0) {
    return <p className="py-6 text-center text-[13px] text-[#A2A6AB]">No live broadcasts right now.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 pb-6 lg:grid-cols-3">
      {matches.map((match) => (
        <Link key={match.id} to={liveBroadcastPath(match.id)} className="block h-full transition-opacity active:opacity-90">
          <LiveEventCard image={match.thumbnail_url} title={match.matchId} line2={match.tournament_name} isLive />
        </Link>
      ))}
    </div>
  );
}
