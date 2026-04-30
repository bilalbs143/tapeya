const CLOUDFRONT_APP_BASE = 'https://d1nmw2vhka3zp0.cloudfront.net/app';

const controllerFrameBg = `${CLOUDFRONT_APP_BASE}/images/background/controller-frame.png`;
const teamLogo = `${CLOUDFRONT_APP_BASE}/images/standard/team-logo.png`;

const frameStyle = {
  backgroundImage: `url(${controllerFrameBg})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};

export default function PlayerIntroRow() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1D1E22]">
      <section
        className="absolute right-0 bottom-0 left-0 h-[80px] overflow-hidden text-white sm:h-[96px]"
        style={frameStyle}
      >
        <div className="absolute inset-0 bg-black/55" />
        <div className="pointer-events-none absolute -top-8 left-1/3 h-24 w-24 rounded-full bg-[#C57A12]/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-12 h-20 w-20 rounded-full bg-[#E3A63B]/20 blur-2xl" />

        <div className="relative z-10 flex h-full items-center justify-between px-4 sm:px-10">
          <div className="min-w-0">
            <p className="truncate text-[14px] leading-none font-bold tracking-[0.01em] text-[#DA9811] uppercase sm:text-[16px]">
              Tamour Mirza
            </p>
            <p className="mt-2 truncate text-[10px] leading-none font-normal text-white sm:mt-2 sm:text-[14px]">
              Right Hand Batsman
            </p>
          </div>

          <img
            src={teamLogo}
            alt="Team logo"
            className="ml-3 h-12 w-12 shrink-0 rounded-full object-cover sm:h-16 sm:w-16"
          />
        </div>
      </section>
    </div>
  );
}
