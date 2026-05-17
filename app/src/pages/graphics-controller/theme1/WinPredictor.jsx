import { rightHalfStyle, ScoreboardLeft, separatorStyle } from './ScoreboardHeader';

export default function WinPredictor({
  battingTeam = {},
  bowlingTeam = {},
  batters = [],
  bowler: _bowler = {},
  currentOverBalls: _currentOverBalls = [],
  winProbHome = null,
  winProbAway = null,
}) {
  const homeName = battingTeam.shortCode || battingTeam.name || '—';
  const awayName = bowlingTeam.shortCode || bowlingTeam.name || '—';
  const hasPrediction =
    winProbHome != null && winProbAway != null && Number.isFinite(winProbHome) && Number.isFinite(winProbAway);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1D1E22]">
      <section className="absolute right-0 bottom-0 left-0 overflow-hidden text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={rightHalfStyle} />
          <div className="absolute inset-y-0 left-0 w-1/2" style={{ ...rightHalfStyle, filter: 'grayscale(1)' }} />
        </div>

        <div className="relative z-10 mx-auto flex w-full items-stretch px-1.5 py-1 sm:px-6 sm:py-3">
          <ScoreboardLeft battingTeam={battingTeam} batters={batters} />

          <div className="ml-auto flex items-center">
            <div className="px-2 text-center sm:px-14">
              <p className="text-[8px] leading-none font-semibold text-[#E8E8E8] uppercase sm:text-[18px]">WIN</p>
              <p className="mt-0.5 text-[8px] leading-none font-semibold text-[#E8E8E8] uppercase sm:mt-1 sm:text-[18px]">
                PREDICTION
              </p>
            </div>
            <div className="mx-1 w-px self-stretch sm:mx-3" style={separatorStyle} />

            <div className="px-2 text-center sm:px-14">
              <p className="text-[8px] leading-none font-semibold text-[#E8E8E8] uppercase sm:text-[20px]">{homeName}</p>
              <p className="mt-0.5 text-[12px] leading-none font-extrabold text-white sm:mt-1 sm:text-[28px]">
                {hasPrediction ? `${winProbHome}%` : '—'}
              </p>
            </div>
            <div className="mx-1 w-px self-stretch sm:mx-3" style={separatorStyle} />

            <div className="px-2 text-center sm:px-14">
              <p className="text-[8px] leading-none font-semibold text-[#E8E8E8] uppercase sm:text-[20px]">{awayName}</p>
              <p className="mt-0.5 text-[12px] leading-none font-extrabold text-white sm:mt-1 sm:text-[28px]">
                {hasPrediction ? `${winProbAway}%` : '—'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
