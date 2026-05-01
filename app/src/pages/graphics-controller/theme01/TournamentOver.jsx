import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

const controllerFrameBg = `${CLOUDFRONT_APP_BASE}/images/background/controller-frame.png`;
const teamLogo = `${CLOUDFRONT_APP_BASE}/images/standard/team-logo.png`;

const panelStyle = {
  backgroundImage: `url(${controllerFrameBg})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};
const separatorStyle = {
  background: 'linear-gradient(180deg, #080807 0%, #FFFFFF 50%, #080807 100%)',
};
export default function TournamentOver() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1D1E22]">
      <section className="absolute right-0 bottom-0 left-0 text-white">
        <div
          className="relative w-full overflow-hidden px-4 py-2 sm:px-10 sm:py-4"
          style={panelStyle}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <img
                src={teamLogo}
                alt="Left team logo"
                className="h-14 w-14 rounded-full object-cover sm:h-18 sm:w-18"
              />
              <p className="text-[12px] leading-none font-extrabold text-[#DA9811] sm:text-[24px]">
                Karachi
                <br />
                Kings
              </p>
            </div>

            <div className="mx-2 flex items-center sm:mx-6">
              <div className="text-center">
                <p className="text-[12px] leading-none font-extrabold text-white sm:text-[30px]">
                  196-7
                </p>
                <p className="mt-1 text-[10px] leading-none text-white sm:text-[18px]">
                  14.4 Over
                </p>
              </div>
              <div
                className="mx-2 h-12 w-px sm:mx-5 sm:h-16"
                style={separatorStyle}
              />
              <div className="text-center">
                <p className="text-[12px] leading-none font-extrabold text-white sm:text-[30px]">
                  326-4
                </p>
                <p className="mt-1 text-[10px] leading-none text-white sm:text-[18px]">
                  20.0 Over
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <p className="text-right text-[12px] leading-none font-extrabold text-[#DA9811] sm:text-[24px]">
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
        </div>
      </section>
    </div>
  );
}
