import { AtStageOverChips, rightHalfStyle, ScoreboardAtStageMirror, ScoreboardLeft, separatorStyle } from './ScoreboardHeader';

export default function AtThisStage({
  battingTeam = {},
  batters = [],
  currentOverBalls = [],
  comparisonTeamName = '',
  comparisonScore = '',
  comparisonOvers = '',
  mirrorBattingTeam = null,
  mirrorBatters = [],
  mirrorBowler = {},
  mirrorCurrentOverBalls = [],
  mirrorInningsLabel = '',
}) {
  /** API always sends mirror when `at_stage_mirror` is present — do not require name/code (they can be blank). */
  const useMirror = mirrorBattingTeam != null && typeof mirrorBattingTeam === 'object';

  return (
    <div className="relative min-h-screen overflow-hidden bg-page">
      <section className="absolute right-0 bottom-0 left-0 overflow-hidden text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={rightHalfStyle} />
          <div className="absolute inset-y-0 left-0 w-1/2" style={{ ...rightHalfStyle, filter: 'grayscale(1)' }} />
        </div>

        <div className="relative z-10 mx-auto flex w-full items-stretch px-1.5 py-1 sm:px-6 sm:py-3">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex min-w-0 items-stretch">
              <ScoreboardLeft battingTeam={battingTeam} batters={batters} />
            </div>
            <AtStageOverChips balls={currentOverBalls} align="start" />
          </div>

          <div className="mx-1 w-px self-stretch sm:hidden" style={separatorStyle} />

          {/* Mobile "At This Stage" badge */}
          <div className="relative z-20 flex shrink-0 items-center px-0.5 sm:hidden">
            <div className="rounded-[5px] bg-brand px-1 py-0.5 text-center leading-none font-extrabold text-black uppercase shadow-[0_0_0_1px_rgba(255,255,255,0.25)]">
              <p className="text-[6px] font-bold">At This</p>
              <p className="mt-0.5 text-[9px] font-bold">Stage</p>
            </div>
          </div>

          {/* Desktop "At This Stage" badge */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 sm:block">
            <div className="rounded-[10px] bg-brand px-4 py-2 text-center leading-none font-extrabold text-black uppercase shadow-[0_0_0_1px_rgba(255,255,255,0.25)]">
              <p className="text-[14px] font-bold">At This</p>
              <p className="mt-0.5 text-[19px] font-bold">Stage</p>
            </div>
          </div>

          <div className="ml-auto flex min-w-0 flex-1 justify-end">
            {useMirror ? (
              <ScoreboardAtStageMirror
                battingTeam={mirrorBattingTeam}
                batters={mirrorBatters}
                bowler={mirrorBowler}
                currentOverBalls={mirrorCurrentOverBalls}
                inningsLabel={mirrorInningsLabel}
              />
            ) : (
              <div className="flex max-w-[48%] flex-1 flex-col items-end justify-center px-1 sm:px-4">
                {comparisonTeamName ? (
                  <p className="max-w-full truncate text-right text-[6px] leading-none font-bold text-white uppercase sm:text-[20px]">
                    {comparisonTeamName}
                  </p>
                ) : null}
                <div className="mt-1 flex flex-wrap items-baseline justify-end gap-1 sm:mt-3 sm:gap-4">
                  <p className="text-[9px] leading-none font-extrabold text-white sm:text-[24px]">{comparisonScore}</p>
                  {comparisonOvers ? (
                    <p className="text-[6px] leading-none font-medium text-[#E2E2E2] sm:text-[14px]">{comparisonOvers} Over</p>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
