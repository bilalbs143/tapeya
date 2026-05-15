import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

import {
  controllerFrameImageUrl,
  statsDefaultBatterSeparatorStyle,
  statsDefaultVerticalSeparatorStyle,
} from './playerGraphicTheme';
import {
  ballChipClass,
  BatterNameLabel,
  FreeHitMicroBadge,
} from './ScoreboardHeader';

const defaultTeamLogo = `${CLOUDFRONT_APP_BASE}/images/standard/team-logo.png`;

const rightHalfStyle = {
  backgroundImage: `url(${controllerFrameImageUrl})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};

const separatorStyle = statsDefaultVerticalSeparatorStyle;
const batterSeparatorStyle = statsDefaultBatterSeparatorStyle;

export default function StatsDefault({
  battingTeam = {},
  bowlingTeam = {},
  batters = [],
  bowler = {},
  currentOverBalls = [],
}) {
  const battingLogo = battingTeam.logoUrl ?? defaultTeamLogo;
  const bowlingLogo = bowlingTeam.logoUrl ?? defaultTeamLogo;
  const batter0 = batters[0] ?? {
    name: '',
    runs: 0,
    balls: 0,
    onStrike: false,
  };
  const batter1 = batters[1] ?? {
    name: '',
    runs: 0,
    balls: 0,
    onStrike: false,
  };

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

        <div className="relative z-10 mx-auto flex w-full items-stretch px-1 py-0.5 sm:px-6 sm:py-3">
          <div className="flex items-center gap-1 pr-1 sm:gap-3 sm:pr-5">
            <img
              src={battingLogo}
              alt={battingTeam.name || 'Batting team'}
              className="h-7 w-7 rounded-full object-cover sm:h-14 sm:w-14"
            />
            <div>
              <p className="text-[10px] leading-none font-extrabold text-[#DA9811] sm:text-[30px]">
                {battingTeam.shortCode || battingTeam.name || '—'}
              </p>
              <p className="mt-0.5 text-[7px] leading-none whitespace-nowrap text-[#E2E2E2] sm:mt-1 sm:text-[14px]">
                {battingTeam.overs ? `${battingTeam.overs} OVER` : ''}
              </p>
            </div>
            <p className="ml-1 text-[10px] leading-none font-extrabold text-white sm:ml-6 sm:text-[28px]">
              {battingTeam.score || ''}
            </p>
          </div>
          <div
            className="mx-0.5 w-px self-stretch sm:mx-3"
            style={separatorStyle}
          />

          <div className="flex items-center px-0.5 sm:hidden">
            <div>
              <div className="flex items-center gap-0.5 leading-none">
                <span className="w-[34px] text-[7px] font-medium text-[#E8E8E8]">
                  <BatterNameLabel
                    name={batter0.name}
                    onStrike={!!(batter0.onStrike ?? batter0.on_strike)}
                    className="w-full text-[7px] font-medium text-[#E8E8E8]"
                  />
                </span>
                <span className="text-[7px] font-bold text-[#DA9811]">
                  {batter0.runs}
                </span>
                <span className="text-[6px] font-bold text-[#DA9811]">
                  {batter0.balls}
                </span>
              </div>
              <div
                className="my-0.5 h-px w-[34px]"
                style={batterSeparatorStyle}
              />
              <div className="flex items-center gap-0.5 leading-none">
                <span className="w-[34px] text-[7px] font-medium text-[#E8E8E8]">
                  <BatterNameLabel
                    name={batter1.name}
                    onStrike={!!(batter1.onStrike ?? batter1.on_strike)}
                    className="w-full text-[7px] font-medium text-[#E8E8E8]"
                  />
                </span>
                <span className="text-[7px] font-bold text-[#DA9811]">
                  {batter1.runs}
                </span>
                <span className="text-[6px] font-bold text-[#DA9811]">
                  {batter1.balls}
                </span>
              </div>
            </div>
          </div>

          <div
            className="mx-0.5 w-px self-stretch sm:hidden"
            style={separatorStyle}
          />

          <div className="hidden items-center px-3 sm:flex sm:px-6">
            <div>
              <div className="flex items-center gap-3 leading-none">
                <span className="w-[72px] text-[14px] font-medium text-[#E8E8E8]">
                  <BatterNameLabel
                    name={batter0.name}
                    onStrike={!!(batter0.onStrike ?? batter0.on_strike)}
                    className="w-full text-[14px] font-medium text-[#E8E8E8]"
                  />
                </span>
                <span className="text-[24px] font-bold text-[#DA9811]">
                  {batter0.runs}
                </span>
                <span className="text-[16px] font-bold text-[#DA9811]">
                  {batter0.balls}
                </span>
              </div>

              <div
                className="my-1 h-px w-[72px]"
                style={batterSeparatorStyle}
              />

              <div className="flex items-center gap-3 leading-none">
                <span className="w-[72px] text-[14px] font-medium text-[#E8E8E8]">
                  <BatterNameLabel
                    name={batter1.name}
                    onStrike={!!(batter1.onStrike ?? batter1.on_strike)}
                    className="w-full text-[14px] font-medium text-[#E8E8E8]"
                  />
                </span>
                <span className="text-[24px] font-bold text-[#DA9811]">
                  {batter1.runs}
                </span>
                <span className="text-[16px] font-bold text-[#DA9811]">
                  {batter1.balls}
                </span>
              </div>
            </div>
          </div>

          <div className="ml-auto flex items-stretch">
            <div className="flex items-center gap-1 px-1 text-center sm:gap-4 sm:px-10">
              <p className="text-[10px] leading-none font-extrabold lowercase sm:text-[20px]">
                v
              </p>
              <p className="text-[10px] leading-none font-extrabold uppercase sm:text-[24px]">
                {bowlingTeam.shortCode || bowlingTeam.name || ''}
              </p>
            </div>

            <div className="flex items-center px-0.5 sm:px-3">
              <img
                src={bowlingLogo}
                alt={bowlingTeam.name || 'Bowling team'}
                className="h-7 w-7 rounded-full object-cover sm:h-14 sm:w-14"
              />
            </div>
            <div
              className="mx-0.5 w-px self-stretch sm:mx-3"
              style={separatorStyle}
            />

            <div className="flex items-center pl-0.5 sm:pl-6">
              <div>
                <div className="mb-0.5 flex items-end justify-between gap-2 font-medium sm:mb-2 sm:gap-6">
                  <div>
                    <p className="text-[7px] leading-none text-[#E8E8E8] sm:text-[14px]">
                      {bowler.name}
                    </p>
                    <div
                      className="mt-0.5 h-px w-[28px] sm:mt-2 sm:w-[72px]"
                      style={batterSeparatorStyle}
                    />
                  </div>
                  <div className="mb-1 flex items-baseline gap-1 sm:gap-4">
                    <p className="text-[7px] leading-none text-[#E8E8E8] sm:text-[18px]">
                      {bowler.figures}
                    </p>
                    <p className="text-[7px] leading-none text-[#E8E8E8] sm:text-[14px]">
                      {bowler.overs}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-0.5 sm:gap-1">
                  {currentOverBalls.map((ball, index) => {
                    const isFreeHit = typeof ball === 'string' && ball.endsWith('*');
                    const displayLabel = isFreeHit ? ball.slice(0, -1) : ball;
                    return (
                      <div key={index} className="relative shrink-0">
                        <span
                          className={`inline-flex items-center justify-center rounded-full leading-none font-bold h-[14px] min-w-[14px] px-[3px] text-[8px] sm:h-[24px] sm:min-w-[24px] sm:px-[5px] sm:text-[12px] ${ballChipClass(ball)}`}
                        >
                          {displayLabel}
                        </span>
                        {isFreeHit ? <FreeHitMicroBadge /> : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
