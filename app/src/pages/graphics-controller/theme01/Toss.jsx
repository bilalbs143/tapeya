const CLOUDFRONT_APP_BASE = 'https://d1nmw2vhka3zp0.cloudfront.net/app';

const controllerFrameBg = `${CLOUDFRONT_APP_BASE}/images/background/controller-frame.png`;
const teamLogo = `${CLOUDFRONT_APP_BASE}/images/standard/team-logo.png`;

const panelStyle = {
  backgroundImage: `url(${controllerFrameBg})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};
export default function Toss() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1D1E22]">
      <section className="absolute right-0 bottom-0 left-0 text-white">
        <div
          className="relative w-full overflow-hidden px-4 py-2 sm:px-10 sm:py-4"
          style={panelStyle}
        >
          <div className="flex items-center justify-between gap-2">
            <img
              src={teamLogo}
              alt="Left team logo"
              className="h-14 w-14 rounded-full object-cover sm:h-24 sm:w-24"
            />

            <div className="flex flex-1 flex-col items-center px-1 sm:px-8">
              <div className="flex w-full items-center justify-center gap-2 sm:gap-10">
                <p className="text-[8px] leading-none font-extrabold text-[#DA9811] sm:text-[28px]">
                  Karachi Kings
                </p>
                <p className="text-[8px] leading-none font-extrabold text-white uppercase sm:text-[30px]">
                  VS
                </p>
                <p className="text-[8px] leading-none font-extrabold text-[#DA9811] sm:text-[28px]">
                  Pishawar Zalmi
                </p>
              </div>

              <p className="mt-2 text-center text-[8px] leading-none text-white sm:mt-3 sm:text-[20px]">
                Karachi Won The Toss And Elected To Bat First
              </p>
            </div>

            <img
              src={teamLogo}
              alt="Right team logo"
              className="h-14 w-14 rounded-full object-cover sm:h-24 sm:w-24"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
