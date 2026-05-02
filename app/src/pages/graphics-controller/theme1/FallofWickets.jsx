import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

const teamLogo = `${CLOUDFRONT_APP_BASE}/images/standard/team-logo.png`;
const controllerFrameBg = `${CLOUDFRONT_APP_BASE}/images/background/controller-frame.png`;

const rightHalfStyle = {
  backgroundImage: `url(${controllerFrameBg})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};

const wicketMilestones = [
  { over: '1st', score: '2' },
  { over: '2nd', score: '28' },
  { over: '3rd', score: '74' },
  { over: '4th', score: '83' },
  { over: '5th', score: '111' },
  { over: '6th', score: '111' },
  { over: '7th', score: '127' },
  { over: '8th', score: '140' },
];

const separatorStyle = {
  background: 'linear-gradient(180deg, #080807 0%, #FFFFFF 50%, #080807 100%)',
};
export default function FallofWickets() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1D1E22]">
      <section className="absolute right-0 bottom-0 left-0 overflow-hidden text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={rightHalfStyle} />
          <div
            className="absolute inset-y-0 left-0 w-[20%] sm:w-[26%]"
            style={{ ...rightHalfStyle, filter: 'grayscale(1)' }}
          />
        </div>

        <div className="relative z-10 mx-auto flex w-full items-stretch px-1 py-1 sm:px-6 sm:py-3">
          <div className="flex shrink-0 items-center gap-1 pr-1 sm:gap-3 sm:pr-5">
            <img
              src={teamLogo}
              alt="Batting team logo"
              className="h-6 w-6 rounded-full object-cover sm:h-14 sm:w-14"
            />
            <div>
              <p className="text-[10px] leading-none font-extrabold text-[#DA9811] sm:text-[30px]">
                SC
              </p>
              <p className="mt-0.5 text-[7px] leading-none text-[#E2E2E2] sm:mt-1 sm:text-[14px]">
                14.4 OVER
              </p>
            </div>
            <p className="ml-1 text-[10px] leading-none font-extrabold text-white sm:ml-6 sm:text-[28px]">
              196-7
            </p>
          </div>
          <div className="ml-1 flex min-w-0 flex-1 items-stretch justify-end overflow-hidden sm:ml-auto sm:overflow-x-auto">
            {wicketMilestones.map((item, index) => (
              <div
                key={item.over}
                className="flex min-w-0 flex-1 items-stretch sm:flex-none sm:shrink-0"
              >
                {index > 0 ? (
                  <div
                    className="mx-0.5 w-px self-stretch sm:mx-3"
                    style={separatorStyle}
                  />
                ) : null}
                <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-0.5 text-center sm:w-[80px] sm:flex-none sm:px-2">
                  <p className="text-[6px] leading-none font-semibold text-white sm:text-[18px]">
                    {item.over}
                  </p>
                  <p className="mt-0.5 text-[9px] leading-none font-extrabold text-white sm:mt-2 sm:text-[20px]">
                    {item.score}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
