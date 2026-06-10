import { BowlerBlock, rightHalfStyle, ScoreboardLeft, separatorStyle } from './ScoreboardHeader';

export default function TargetNeeded({
  battingTeam = {},
  batters = [],
  bowler = {},
  currentOverBalls = [],
  runsToWin = 0,
  ballsRemaining = 0,
}) {
  return (
    <div className="bg-page relative min-h-screen overflow-hidden">
      <section className="absolute right-0 bottom-0 left-0 overflow-hidden text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={rightHalfStyle} />
          <div className="absolute inset-y-0 left-0 w-1/2" style={{ ...rightHalfStyle, filter: 'grayscale(1)' }} />
        </div>

        <div className="relative z-10 mx-auto flex w-full items-stretch px-1.5 py-1 sm:px-6 sm:py-3">
          <ScoreboardLeft battingTeam={battingTeam} batters={batters} />

          <div className="mx-1 w-px self-stretch sm:hidden" style={separatorStyle} />

          <div className="ml-auto flex items-stretch">
            <div className="flex items-center px-1 text-center sm:px-7">
              <div>
                <p className="text-[8px] leading-none font-bold uppercase sm:text-[20px]">To Win</p>
                <p className="mt-0.5 text-[11px] leading-none font-extrabold sm:mt-2 sm:text-[24px]">{runsToWin}</p>
              </div>
            </div>
            <div className="mx-1 w-px self-stretch sm:mx-3" style={separatorStyle} />

            <div className="flex items-center px-1 text-center sm:px-7">
              <div>
                <p className="text-[8px] leading-none font-bold uppercase sm:text-[20px]">Balls</p>
                <p className="mt-0.5 text-[11px] leading-none font-extrabold sm:mt-2 sm:text-[24px]">{ballsRemaining}</p>
              </div>
            </div>
            <div className="mx-1 w-px self-stretch sm:mx-3" style={separatorStyle} />

            <BowlerBlock bowler={bowler} currentOverBalls={currentOverBalls} />
          </div>
        </div>
      </section>
    </div>
  );
}
