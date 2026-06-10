import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

const controllerFrameBg = `${CLOUDFRONT_APP_BASE}/images/background/controller-frame.png`;
const defaultTeamLogo = `${CLOUDFRONT_APP_BASE}/images/standard/team-logo.png`;

const panelStyle = {
  backgroundImage: `url(${controllerFrameBg})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};
const separatorStyle = {
  background: 'linear-gradient(180deg, #080807 0%, #FFFFFF 50%, #080807 100%)',
};

export default function TournamentOver({ homeTeam = {}, awayTeam = {} }) {
  const homeLogo = homeTeam.logoUrl ?? defaultTeamLogo;
  const awayLogo = awayTeam.logoUrl ?? defaultTeamLogo;
  const homeName = homeTeam.name || 'Home';
  const awayName = awayTeam.name || 'Away';
  const homeScore = homeTeam.score || '';
  const homeOvers = homeTeam.overs || '';
  const awayScore = awayTeam.score || '';
  const awayOvers = awayTeam.overs || '';

  return (
    <div className="bg-page relative min-h-screen overflow-hidden">
      <section className="absolute right-0 bottom-0 left-0 text-white">
        <div className="relative w-full overflow-hidden px-4 py-2 sm:px-10 sm:py-4" style={panelStyle}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <img src={homeLogo} alt={homeName} className="h-14 w-14 rounded-full object-cover sm:h-18 sm:w-18" />
              <p className="text-brand text-[12px] leading-none font-extrabold sm:text-[24px]">{homeName}</p>
            </div>

            <div className="mx-2 flex items-center sm:mx-6">
              {homeScore ? (
                <div className="text-center">
                  <p className="text-[12px] leading-none font-extrabold text-white sm:text-[30px]">{homeScore}</p>
                  {homeOvers ? <p className="mt-1 text-[10px] leading-none text-white sm:text-[18px]">{homeOvers} Over</p> : null}
                </div>
              ) : null}
              {homeScore && awayScore ? <div className="mx-2 h-12 w-px sm:mx-5 sm:h-16" style={separatorStyle} /> : null}
              {awayScore ? (
                <div className="text-center">
                  <p className="text-[12px] leading-none font-extrabold text-white sm:text-[30px]">{awayScore}</p>
                  {awayOvers ? <p className="mt-1 text-[10px] leading-none text-white sm:text-[18px]">{awayOvers} Over</p> : null}
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <p className="text-brand text-right text-[12px] leading-none font-extrabold sm:text-[24px]">{awayName}</p>
              <img src={awayLogo} alt={awayName} className="h-14 w-14 rounded-full object-cover sm:h-18 sm:w-18" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
