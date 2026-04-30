const CLOUDFRONT_APP_BASE = 'https://d1nmw2vhka3zp0.cloudfront.net/app';

const controllerFrameBg = `${CLOUDFRONT_APP_BASE}/images/background/controller-frame.png`;
const teamLogo = `${CLOUDFRONT_APP_BASE}/images/standard/team-logo.png`;

const panelStyle = {
  backgroundImage: `url(${controllerFrameBg})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};
export default function FollowUs() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1D1E22]">
      <section className="absolute right-0 bottom-0 left-0 h-[80px] overflow-hidden text-white sm:h-[96px]">
        <div
          className="relative flex h-full w-full items-center px-3 sm:px-8"
          style={panelStyle}
        >
          <div className="absolute inset-0 bg-black/55" />
          <div className="pointer-events-none absolute -top-8 left-1/3 h-24 w-24 rounded-full bg-[#C57A12]/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-12 h-20 w-20 rounded-full bg-[#E3A63B]/20 blur-2xl" />

          <div className="relative z-10 flex w-full items-center gap-2 sm:gap-5">
            <img
              src={teamLogo}
              alt="Tapeya logo"
              className="h-12 w-12 shrink-0 rounded-full object-cover sm:h-14 sm:w-14"
            />

            <div className="min-w-0 flex-1 text-center">
              <p className="text-[11px] leading-tight font-extrabold tracking-[0.01em] text-[#DA9811] uppercase sm:text-[16px]">
                For Live Streaming And Real-Time Ball Updates, Follow Us.
              </p>
              <a
                href="https://tapeya.com/"
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 inline-block text-[11px] leading-none font-medium text-white sm:mt-1 sm:text-[16px]"
              >
                www.tapeya.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
