import { CONTENT_MAX_WIDTH } from '@/lib/constants/profile';

const LABEL_CLASS = 'text-[14px] font-bold uppercase tracking-wide text-muted';
const VALUE_CLASS = 'text-sm font-normal text-white';

const STATS = [
  { label: 'TEAMS SPONSORED', value: '5' },
  { label: 'ACTIVE PARTNERSHIPS', value: '3' },
  { label: 'TOTAL REACH', value: '12,000' },
  { label: 'EVENTS SUPPORTED', value: '18' },
  { label: 'CAMPAIGNS', value: '4' },
  { label: 'SINCE', value: '2023' },
];

function StatItem({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className={LABEL_CLASS}>{label}:</span>
      <span className={VALUE_CLASS}>{value}</span>
    </div>
  );
}

export function SponsorStats() {
  return (
    <div className={`mx-auto w-full ${CONTENT_MAX_WIDTH} py-6`}>
      <h2 className="text-[12px] font-bold tracking-wide text-white uppercase">SPONSOR STATS</h2>
      <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-5 md:grid-cols-3">
        {STATS.map(({ label, value }) => (
          <StatItem key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  );
}
