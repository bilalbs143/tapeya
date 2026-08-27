import { Link } from 'react-router-dom';

import { LiveEventCard } from '@/components/live/LiveEventCard';
import { liveBroadcastPath } from '@/lib/utils/liveStreamUtils';
import { ListEmpty } from '@/ui/ListState';

/**
 * "Starting Soon" tab — streams in the `starting` state.
 */
export function UpcomingTab({ streams = [] }) {
  if (streams.length === 0) {
    return <ListEmpty title="No Streams Starting Soon." />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 pb-6 lg:grid-cols-3">
      {streams.map((item) => (
        <Link
          key={item.streamId}
          to={liveBroadcastPath(item.streamId)}
          className="block h-full transition-opacity active:opacity-90"
        >
          <LiveEventCard image={item.thumbnail_url} title={item.title} line2={item.subtitle} line3="Starting Soon…" />
        </Link>
      ))}
    </div>
  );
}
