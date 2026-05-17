import { rightHalfStyle, ScoreboardLeft, separatorStyle } from './ScoreboardHeader';

export default function RunRate({
  battingTeam = {},
  bowlingTeam = {},
  batters = [],
  target = null,
  currentRR = '',
  requiredRR = '',
}) {
  const bowlingName = bowlingTeam.shortCode || bowlingTeam.name || '';
  const targetLabel = target != null ? String(target) : '';

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1D1E22]">
      <section className="absolute right-0 bottom-0 left-0 overflow-hidden text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={rightHalfStyle} />
          <div className="absolute inset-y-0 left-0 w-1/2" style={{ ...rightHalfStyle, filter: 'grayscale(1)' }} />
        </div>

        <div className="relative z-10 mx-auto flex w-full items-stretch px-1.5 py-1 sm:px-6 sm:py-3">
          <ScoreboardLeft battingTeam={battingTeam} batters={batters} />

          <div className="mx-1 w-px self-stretch sm:mx-3" style={separatorStyle} />

          {/* Mobile target badge */}
          {targetLabel ? (
            <div className="flex items-center px-1 sm:hidden">
              <div className="rounded-[5px] bg-[#DA9811] px-1.5 py-0.5 text-center leading-none font-extrabold text-black uppercase shadow-[0_0_0_1px_rgba(255,255,255,0.25)]">
                <p className="text-[6px] font-bold">Target</p>
                <p className="mt-0.5 text-[9px] font-bold">{targetLabel}</p>
              </div>
            </div>
          ) : null}

          {/* Desktop target badge */}
          {targetLabel ? (
            <div className="pointer-events-none absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 sm:block">
              <div className="rounded-[10px] bg-[#DA9811] px-4 py-2 text-center leading-none font-extrabold text-black uppercase shadow-[0_0_0_1px_rgba(255,255,255,0.25)]">
                <p className="text-[14px] font-bold">Target</p>
                <p className="mt-0.5 text-[19px] font-bold">{targetLabel}</p>
              </div>
            </div>
          ) : null}

          <div className="ml-auto flex items-center">
            <div className="px-1 sm:px-4">
              <p className="text-[6px] leading-none font-bold text-white uppercase sm:text-[20px]">Current</p>
              <div className="mt-1 flex items-baseline justify-center gap-1 sm:mt-3 sm:gap-4">
                <p className="text-[9px] leading-none font-extrabold text-white sm:text-[24px]">{currentRR}</p>
              </div>
            </div>
            <div className="mx-1 w-px self-stretch sm:mx-3" style={separatorStyle} />

            <div className="px-1 sm:px-4">
              <p className="text-[6px] leading-none font-bold text-white uppercase sm:text-[20px]">Required</p>
              <div className="mt-1 flex items-baseline justify-center gap-1 sm:mt-3 sm:gap-4">
                <p className="text-[9px] leading-none font-extrabold text-white sm:text-[24px]">{requiredRR}</p>
              </div>
            </div>
            <div className="mx-1 w-px self-stretch sm:mx-3" style={separatorStyle} />

            <div className="px-1 sm:px-4">
              <p className="text-[9px] leading-none font-extrabold text-white uppercase sm:text-[20px]">
                {bowlingName ? `v ${bowlingName}` : ''}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
