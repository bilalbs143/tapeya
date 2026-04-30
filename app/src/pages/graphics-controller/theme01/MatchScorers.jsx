const CLOUDFRONT_APP_BASE = 'https://d1nmw2vhka3zp0.cloudfront.net/app';

const controllerFrameBg = `${CLOUDFRONT_APP_BASE}/images/background/controller-frame.png`;

const frameStyle = {
  backgroundImage: `url(${controllerFrameBg})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};

export default function MatchScorers() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1D1E22]">
      <section
        className="absolute right-0 bottom-0 left-0 flex h-[80px] items-center justify-center overflow-hidden"
        style={frameStyle}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="pointer-events-none absolute -top-10 left-1/3 h-32 w-32 rounded-full bg-[#C57A12]/25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-10 h-20 w-20 rounded-full bg-[#E3A63B]/20 blur-2xl" />

        <div className="relative z-10 w-full px-2 sm:px-6">
          <div className="mx-auto flex h-[48px] w-full items-center justify-center sm:h-[58px]">
            <span className="text-center text-[20px] leading-none font-extrabold tracking-[0.02em] text-white uppercase sm:text-[28px]">
              Match Scorers
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
