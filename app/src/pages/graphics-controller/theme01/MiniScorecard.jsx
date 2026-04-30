const CLOUDFRONT_APP_BASE = 'https://d1nmw2vhka3zp0.cloudfront.net/app';

const controllerFrameBg = `${CLOUDFRONT_APP_BASE}/images/background/controller-frame.png`;
const teamLogo = `${CLOUDFRONT_APP_BASE}/images/standard/team-logo.png`;

const frameStyle = {
  backgroundImage: `url(${controllerFrameBg})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};

export default function MiniScorecard() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1D1E22]">
      <section
        className="absolute right-0 bottom-0 left-0 h-[80px] overflow-hidden text-white sm:h-[96px]"
        style={frameStyle}
      >
        <div className="absolute inset-0 bg-black/55" />
        <div className="pointer-events-none absolute -top-8 left-1/3 h-24 w-24 rounded-full" />
        <div className="pointer-events-none absolute bottom-0 right-12 h-20 w-20 rounded-full" />

        <div className="relative z-10 flex h-full items-center justify-center gap-6 sm:gap-8 px-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <img
              src={teamLogo}
              alt="Team logo"
              className="h-12 w-12 shrink-0 rounded-full object-cover sm:h-18 sm:w-18"
            />

            <div className="min-w-0">
              <p className="text-[20px] leading-none font-extrabold text-[#DA9811] uppercase sm:text-[30px]">
                SC
              </p>
              <p className="mt-0.5 text-[12px] leading-none font-medium text-white sm:mt-2 sm:text-[14px]">
                14.4 Over
              </p>
            </div>
          </div>

          <p className="text-[20px] leading-none font-extrabold text-white sm:text-[28px]">196-7</p>
        </div>
      </section>
    </div>
  );
}
