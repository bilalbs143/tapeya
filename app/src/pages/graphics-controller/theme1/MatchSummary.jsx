import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

import { rightHalfStyle } from './ScoreboardHeader';

const defaultTeamLogo = `${CLOUDFRONT_APP_BASE}/images/standard/team-logo.png`;

export default function MatchSummary({ battingTeam = {}, bowlingTeam = {} }) {
  const battingLogo = battingTeam.logoUrl ?? defaultTeamLogo;
  const bowlingLogo = bowlingTeam.logoUrl ?? defaultTeamLogo;
  const battingCode = battingTeam.shortCode || battingTeam.name || '—';
  const bowlingCode = bowlingTeam.shortCode || bowlingTeam.name || '—';

  return (
    <div className="relative min-h-screen overflow-hidden bg-page">
      <section className="absolute right-0 bottom-0 left-0 overflow-hidden text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={rightHalfStyle} />
          <div className="absolute inset-y-0 left-0 w-1/2" style={{ ...rightHalfStyle, filter: 'grayscale(1)' }} />
        </div>
        <div className="relative z-10 mx-auto grid w-full max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center gap-1 px-2 py-1.5 sm:gap-6 sm:px-6 sm:py-3">
          <div className="flex items-center gap-1.5 sm:gap-3">
            <img
              src={battingLogo}
              alt={battingTeam.name || 'Batting team'}
              className="h-9 w-9 rounded-full object-cover sm:h-14 sm:w-14"
            />
            <span className="text-[12px] leading-none font-extrabold text-brand sm:text-[30px]">{battingCode}</span>
            <div className="ml-1 sm:ml-8">
              <p className="text-[12px] leading-none font-extrabold text-white sm:text-[28px]">{battingTeam.score || ''}</p>
              {battingTeam.overs ? (
                <p className="mt-0.5 text-[9px] leading-none text-[#E2E2E2] sm:mt-1 sm:text-[14px]">{battingTeam.overs} Over</p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="rounded-[8px] border border-white bg-[#E3A100] px-3 py-1 text-center uppercase sm:rounded-[10px] sm:px-10 sm:py-2.5">
              <p className="text-[8px] leading-none font-bold tracking-[0.03em] text-black sm:text-[14px]">Match</p>
              <p className="mt-0.5 text-[11px] leading-none font-bold tracking-[0.02em] text-black sm:mt-1 sm:text-[19px]">
                Summary
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-1.5 sm:gap-3">
            <div className="mr-1 text-right sm:mr-8">
              <p className="text-[12px] leading-none font-extrabold text-white sm:text-[28px]">{bowlingTeam.score || ''}</p>
              {bowlingTeam.overs ? (
                <p className="mt-0.5 text-[9px] leading-none text-[#E2E2E2] sm:mt-1 sm:text-[14px]">{bowlingTeam.overs} Over</p>
              ) : null}
            </div>
            <span className="text-[12px] leading-none font-extrabold text-brand sm:text-[30px]">{bowlingCode}</span>
            <img
              src={bowlingLogo}
              alt={bowlingTeam.name || 'Bowling team'}
              className="h-9 w-9 rounded-full object-cover sm:h-14 sm:w-14"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
