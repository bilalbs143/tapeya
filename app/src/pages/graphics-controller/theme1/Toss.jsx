import { useEffect } from 'react';

import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

import { graphicLogger } from '../graphicDebugLog';

const controllerFrameBg = `${CLOUDFRONT_APP_BASE}/images/background/controller-frame.png`;
const defaultTeamLogo = `${CLOUDFRONT_APP_BASE}/images/standard/team-logo.png`;

const panelStyle = {
  backgroundImage: `url(${controllerFrameBg})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};

export default function Toss({ homeTeam = {}, awayTeam = {}, decision = '' }) {
  const homeLogo = homeTeam.logoUrl ?? defaultTeamLogo;
  const awayLogo = awayTeam.logoUrl ?? defaultTeamLogo;
  const homeName = homeTeam.name || 'Home';
  const awayName = awayTeam.name || 'Away';

  useEffect(() => {
    graphicLogger('info', 'Toss.props', {
      homeName,
      awayName,
      decision: decision ?? '',
      decisionLength: decision != null ? String(decision).length : 0,
    });
  }, [homeName, awayName, decision]);

  return (
    <div className="bg-page relative min-h-screen overflow-hidden">
      <section className="absolute right-0 bottom-0 left-0 text-white">
        <div className="relative w-full overflow-hidden px-4 py-2 sm:px-10 sm:py-4" style={panelStyle}>
          <div className="flex items-center justify-between gap-2">
            <img src={homeLogo} alt={homeName} className="h-14 w-14 rounded-full object-cover sm:h-24 sm:w-24" />

            <div className="flex flex-1 flex-col items-center px-1 sm:px-8">
              <div className="flex w-full items-center justify-center gap-2 sm:gap-10">
                <p className="text-brand text-[8px] leading-none font-extrabold sm:text-[28px]">{homeName}</p>
                <p className="text-[8px] leading-none font-extrabold text-white uppercase sm:text-[30px]">VS</p>
                <p className="text-brand text-[8px] leading-none font-extrabold sm:text-[28px]">{awayName}</p>
              </div>

              {decision ? (
                <p className="mt-2 text-center text-[8px] leading-none text-white sm:mt-3 sm:text-[20px]">{decision}</p>
              ) : null}
            </div>

            <img src={awayLogo} alt={awayName} className="h-14 w-14 rounded-full object-cover sm:h-24 sm:w-24" />
          </div>
        </div>
      </section>
    </div>
  );
}
