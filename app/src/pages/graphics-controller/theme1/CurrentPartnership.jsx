import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

import {
  ScoreboardLeft,
  rightHalfStyle,
  separatorStyle,
} from './ScoreboardHeader';

const defaultTeamLogo = `${CLOUDFRONT_APP_BASE}/images/standard/team-logo.png`;

export default function CurrentPartnership({
  battingTeam = {},
  bowlingTeam = {},
  batters = [],
  bowler = {},
  currentOverBalls = [],
  partnershipRuns = 0,
  partnershipBalls = 0,
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

          <div className="ml-auto flex items-center">
            <div className="px-2 text-left sm:px-8">
              <p className="text-[8px] leading-none font-semibold text-[#E8E8E8] sm:text-[18px]">
                Current
              </p>
              <p className="mt-0.5 text-[8px] leading-none font-semibold text-[#E8E8E8] sm:mt-1 sm:text-[18px]">
                Partnership
              </p>
            </div>
            <div className="flex items-end gap-2 px-1 text-right sm:px-5">
              <p className="text-[15px] leading-none font-extrabold text-white sm:text-[28px]">
                {partnershipRuns}
              </p>
              <p className="mt-0.5 text-[10px] leading-none font-semibold text-[#E8E8E8] sm:text-[20px]">
                {partnershipBalls}
              </p>
            </div>
            <div className="mx-1 w-px self-stretch sm:mx-3" style={separatorStyle} />

            <div className="px-2 sm:px-6">
              <p className="text-[12px] leading-none font-extrabold text-white sm:text-[28px]">
                {bowlingName}
              </p>
            </div>
            <img
              src={bowlingLogo}
              alt={bowlingTeam.name || 'Bowling team'}
              className="h-8 w-8 rounded-full object-cover sm:h-14 sm:w-14"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
