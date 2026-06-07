import { useEffect } from 'react';

import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

import { graphicDebugLog } from '../graphicDebugLog';

const controllerFrameBg = `${CLOUDFRONT_APP_BASE}/images/background/controller-frame.png`;
const defaultTeamLogo = `${CLOUDFRONT_APP_BASE}/images/standard/team-logo.png`;

const panelStyle = {
  backgroundImage: `url(${controllerFrameBg})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};

export default function ResultIntro({
  homeTeam = {},
  awayTeam = {},
  resultLine = '',
  /** 'home' | 'away' | null — from graphic context when match is decided */
  winningTeam = null,
}) {
  const homeLogo = homeTeam.logoUrl ?? defaultTeamLogo;
  const awayLogo = awayTeam.logoUrl ?? defaultTeamLogo;
  const homeName = homeTeam.name || 'Home';
  const awayName = awayTeam.name || 'Away';
  const hasResult = Boolean(resultLine && String(resultLine).trim());
  const homeDim = winningTeam === 'away';
  const awayDim = winningTeam === 'home';

  useEffect(() => {
    graphicDebugLog('ResultIntro.props', {
      hasResult,
      resultLine,
      winningTeam,
      homeName,
      awayName,
    });
  }, [hasResult, resultLine, winningTeam, homeName, awayName]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-page">
      <section className="absolute right-0 bottom-0 left-0 text-white">
        <div className="relative w-full overflow-hidden px-4 py-2 sm:px-10 sm:py-4" style={panelStyle}>
          <div className="flex flex-col gap-2 sm:gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className={`flex min-w-0 flex-1 items-center gap-2 sm:gap-4 ${homeDim ? 'opacity-45' : ''}`}>
                <img src={homeLogo} alt={homeName} className="h-14 w-14 shrink-0 rounded-full object-cover sm:h-18 sm:w-18" />
                <p className="min-w-0 truncate text-[12px] leading-tight font-extrabold text-brand sm:text-[24px]">
                  {homeName}
                </p>
              </div>

              <div className="max-w-[46%] shrink-0 px-1 text-center sm:max-w-[42%] sm:px-2">
                {hasResult ? (
                  <p className="text-[9px] leading-tight font-bold text-white sm:text-[16px]">{resultLine}</p>
                ) : (
                  <p className="text-[12px] leading-none font-extrabold text-white uppercase sm:text-[30px]">VS</p>
                )}
              </div>

              <div className={`flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-4 ${awayDim ? 'opacity-45' : ''}`}>
                <p className="min-w-0 truncate text-right text-[12px] leading-tight font-extrabold text-brand sm:text-[24px]">
                  {awayName}
                </p>
                <img src={awayLogo} alt={awayName} className="h-14 w-14 shrink-0 rounded-full object-cover sm:h-18 sm:w-18" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
