const CLOUDFRONT_APP_BASE = 'https://d1nmw2vhka3zp0.cloudfront.net/app';

const teamLogo = `${CLOUDFRONT_APP_BASE}/images/standard/team-logo.png`;
const controllerFrameBg = `${CLOUDFRONT_APP_BASE}/images/background/controller-frame.png`;

const rightHalfStyle = {
  backgroundImage: `url(${controllerFrameBg})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};

const separatorStyle = {
  background: 'linear-gradient(180deg, #080807 0%, #FFFFFF 50%, #080807 100%)',
};

export default function LastBalls() {
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

        <div className="relative z-10 mx-auto flex w-full items-stretch px-1.5 py-1 sm:px-6 sm:py-3">
          <div className="flex items-center gap-1 pr-1.5 sm:gap-3 sm:pr-5">
            <img
              src={teamLogo}
              alt="Batting team logo"
              className="h-8 w-8 rounded-full object-cover sm:h-14 sm:w-14"
            />
            <div>
              <p className="text-[11px] leading-none font-extrabold text-[#DA9811] sm:text-[30px]">
                SC
              </p>
              <p className="mt-0.5 text-[8px] leading-none text-[#E2E2E2] sm:mt-1 sm:text-[14px]">
                14.4 OVER
              </p>
            </div>
            <p className="ml-1 text-[11px] leading-none font-extrabold text-white sm:ml-6 sm:text-[28px]">
              196-7
            </p>
          </div>
          <div className="mx-1 w-px self-stretch sm:mx-3" style={separatorStyle} />

          <div className="px-2 text-center sm:px-10">
            <p className="text-[8px] leading-none font-extrabold text-[#DA9811] sm:text-[28px]">
              Last
            </p>
            <p className="mt-0.5 text-[8px] leading-none font-extrabold text-[#DA9811] sm:mt-1 sm:text-[28px]">
              30 Balls
            </p>
          </div>

          <div className="ml-auto flex items-center">
            <div className="px-2 text-center sm:px-6">
              <p className="text-[8px] leading-none font-bold text-white uppercase sm:text-[20px]">DOTS</p>
              <p className="mt-0.5 text-[10px] leading-none font-extrabold text-white sm:mt-1 sm:text-[20px]">366</p>
            </div>
            <div className="mx-1 w-px self-stretch sm:mx-3" style={separatorStyle} />

            <div className="px-2 text-center sm:px-6">
              <p className="text-[8px] leading-none font-bold text-white uppercase sm:text-[20px]">FOURS</p>
              <p className="mt-0.5 text-[10px] leading-none font-extrabold text-white sm:mt-1 sm:text-[20px]">366</p>
            </div>
            <div className="mx-1 w-px self-stretch sm:mx-3" style={separatorStyle} />

            <div className="px-2 text-center sm:px-6">
              <p className="text-[8px] leading-none font-bold text-white sm:text-[20px]">Sixes</p>
              <p className="mt-0.5 text-[10px] leading-none font-extrabold text-white sm:mt-1 sm:text-[20px]">05</p>
            </div>
            <div className="mx-1 w-px self-stretch sm:mx-3" style={separatorStyle} />

            <div className="px-2 text-center sm:px-6">
              <p className="text-[8px] leading-none font-bold text-white sm:text-[20px]">Wickets</p>
              <p className="mt-0.5 text-[10px] leading-none font-extrabold text-white sm:mt-1 sm:text-[20px]">0</p>
            </div>
            <div className="mx-1 w-px self-stretch sm:mx-3" style={separatorStyle} />

            <div className="px-2 text-center sm:px-6">
              <p className="text-[8px] leading-none font-bold text-white uppercase sm:text-[20px]">RUNS</p>
              <p className="mt-0.5 text-[10px] leading-none font-extrabold text-white sm:mt-1 sm:text-[20px]">50</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
