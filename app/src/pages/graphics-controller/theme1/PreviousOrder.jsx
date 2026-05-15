import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

import {
  ScoreboardLeft,
  rightHalfStyle,
  separatorStyle,
  batterSeparatorStyle,
} from './ScoreboardHeader';

const defaultTeamLogo = `${CLOUDFRONT_APP_BASE}/images/standard/team-logo.png`;

export default function PreviousOrder({
  battingTeam = {},
  bowlingTeam = {},
  batters = [],
  bowler = {},
  currentOverBalls = [],
  lastOverRuns = 0,
}) {
  const bowlingLogo = bowlingTeam.logoUrl ?? defaultTeamLogo;
  const bowlingName = bowlingTeam.shortCode || bowlingTeam.name || '';

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1D1E22]">
      <section className="absolute right-0 bottom-0 left-0 overflow-hidden text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={rightHalfStyle} />
          <div
            className="absolute inset-y-0 left-0 w-1/2"
            style={{ ...rightHalfStyle, filter: 'grayscale(1)' }}
          />
        </div>

        <div className="relative z-10 mx-auto flex w-full items-stretch px-1.5 py-1 sm:px-6 sm:py-3">
          <ScoreboardLeft battingTeam={battingTeam} batters={batters} />

          <div className="ml-auto flex items-stretch">
            <div className="flex items-center pr-4 text-center sm:pr-20">
              <p className="text-[11px] leading-none font-extrabold text-white uppercase sm:text-[24px]">
                {bowlingName}
              </p>
            </div>

            <div className="flex items-center pr-1 sm:pr-10">
              <img
                src={bowlingLogo}
                alt={bowlingTeam.name || 'Bowling team'}
                className="h-8 w-8 rounded-full object-cover sm:h-14 sm:w-14"
              />
            </div>
            <div className="mx-1 w-px self-stretch sm:mx-3" style={separatorStyle} />

            <div className="flex items-center pl-1 sm:pl-4">
              <div>
                <div className="flex items-end justify-between gap-3 sm:gap-6">
                  <p className="text-[8px] leading-none font-medium text-[#E8E8E8] sm:text-[14px]">
                    {bowler.name}
                  </p>
                  <div className="mb-0.5 flex items-baseline gap-2 sm:gap-4">
                    <p className="text-[8px] leading-none font-medium text-[#E8E8E8] sm:text-[18px]">
                      {bowler.figures}
                    </p>
                    <p className="text-[8px] leading-none font-medium text-[#E8E8E8] sm:text-[14px]">
                      {bowler.overs}
                    </p>
                  </div>
                </div>
                <div
                  className="mt-2 h-px w-full min-w-[76px] sm:min-w-[220px]"
                  style={batterSeparatorStyle}
                />
                {lastOverRuns != null ? (
                  <p className="mt-2 text-[8px] leading-none font-medium text-white sm:mt-2 sm:text-[16px]">
                    Last Over {lastOverRuns} Runs
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
