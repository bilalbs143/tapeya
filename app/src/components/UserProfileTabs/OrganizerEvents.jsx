import { useState } from 'react';

const LABEL_CLASS = 'text-[14px] font-bold uppercase tracking-wide text-muted';
const VALUE_CLASS = 'text-sm font-normal text-white';

const EVENTS_FULL = ['Summer League 2025', 'Winter Cup 2024', 'Community Trophy', 'Regional Championship', 'Youth League Finals'];
const EVENTS_PREVIEW_COUNT = 3;

const SUMMARY = [
  { label: 'TOURNAMENTS', value: '12' },
  { label: 'EVENTS', value: '28' },
  { label: 'TEAMS MANAGED', value: '45' },
];

function StatItemInline({ label, value }) {
  return (
    <span className="inline">
      <span className={LABEL_CLASS}>{label}: </span>
      <span className={VALUE_CLASS}>{value}</span>
    </span>
  );
}

export function OrganizerEvents() {
  const [expanded, setExpanded] = useState(false);

  const eventsToShow = expanded ? EVENTS_FULL : EVENTS_FULL.slice(0, EVENTS_PREVIEW_COUNT);
  const hasMore = EVENTS_FULL.length > EVENTS_PREVIEW_COUNT;
  const showMore = hasMore && !expanded;
  const showLess = hasMore && expanded;

  return (
    <div className="py-6">
      <div className="flex flex-wrap items-baseline gap-x-8">
        {SUMMARY.map(({ label, value }) => (
          <StatItemInline key={label} label={label} value={value} />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-1">
        <span className={LABEL_CLASS}>UPCOMING / PAST EVENTS:</span>
        <span className="text-sm font-normal text-white/70">
          {eventsToShow.join(', ')}
          {showMore ? '...' : ''}
        </span>
        {showMore && (
          <button
            type="button"
            className="text-sm font-normal text-[#D8A11E] underline underline-offset-2 transition-colors hover:text-[#E5B42A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D8A11E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F0F0F]"
            onClick={() => setExpanded(true)}
          >
            MORE
          </button>
        )}
        {showLess && (
          <button
            type="button"
            className="ml-1 text-sm font-normal text-[#D8A11E] underline underline-offset-2 transition-colors hover:text-[#E5B42A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D8A11E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F0F0F]"
            onClick={() => setExpanded(false)}
          >
            LESS
          </button>
        )}
      </div>

      <div className="mt-5 h-px w-full bg-[linear-gradient(to_right,#00000000,#FFFFFF33,#00000000)]" />

      <h2 className="mt-6 text-[12px] font-bold tracking-wide text-white uppercase">EVENT MANAGEMENT</h2>
      <p className="mt-4 text-sm text-white/70">Create and manage tournaments, fixtures, and registrations from here.</p>
    </div>
  );
}
