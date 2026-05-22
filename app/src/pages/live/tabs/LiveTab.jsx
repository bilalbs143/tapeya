import { Link } from 'react-router-dom';

import { LiveEventCard } from '@/components/live/LiveEventCard';

export function LiveTab({ events = [] }) {
  if (events.length === 0) {
    return <p className="py-6 text-center text-[13px] text-[#A2A6AB]">No live broadcasts right now.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 pb-6 lg:grid-cols-3">
      {events.map((event) => (
        <Link key={event.id} to={`/live/broadcast/${event.id}`} className="block h-full transition-opacity active:opacity-90">
          <LiveEventCard
            image={event.image}
            title={event.title}
            line2={event.tournament}
            line3={event.venue}
            isLive
          />
        </Link>
      ))}
    </div>
  );
}
