import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

const controllerFrameBg = `${CLOUDFRONT_APP_BASE}/images/background/controller-frame.png`;
const defaultTeamLogo = `${CLOUDFRONT_APP_BASE}/images/standard/team-logo.png`;

const frameStyle = {
  backgroundImage: `url(${controllerFrameBg})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};

export default function CricketMatchSummary({
  matchup = '',
  tournamentLabel = '',
  stats = [],
  battingTeam = {},
}) {
  const teamLogo = battingTeam.logoUrl ?? defaultTeamLogo;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1D1E22] p-3 sm:p-5">
      <section
        className="relative w-full max-w-[677px] overflow-hidden px-10 py-8 text-white sm:px-12 sm:pb-10"
        style={frameStyle}
      >
        <img
          src={teamLogo}
          alt={battingTeam.name || 'Team'}
          className="absolute top-3 right-4 z-10 h-[54px] w-[54px] rounded-full object-cover"
        />

        <div className="relative z-10 pt-10">
          {matchup ? (
            <p className="text-[16px] leading-none font-bold text-[#DA9811] uppercase">
              {matchup}
            </p>
          ) : null}
          {tournamentLabel ? (
            <p className="mt-2 text-[14px] leading-none font-bold text-[#DA9811] uppercase">
              {tournamentLabel}
            </p>
          ) : null}

          {stats.length > 0 ? (
            <div className="mt-4 rounded-[12px] bg-black/65 px-10 py-8">
              <div className="grid grid-cols-2 gap-x-12 gap-y-12">
                {stats.map(({ id, label, value }) => (
                  <div key={id ?? label} className="text-center">
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
          ) : null}
        </div>
      </section>
    </div>
  );
}
