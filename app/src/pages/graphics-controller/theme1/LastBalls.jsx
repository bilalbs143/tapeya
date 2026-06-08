import { rightHalfStyle, ScoreboardLeft, separatorStyle } from './ScoreboardHeader';

export default function LastBalls({
  battingTeam = {},
  batters = [],
  ballsLabel = 'Last 30 Balls',
  dots = 0,
  fours = 0,
  sixes = 0,
  wickets = 0,
  runs = 0,
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

          <div className="mx-1 w-px self-stretch sm:mx-3" style={separatorStyle} />

          <div className="px-2 text-center sm:px-10">
            {ballsLabel.split(' ').map((word, i) => (
              <p key={i} className="text-brand text-[8px] leading-none font-extrabold sm:text-[28px]">
                {word}
              </p>
            ))}
          </div>

          <div className="ml-auto flex items-center">
            {[
              { label: 'DOTS', value: dots },
              { label: 'FOURS', value: fours },
              { label: 'Sixes', value: sixes },
              { label: 'Wickets', value: wickets },
              { label: 'RUNS', value: runs },
            ].map(({ label, value }, index) => (
              <div key={label} className="flex items-stretch">
                {index > 0 ? <div className="mx-1 w-px self-stretch sm:mx-3" style={separatorStyle} /> : null}
                <div className="px-2 text-center sm:px-6">
                  <p className="text-[8px] leading-none font-bold text-white uppercase sm:text-[20px]">{label}</p>
                  <p className="mt-0.5 text-[10px] leading-none font-extrabold text-white sm:mt-1 sm:text-[20px]">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
