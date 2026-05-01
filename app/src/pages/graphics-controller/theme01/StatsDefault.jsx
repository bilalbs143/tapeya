const CLOUDFRONT_APP_BASE = 'https://d1nmw2vhka3zp0.cloudfront.net/app';

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

const overBalls = ['6', '2', 'Owd', 'Owd', '6'];
const separatorStyle = {
  background: 'linear-gradient(180deg, #080807 0%, #FFFFFF 50%, #080807 100%)',
};
const batterSeparatorStyle = {
  background:
    'linear-gradient(90deg, rgba(8,8,7,1) 0%, rgba(255,255,255,0.95) 50%, rgba(8,8,7,1) 100%)',
};

export default function StatsDefault() {
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

        <div className="relative z-10 mx-auto flex w-full items-stretch px-1 py-0.5 sm:px-6 sm:py-3">
          <div className="flex items-center gap-1 pr-1 sm:gap-3 sm:pr-5">
            <img
              src={teamLogo}
              alt="Batting team logo"
              className="h-7 w-7 rounded-full object-cover sm:h-14 sm:w-14"
            />
            <div>
              <p className="text-[10px] leading-none font-extrabold text-[#DA9811] sm:text-[30px]">
                SC
              </p>
              <p className="mt-0.5 text-[7px] leading-none whitespace-nowrap text-[#E2E2E2] sm:mt-1 sm:text-[14px]">
                14.4 OVER
              </p>
            </div>
            <p className="ml-1 text-[10px] leading-none font-extrabold text-white sm:ml-6 sm:text-[28px]">
              196-7
            </p>
          </div>
          <div
            className="mx-0.5 w-px self-stretch sm:mx-3"
            style={separatorStyle}
          />

          <div className="flex items-center px-0.5 sm:hidden">
            <div>
              <div className="flex items-center gap-0.5 leading-none">
                <span className="w-[34px] text-[7px] font-medium text-[#E8E8E8]">
                  {batters[0].name}
                </span>
                <span className="text-[7px] font-bold text-[#DA9811]">
                  {batters[0].runs}
                </span>
                <span className="text-[6px] font-bold text-[#DA9811]">
                  {batters[0].balls}
                </span>
              </div>
              <div
                className="my-0.5 h-px w-[34px]"
                style={batterSeparatorStyle}
              />
              <div className="flex items-center gap-0.5 leading-none">
                <span className="w-[34px] text-[7px] font-medium text-[#E8E8E8]">
                  {batters[1].name}
                </span>
                <span className="text-[7px] font-bold text-[#DA9811]">
                  {batters[1].runs}
                </span>
                <span className="text-[6px] font-bold text-[#DA9811]">
                  {batters[1].balls}
                </span>
              </div>
            </div>
          </div>

          <div
            className="mx-0.5 w-px self-stretch sm:hidden"
            style={separatorStyle}
          />

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

          <div className="ml-auto flex items-stretch">
            <div className="flex items-center gap-1 px-1 text-center sm:gap-4 sm:px-10">
              <p className="text-[10px] leading-none font-extrabold lowercase sm:text-[20px]">
                v
              </p>
              <p className="text-[10px] leading-none font-extrabold uppercase sm:text-[24px]">
                KKR
              </p>
            </div>

            <div className="flex items-center px-0.5 sm:px-3">
              <img
                src={teamLogo}
                alt="Bowling team logo"
                className="h-7 w-7 rounded-full object-cover sm:h-14 sm:w-14"
              />
            </div>
            <div
              className="mx-0.5 w-px self-stretch sm:mx-3"
              style={separatorStyle}
            />

            <div className="flex items-center pl-0.5 sm:pl-6">
              <div>
                <div className="mb-0.5 flex items-end justify-between gap-2 font-medium sm:mb-2 sm:gap-6">
                  <div>
                    <p className="text-[7px] leading-none text-[#E8E8E8] sm:text-[14px]">
                      Arqam
                    </p>
                    <div
                      className="mt-0.5 h-px w-[28px] sm:mt-2 sm:w-[72px]"
                      style={batterSeparatorStyle}
                    />
                  </div>
                  <div className="mb-1 flex items-baseline gap-1 sm:gap-4">
                    <p className="text-[7px] leading-none text-[#E8E8E8] sm:text-[18px]">
                      0-44
                    </p>
                    <p className="text-[7px] leading-none text-[#E8E8E8] sm:text-[14px]">
                      3.0
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 sm:gap-2">
                  {overBalls.map((ball, index) => {
                    const isRunsBall = ball === '6' || ball === '2';
                    return (
                      <span
                        key={`${ball}-${index}`}
                        className={`inline-flex items-center justify-center leading-none font-medium text-black ${
                          isRunsBall
                            ? 'h-4 min-w-[16px] rounded-full bg-[#DA9811] px-1 text-[8px] sm:h-6 sm:min-w-[20px] sm:px-2 sm:text-[14px]'
                            : 'h-4 min-w-[22px] rounded-none bg-white px-1 text-[8px] sm:h-6 sm:min-w-[20px] sm:px-2 sm:text-[14px]'
                        }`}
                      >
                        {ball}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
