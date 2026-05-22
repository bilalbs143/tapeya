import { LiveEventCard } from '@/components/live/LiveEventCard';

export function UpcomingTab({ events = [] }) {
  if (events.length === 0) {
    return <p className="py-6 text-center text-[13px] text-[#A2A6AB]">No upcoming broadcasts scheduled.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 pb-6 lg:grid-cols-3">
      {events.map((event) => (
        <LiveEventCard
          key={event.id}
          image={event.image}
          title={event.title}
          line2={event.tournament}
          line3={event.scheduledAt}
        />
      ))}
    </div>
  );
}
