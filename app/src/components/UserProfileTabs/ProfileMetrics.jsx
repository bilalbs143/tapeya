const CARD_CLASS = 'min-w-0 rounded-[17px] bg-surface px-2 py-4 text-center sm:px-4';

export function ProfileMetrics({ metrics }) {
  return (
    <div className="py-4">
      <div className="grid min-w-0 grid-cols-3 gap-3">
        {metrics.map(({ value, label }) => (
          <div key={label} className={CARD_CLASS}>
            <div className="text-[16px] font-bold text-white">{value}</div>
            <div className="text-muted mt-1 text-[11px] leading-tight font-bold tracking-wide break-words uppercase sm:text-[12px]">
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
