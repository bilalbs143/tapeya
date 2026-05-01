import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

const controllerFrameBg = `${CLOUDFRONT_APP_BASE}/images/background/controller-frame.png`;
const teamLogo = `${CLOUDFRONT_APP_BASE}/images/standard/team-logo.png`;

const frameStyle = {
  backgroundImage: `url(${controllerFrameBg})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};

export default function InningsBreak() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1D1E22] p-3 sm:p-5">
      <section
        className="relative flex h-[481px] w-full max-w-[677px] flex-col items-center justify-center overflow-hidden px-8 text-white sm:px-12"
        style={frameStyle}
      >
        <div className="mb-12 flex w-full max-w-[460px] items-center justify-between">
          <img
            src={teamLogo}
            alt="Team one logo"
            className="h-[104px] w-[104px] rounded-full object-cover"
          />
          <span className="text-[54px] leading-none font-bold text-[#DA9811] uppercase">
            VS
          </span>
          <img
            src={teamLogo}
            alt="Team two logo"
            className="h-[104px] w-[104px] rounded-full object-cover"
          />
        </div>

        <p className="text-center text-[30px] leading-none font-extrabold tracking-[0.01em] text-white uppercase">
          Innings Break
        </p>
      </section>
    </div>
  );
}
