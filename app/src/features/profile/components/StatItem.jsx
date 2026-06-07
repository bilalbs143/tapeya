import { formatNum } from '@/lib/utils/displayUtils';

const LABEL_CLASS = 'text-[14px] font-bold uppercase tracking-wide text-muted';
const VALUE_CLASS = 'text-sm font-normal text-white';

export function StatItem({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className={LABEL_CLASS}>{label}:</span>
      <span className={VALUE_CLASS}>{formatNum(value)}</span>
    </div>
  );
}

export function StatItemInline({ label, value }) {
  return (
    <span className="inline">
      <span className={LABEL_CLASS}>{label}: </span>
      <span className={VALUE_CLASS}>{formatNum(value)}</span>
    </span>
  );
}
