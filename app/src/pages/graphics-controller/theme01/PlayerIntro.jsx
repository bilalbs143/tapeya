const CLOUDFRONT_APP_BASE = 'https://d1nmw2vhka3zp0.cloudfront.net/app';

const controllerFrameBg = `${CLOUDFRONT_APP_BASE}/images/background/controller-frame.png`;
const teamLogo = `${CLOUDFRONT_APP_BASE}/images/standard/team-logo.png`;
const playerAvatar = `${CLOUDFRONT_APP_BASE}/images/standard/avatar-controlls.png`;

const avatarPanelStyle = {
  backgroundImage: `url(${controllerFrameBg})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};

export default function PlayerIntro() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1D1E22] p-3 sm:p-5">
      <section className="relative w-full max-w-[677px] overflow-hidden bg-black px-4 py-6 text-white sm:px-7 sm:py-8">
        <div className="relative z-10">
          <h2 className="text-[16px] leading-none font-bold text-[#DA9811] uppercase sm:text-[21px]">
            Player Intro
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:mt-7 sm:grid-cols-[1fr_0.85fr] sm:items-end sm:gap-6">
            <div
              className="relative h-[290px] overflow-hidden rounded-tl-[140px] rounded-tr-[20px] bg-black sm:h-[300px] sm:rounded-tr-[24px]"
              style={avatarPanelStyle}
            >
              <img
                src={playerAvatar}
                alt="Player illustration"
                className="absolute right-1/2 bottom-0 w-[55%] translate-x-1/2 object-contain sm:w-[60%]"
              />
            </div>

            <div>
              <img
                src={teamLogo}
                alt="Team logo"
                className="mx-auto mb-16 h-[92px] w-[92px] rounded-full object-cover sm:h-[104px] sm:w-[104px]"
              />

              <div className="rounded-[10px] bg-[#0C0601] px-4 py-4 text-[#DA9811] sm:px-5 sm:py-5">
                <p className="text-[15px] leading-none font-bold uppercase sm:text-[16px]">
                  Qaderr
                </p>
                <div className="mt-3 h-px w-full bg-[#FFFFFF24]" />
                <p className="mt-3 text-[13px] leading-none sm:text-[14px]">KKR</p>
                <p className="mt-2 text-[13px] leading-none sm:text-[14px]">
                  Right Hand Batsman
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
