import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

const controllerFrameBg = `${CLOUDFRONT_APP_BASE}/images/background/controller-frame.png`;
const defaultTeamLogo = `${CLOUDFRONT_APP_BASE}/images/standard/team-logo.png`;

const panelStyle = {
  backgroundImage: `url(${controllerFrameBg})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};

export default function TournamentIntro({ homeTeam = {}, awayTeam = {}, matchLabel = '' }) {
  const homeLogo = homeTeam.logoUrl ?? defaultTeamLogo;
  const awayLogo = awayTeam.logoUrl ?? defaultTeamLogo;
  const homeName = homeTeam.name || 'Home';
  const awayName = awayTeam.name || 'Away';

  return (
    <div className="relative min-h-screen overflow-hidden bg-page">
      <section className="absolute right-0 bottom-0 left-0 text-white">
        <div className="relative w-full overflow-hidden px-4 py-2 sm:px-10 sm:py-4" style={panelStyle}>
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                <img src={homeLogo} alt={homeName} className="h-14 w-14 rounded-full object-cover sm:h-18 sm:w-18" />
                <p className="text-[8px] leading-none font-extrabold text-brand sm:text-[24px]">{homeName}</p>
              </div>

              <p className="text-[8px] leading-none font-extrabold text-white uppercase sm:text-[30px]">VS</p>

              <div className="flex items-center gap-2 sm:gap-4">
                <p className="text-right text-[8px] leading-none font-extrabold text-brand sm:text-[24px]">{awayName}</p>
                <img src={awayLogo} alt={awayName} className="h-14 w-14 rounded-full object-cover sm:h-18 sm:w-18" />
              </div>
            </div>

            {matchLabel ? <p className="text-center text-[8px] leading-none text-white sm:text-[18px]">{matchLabel}</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
