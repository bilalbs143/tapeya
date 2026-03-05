/**
 * Match stats row – EXTRAS | OVERS | CRR | PARTNERSHIP.
 * Shared by Scoring tab and Partnership tab.
 */
export function MatchStatsRow({
  extras = 0,
  oversDisplay = '0',
  maxOvers = 20,
  crr = '0.0',
  partnershipRuns = 0,
  partnershipBalls = 0,
}) {
  return (
    <div className="flex mt-4">
      <div className="flex flex-1 flex-col items-center justify-center px-3 py-2.5">
        <p className="text-[12px] font-bold uppercase tracking-wide text-[#A2A6AB]">
          Extras
        </p>
        <p className="mt-0.5 text-[14px] font-bold text-white">{extras}</p>
      </div>
      <div
        className="w-px shrink-0 self-stretch bg-gradient-to-b from-[#00000000] via-[#FFFFFF66] to-[#00000000]"
        aria-hidden
      />
      <div className="flex flex-1 flex-col items-center justify-center px-3 py-2.5">
        <p className="text-[12px] font-bold uppercase tracking-wide text-[#A2A6AB]">
          Overs
        </p>
        <p className="mt-0.5 text-[14px] font-bold text-white">
          <span className="text-[#DA9811]">{oversDisplay} / {maxOvers}</span>
        </p>
      </div>
      <div
        className="w-px shrink-0 self-stretch bg-gradient-to-b from-[#00000000] via-[#FFFFFF66] to-[#00000000]"
        aria-hidden
      />
      <div className="flex flex-1 flex-col items-center justify-center px-3 py-2.5">
        <p className="text-[12px] font-bold uppercase tracking-wide text-[#A2A6AB]">
          CRR
        </p>
        <p className="mt-0.5 text-[14px] font-bold text-white">{crr}</p>
      </div>
      <div
        className="w-px shrink-0 self-stretch bg-gradient-to-b from-[#00000000] via-[#FFFFFF66] to-[#00000000]"
        aria-hidden
      />
      <div className="flex flex-1 flex-col items-center justify-center px-3 py-2.5">
        <p className="text-[12px] font-bold uppercase tracking-wide text-[#A2A6AB]">
          Partnership
        </p>
        <p className="mt-0.5 text-[14px] font-bold text-white">
          {partnershipRuns}({partnershipBalls})
        </p>
      </div>
    </div>
  );
}
