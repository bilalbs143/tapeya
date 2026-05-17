import { CONTENT_MAX_WIDTH } from './constants';

const CARD_CLASS = 'rounded-[17px] bg-[#141412] px-4 py-4 text-center';

export function ProfileMetrics({ metrics }) {
  return (
    <div className={`mx-auto w-full ${CONTENT_MAX_WIDTH} py-4`}>
      <div className="grid grid-cols-3 gap-3">
        {metrics.map(({ value, label }) => (
          <div key={label} className={CARD_CLASS}>
            <div className="text-[16px] font-bold text-white">{value}</div>
            <div className="mt-1 text-[12px] font-bold tracking-wide text-[#A2A6AB] uppercase">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
