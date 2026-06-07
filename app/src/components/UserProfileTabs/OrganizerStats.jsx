import { CONTENT_MAX_WIDTH } from './constants';

const LABEL_CLASS = 'text-[14px] font-bold uppercase tracking-wide text-muted';
const VALUE_CLASS = 'text-sm font-normal text-white';

const STATS = [
  { label: 'TOTAL TOURNAMENTS', value: '12' },
  { label: 'TOTAL EVENTS', value: '28' },
  { label: 'PARTICIPANTS', value: '1,240' },
  { label: 'TEAMS MANAGED', value: '45' },
  { label: 'MATCHES SCHEDULED', value: '312' },
  { label: 'COMPLETED', value: '298' },
];

function StatItem({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className={LABEL_CLASS}>{label}:</span>
      <span className={VALUE_CLASS}>{value}</span>
    </div>
  );
}

export function OrganizerStats() {
  return (
    <div className={`mx-auto w-full ${CONTENT_MAX_WIDTH} py-6`}>
      <h2 className="text-[12px] font-bold tracking-wide text-white uppercase">ORGANIZER STATS</h2>
      <div className="mt-4 grid grid-cols-3 gap-x-8 gap-y-5">
        {STATS.map(({ label, value }) => (
          <StatItem key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  );
}
