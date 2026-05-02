import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

const teamLogo = `${CLOUDFRONT_APP_BASE}/images/standard/team-logo.png`;
const controllerFrameBg = `${CLOUDFRONT_APP_BASE}/images/background/controller-frame.png`;

const rightHalfStyle = {
  backgroundImage: `url(${controllerFrameBg})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};

const batters = [
  { name: 'Qadeer', runs: 36, balls: 21 },
  { name: 'Haroon', runs: 42, balls: 17 },
];

const separatorStyle = {
  background: 'linear-gradient(180deg, #080807 0%, #FFFFFF 50%, #080807 100%)',
};
const batterSeparatorStyle = {
  background:
    'linear-gradient(90deg, rgba(8,8,7,1) 0%, rgba(255,255,255,0.95) 50%, rgba(8,8,7,1) 100%)',
};

export default function CurrentPartnership() {
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
          <div
            className="mx-1 w-px self-stretch sm:mx-3"
            style={separatorStyle}
          />

          <div className="flex items-center px-1 sm:hidden">
            <div>
              <div className="flex items-center gap-1 leading-none">
                <span className="w-[30px] text-[8px] font-medium text-[#E8E8E8]">
                  {batters[0].name}
                </span>
                <span className="text-[11px] font-bold text-[#DA9811]">
                  {batters[0].runs}
                </span>
                <span className="text-[9px] font-bold text-[#DA9811]">
                  {batters[0].balls}
                </span>
              </div>
              <div
                className="my-0.5 h-px w-[30px]"
                style={batterSeparatorStyle}
              />
              <div className="flex items-center gap-1 leading-none">
                <span className="w-[30px] text-[8px] font-medium text-[#E8E8E8]">
                  {batters[1].name}
                </span>
                <span className="text-[11px] font-bold text-[#DA9811]">
                  {batters[1].runs}
                </span>
                <span className="text-[9px] font-bold text-[#DA9811]">
                  {batters[1].balls}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden items-center px-3 sm:flex sm:px-6">
            <div>
              <div className="flex items-center gap-3 leading-none">
                <span className="w-[72px] text-[14px] font-medium text-[#E8E8E8]">
                  {batters[0].name}
                </span>
                <span className="text-[24px] font-bold text-[#DA9811]">
                  {batters[0].runs}
                </span>
                <span className="text-[16px] font-bold text-[#DA9811]">
                  {batters[0].balls}
                </span>
              </div>

              <div
                className="my-1 h-px w-[72px]"
                style={batterSeparatorStyle}
              />

              <div className="flex items-center gap-3 leading-none">
                <span className="w-[72px] text-[14px] font-medium text-[#E8E8E8]">
                  {batters[1].name}
                </span>
                <span className="text-[24px] font-bold text-[#DA9811]">
                  {batters[1].runs}
                </span>
                <span className="text-[16px] font-bold text-[#DA9811]">
                  {batters[1].balls}
                </span>
              </div>
            </div>
          </div>

          <div className="ml-auto flex items-center">
            <div className="px-2 text-left sm:px-8">
              <p className="text-[8px] leading-none font-semibold text-[#E8E8E8] sm:text-[18px]">
                Current
              </p>
              <p className="mt-0.5 text-[8px] leading-none font-semibold text-[#E8E8E8] sm:mt-1 sm:text-[18px]">
                Partnership
              </p>
            </div>
            <div className="flex items-end gap-2 px-1 text-right sm:px-5">
              <p className="text-[15px] leading-none font-extrabold text-white sm:text-[28px]">
                96
              </p>
              <p className="mt-0.5 text-[10px] leading-none font-semibold text-[#E8E8E8] sm:text-[20px]">
                32
              </p>
            </div>
            <div
              className="mx-1 w-px self-stretch sm:mx-3"
              style={separatorStyle}
            />

            <div className="px-2 sm:px-6">
              <p className="text-[12px] leading-none font-extrabold text-white sm:text-[28px]">
                KKR
              </p>
            </div>
            <img
              src={teamLogo}
              alt="Bowling team logo"
              className="h-8 w-8 rounded-full object-cover sm:h-14 sm:w-14"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
