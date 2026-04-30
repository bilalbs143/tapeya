const CLOUDFRONT_APP_BASE = 'https://d1nmw2vhka3zp0.cloudfront.net/app';

const controllerFrameBg = `${CLOUDFRONT_APP_BASE}/images/background/controller-frame.png`;
const teamLogo = `${CLOUDFRONT_APP_BASE}/images/standard/team-logo.png`;

const frameStyle = {
  backgroundImage: `url(${controllerFrameBg})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};
const separatorStyle = {
  background: 'linear-gradient(180deg, #080807 0%, #FFFFFF 50%, #080807 100%)',
};

export default function TournamentRuns() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1D1E22]">
      <section
        className="absolute right-0 bottom-0 left-0 h-[80px] overflow-hidden text-white sm:h-[96px]"
        style={frameStyle}
      >
        <div className="absolute inset-0 bg-black/55" />
        <div className="pointer-events-none absolute -top-8 left-1/3 h-24 w-24 rounded-full" />
        <div className="pointer-events-none absolute bottom-0 right-12 h-20 w-20 rounded-full" />

        <div className="relative z-10 flex h-full items-center justify-center px-3 sm:px-6 gap-2 sm:gap-4">
          <img
            src={teamLogo}
            alt="Team logo"
            className="h-12 w-12 shrink-0 rounded-full object-cover sm:h-16 sm:w-16"
          />

          <div className="ml-3 min-w-0 sm:ml-5">
            <p className="text-[18px] leading-none font-medium text-white sm:text-[18px]">Tournament</p>
            <p className="mt-0.5 text-[18px] leading-none font-extrabold tracking-[0.01em] text-[#DA9811] uppercase sm:mt-1 sm:text-[30px]">
              Runs
            </p>
          </div>

          <div className="mx-3 h-[46px] w-px sm:mx-6 sm:h-[64px]" style={separatorStyle} />

          <p className="text-[26px] leading-none font-extrabold text-[#DA9811] sm:text-[34px]">400</p>
        </div>
      </section>
    </div>
  );
}
