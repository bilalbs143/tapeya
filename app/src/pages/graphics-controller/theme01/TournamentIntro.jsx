import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

const controllerFrameBg = `${CLOUDFRONT_APP_BASE}/images/background/controller-frame.png`;
const teamLogo = `${CLOUDFRONT_APP_BASE}/images/standard/team-logo.png`;

const panelStyle = {
  backgroundImage: `url(${controllerFrameBg})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};
export default function TournamentIntro() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1D1E22]">
      <section className="absolute right-0 bottom-0 left-0 text-white">
        <div
          className="relative w-full overflow-hidden px-4 py-2 sm:px-10 sm:py-4"
          style={panelStyle}
        >
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                <img
                  src={teamLogo}
                  alt="Left team logo"
                  className="h-14 w-14 rounded-full object-cover sm:h-18 sm:w-18"
                />
                <p className="text-[8px] leading-none font-extrabold text-[#DA9811] sm:text-[24px]">
                  Karachi
                  <br />
                  Kings
                </p>
              </div>

              <p className="text-[8px] leading-none font-extrabold text-white uppercase sm:text-[30px]">
                VS
              </p>

              <div className="flex items-center gap-2 sm:gap-4">
                <p className="text-right text-[8px] leading-none font-extrabold text-[#DA9811] sm:text-[24px]">
                  Pishawar
                  <br />
                  Zalmi
                </p>
                <img
                  src={teamLogo}
                  alt="Right team logo"
                  className="h-14 w-14 rounded-full object-cover sm:h-18 sm:w-18"
                />
              </div>
            </div>

            <p className="text-center text-[8px] leading-none text-white sm:text-[18px]">
              At League Matches (Match 7)
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
