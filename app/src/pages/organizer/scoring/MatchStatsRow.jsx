/**
 * Match stats row – EXTRAS | OVERS | CRR | PARTNERSHIP.
 * Shared by Scoring tab and Partnership tab.
 */
export function MatchStatsRow({
  extras = 0,
  oversDisplay = '0',
  maxOvers,
  crr = '0.0',
  partnershipRuns = 0,
  partnershipBalls = 0,
}) {
  return (
    <div className="mt-4 flex">
      <div className="flex flex-1 flex-col items-center justify-center px-3 py-2.5">
        <p className="text-[12px] font-bold tracking-wide text-[#A2A6AB] uppercase">
          Extras
        </p>
        <p className="mt-0.5 text-[14px] font-bold text-white">{extras}</p>
      </div>
      <div
        className="w-px shrink-0 self-stretch bg-gradient-to-b from-[#00000000] via-[#FFFFFF66] to-[#00000000]"
        aria-hidden
      />
      <div className="flex flex-1 flex-col items-center justify-center px-3 py-2.5">
        <p className="text-[12px] font-bold tracking-wide text-[#A2A6AB] uppercase">
          Overs
        </p>
        <p className="mt-0.5 text-[14px] font-bold text-white">
          <span className="text-[#DA9811]">
            {oversDisplay} / {maxOvers ?? ''}
          </span>
        </p>
      </div>
      <div
        className="w-px shrink-0 self-stretch bg-gradient-to-b from-[#00000000] via-[#FFFFFF66] to-[#00000000]"
        aria-hidden
      />
      <div className="flex flex-1 flex-col items-center justify-center px-3 py-2.5">
        <p className="text-[12px] font-bold tracking-wide text-[#A2A6AB] uppercase">
          CRR
        </p>
        <p className="mt-0.5 text-[14px] font-bold text-white">{crr}</p>
      </div>
      <div
        className="w-px shrink-0 self-stretch bg-gradient-to-b from-[#00000000] via-[#FFFFFF66] to-[#00000000]"
        aria-hidden
      />
      <div className="flex flex-1 flex-col items-center justify-center px-3 py-2.5">
        <p className="text-[12px] font-bold tracking-wide text-[#A2A6AB] uppercase">
          Partnership
        </p>
        <p className="mt-0.5 text-[14px] font-bold text-white">
          {partnershipRuns}({partnershipBalls})
        </p>
      </div>
    </div>
  );
}
