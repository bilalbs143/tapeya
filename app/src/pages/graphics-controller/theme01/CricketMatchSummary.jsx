const CLOUDFRONT_APP_BASE = 'https://d1nmw2vhka3zp0.cloudfront.net/app';

const controllerFrameBg = `${CLOUDFRONT_APP_BASE}/images/background/controller-frame.png`;
const teamLogo = `${CLOUDFRONT_APP_BASE}/images/standard/team-logo.png`;

const frameStyle = {
  backgroundImage: `url(${controllerFrameBg})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};

const summaryStats = [
  { id: 'score', label: 'Score', value: '196' },
  { id: 'inning', label: '2nd Innings', value: '196' },
  { id: 'wickets', label: 'Wickets', value: '7' },
  { id: 'overs', label: 'Overs', value: '6.3' },
];

export default function CricketMatchSummary() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1D1E22] p-3 sm:p-5">
      <section
        className="relative w-full max-w-[677px] overflow-hidden px-10 py-8 text-white sm:px-12 sm:pb-10"
        style={frameStyle}
      >
        <img
          src={teamLogo}
          alt="Team logo"
          className="absolute top-3 right-4 z-10 h-[54px] w-[54px] rounded-full object-cover"
        />

        <div className="relative z-10 pt-10">
          <p className="text-[16px] leading-none font-bold text-[#DA9811] uppercase">
            KKR VS PZ
          </p>
          <p className="mt-2 text-[14px] leading-none font-bold text-[#DA9811] uppercase">
            Tournament Name (Match 7)
          </p>

          <div className="mt-4 rounded-[12px] bg-black/65 px-10 py-8">
            <div className="grid grid-cols-2 gap-x-12 gap-y-12">
              {summaryStats.map(({ id, label, value }) => (
                <div key={id} className="text-center">
                  <p className="text-[16px] leading-none font-semibold text-white uppercase">
                    {label}
                  </p>
                  <p className="mt-3 text-[28px] leading-none font-bold text-white">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
