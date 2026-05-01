import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

const controllerFrameBg = `${CLOUDFRONT_APP_BASE}/images/background/controller-frame.png`;
const teamLogo = `${CLOUDFRONT_APP_BASE}/images/standard/team-logo.png`;
const playerImage = `${CLOUDFRONT_APP_BASE}/images/standard/team-logo.png`;

const frameStyle = {
  backgroundImage: `url(${controllerFrameBg})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};

const rankingRows = [
  { rank: 1, wickets: '10', name: 'Mani', team: 'Royal Stars' },
  { rank: 2, wickets: '09', name: 'Mani', team: 'Royal Stars' },
  { rank: 3, wickets: '08', name: 'Mani', team: 'Royal Stars' },
  { rank: 4, wickets: '07', name: 'Mani', team: 'Royal Stars' },
  { rank: 5, wickets: '05', name: 'Mani', team: 'Royal Stars' },
];

export default function HighestWickets() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1D1E22] p-3 sm:p-5">
      <section
        className="relative w-full max-w-[677px] overflow-hidden px-5 py-7 text-white sm:w-[677px] sm:px-8 sm:py-8"
        style={frameStyle}
      >
        <img
          src={teamLogo}
          alt="Team logo"
          className="absolute top-5 right-5 h-[56px] w-[56px] rounded-full object-cover sm:top-7 sm:right-9 sm:h-[74px] sm:w-[74px]"
        />

        <div className="relative z-10">
          <h2 className="text-[22px] leading-none font-bold text-[#DA9811] sm:text-[29px]">
            Highest Wickets
          </h2>
          <p className="mt-2 text-[12px] leading-none font-normal text-white sm:text-[18px]">
            Tournament
          </p>

          <div className="mt-5 grid grid-cols-[1fr_140px] gap-3 sm:mt-7 sm:grid-cols-[1fr_228px] sm:gap-7">
            <div>
              {rankingRows.map(({ rank, wickets, name, team }, index) => (
                <div
                  key={rank}
                  className="relative grid grid-cols-[30px_96px_1fr] items-center py-2.5 sm:grid-cols-[44px_120px_1fr] sm:py-3"
                >
                  <span className="text-[12px] leading-none font-bold text-white sm:text-[20px]">
                    {rank}
                  </span>
                  <span className="text-[20px] leading-none font-bold text-[#DA9811] sm:text-[30px]">
                    {wickets}
                  </span>
                  <div className="leading-none">
                    <p className="text-[14px] font-bold text-white sm:text-[20px]">
                      {name}
                    </p>
                    <p className="mt-1 text-[12px] font-normal text-white sm:mt-2 sm:text-[18px]">
                      {team}
                    </p>
                  </div>
                  {index < rankingRows.length - 1 && (
                    <div className="absolute right-0 bottom-0 left-[-1.25rem] h-px bg-gradient-to-r from-[#FFFFFF30] to-[#FFFFFF00] sm:left-[-2rem]" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-3 sm:mt-6">
              <div className="w-full rounded-[10px] bg-black/60 p-1.5 sm:rounded-[12px] sm:p-2">
                <img
                  src={playerImage}
                  alt="Top wicket taker"
                  className="h-[150px] w-full rounded-[8px] object-cover sm:h-[250px] sm:rounded-[10px]"
                />
                <div className="pt-4 pb-2 text-center leading-none">
                  <p className="text-[16px] font-semibold text-[#DA9811] sm:text-[18px]">
                    Haroon
                  </p>
                  <p className="mt-2 text-[16px] font-semibold text-[#DA9811] sm:mt-3 sm:text-[18px]">
                    10
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
