import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

const controllerFrameBg = `${CLOUDFRONT_APP_BASE}/images/background/controller-frame.png`;
const defaultLogo = `${CLOUDFRONT_APP_BASE}/images/standard/team-logo.png`;

const panelStyle = {
  backgroundImage: `url(${controllerFrameBg})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};

export default function TournamentOverview({
  tournamentName = '',
  tournamentLogoUrl = null,
  matchLabel = '',
}) {
  const logo = tournamentLogoUrl ?? defaultLogo;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1D1E22]">
      <section className="absolute right-0 bottom-0 left-0 text-white">
        <div
          className="relative w-full overflow-hidden px-4 py-2 sm:px-10 sm:py-4"
          style={panelStyle}
        >
          <div className="flex items-center gap-2 sm:gap-6">
            <img
              src={logo}
              alt={tournamentName || 'Tournament'}
              className="h-14 w-14 rounded-full object-cover sm:h-18 sm:w-18"
            />
            <div className="flex-1 text-center">
              <p className="text-[14px] leading-none font-extrabold text-white sm:text-[24px]">
                {tournamentName?.trim() ? tournamentName : 'Tournament'}
              </p>
              {matchLabel ? (
                <p className="mt-1 text-[12px] leading-none text-white sm:mt-2 sm:text-[18px]">
                  {matchLabel}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
