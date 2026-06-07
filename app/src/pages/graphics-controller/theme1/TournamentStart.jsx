import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

const controllerFrameBg = `${CLOUDFRONT_APP_BASE}/images/background/controller-frame.png`;
const defaultTeamLogo = `${CLOUDFRONT_APP_BASE}/images/standard/team-logo.png`;

const frameStyle = {
  backgroundImage: `url(${controllerFrameBg})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};

const teamLogoClassName = 'h-[88px] w-[88px] rounded-full object-cover sm:h-[104px] sm:w-[104px]';
const teamNameClassName =
  'w-[120px] text-center text-[20px] leading-none font-semibold tracking-[0.02em] text-brand uppercase sm:w-[150px] sm:text-[24px]';

export default function TournamentStart({ homeTeam = {}, awayTeam = {}, matchNumber = '', venue = '', tournamentName = '' }) {
  const homeLogo = homeTeam.logoUrl ?? defaultTeamLogo;
  const awayLogo = awayTeam.logoUrl ?? defaultTeamLogo;
  const homeName = homeTeam.shortCode || homeTeam.name || 'Home';
  const awayName = awayTeam.shortCode || awayTeam.name || 'Away';
  const matchLabel = matchNumber ? `Match ${matchNumber}` : '';

  return (
    <div className="flex min-h-screen items-center justify-center bg-page p-3 sm:p-5">
      <section
        className="relative flex h-[481px] w-full max-w-[677px] flex-col items-center justify-center overflow-hidden px-5 text-white sm:px-8"
        style={frameStyle}
      >
        {tournamentName ? (
          <h1 className="mb-8 text-center text-[28px] leading-none font-bold tracking-[0.02em] text-brand uppercase sm:mb-10 sm:text-[31px]">
            {tournamentName}
          </h1>
        ) : null}

        <div className="mb-6 flex w-full max-w-[448px] items-center justify-between sm:mb-8">
          <img src={homeLogo} alt={homeTeam.name || 'Home team'} className={teamLogoClassName} />
          <span className="px-3 text-[45px] leading-none font-bold text-brand uppercase sm:text-[54px]">VS</span>
          <img src={awayLogo} alt={awayTeam.name || 'Away team'} className={teamLogoClassName} />
        </div>

        {matchLabel ? (
          <p className="mb-3 text-center text-[16px] leading-none font-semibold tracking-[0.02em] text-white uppercase sm:mb-4 sm:text-[18px]">
            {matchLabel}
          </p>
        ) : null}

        <div className="mb-5 flex w-full max-w-[510px] items-center justify-between bg-black/70 px-3 sm:mb-6 sm:px-6">
          <span className={teamNameClassName}>{homeName}</span>
          <span className="min-w-[100px] rounded-[10px] border border-white bg-brand px-6 py-3 text-center text-[20px] leading-none font-bold text-black uppercase sm:min-w-[120px] sm:px-8 sm:text-[22px]">
            VS
          </span>
          <span className={teamNameClassName}>{awayName}</span>
        </div>

        {venue ? (
          <p className="text-center text-[14px] leading-snug font-normal tracking-[0.03em] text-white uppercase sm:text-[16px]">
            Live From {venue}
          </p>
        ) : null}
      </section>
    </div>
  );
}
