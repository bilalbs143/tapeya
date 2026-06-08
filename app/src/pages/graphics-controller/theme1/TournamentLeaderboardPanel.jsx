import {
  controllerPanelSurfaceStyle,
  defaultTeamLogoUrl,
  showcasePageWrapClass,
  showcaseSectionClass,
  showcaseTitleClass,
} from './playerGraphicTheme';

const Panel = 'div';

/**
 * Full-screen tournament leaderboard (runs / 4s / 6s / wickets).
 *
 * @param {'batting'|'bowling'} metricKind
 */
export default function TournamentLeaderboardPanel({
  title = 'Leaderboard',
  subtitle = 'Tournament',
  rows = [],
  featured = null,
  tournamentLogoUrl = null,
  metricKind = 'batting',
  emptyMessage = 'No tournament stats yet.',
  featuredAlt = 'Top player',
}) {
  const tournamentLogo = tournamentLogoUrl ?? defaultTeamLogoUrl;
  const featuredImage = featured?.image_url ?? defaultTeamLogoUrl;
  const featuredName = featured?.name ?? '';
  const featuredValue = featured?.value ?? '';
  const metricKey = metricKind === 'bowling' ? 'wickets' : 'runs';
  const hasFeatured = Boolean(featuredName || featuredValue);

  return (
    <Panel className={`${showcasePageWrapClass} bg-page`}>
      <section className={showcaseSectionClass} style={controllerPanelSurfaceStyle()}>
        <img
          src={tournamentLogo}
          alt="Tournament"
          className="absolute top-5 right-5 h-[56px] w-[56px] rounded-full object-cover sm:top-7 sm:right-9 sm:h-[74px] sm:w-[74px]"
        />

        <Panel className="relative z-10">
          <h2 className={showcaseTitleClass}>{title}</h2>
          <p className="mt-2 text-[12px] leading-none font-normal text-white sm:text-[18px]">{subtitle}</p>

          {rows.length === 0 ? (
            <p className="mt-6 text-center text-[13px] leading-snug text-white/70 sm:text-[16px]">{emptyMessage}</p>
          ) : null}

          <Panel className="mt-5 grid grid-cols-[1fr_140px] gap-3 sm:mt-7 sm:grid-cols-[1fr_228px] sm:gap-7">
            <Panel>
              {rows.map((row, index) => {
                const stat = row[metricKey] ?? row.value;
                return (
                  <Panel
                    key={row.rank ?? index}
                    className="relative grid grid-cols-[30px_96px_1fr] items-center py-2.5 sm:grid-cols-[44px_120px_1fr] sm:py-3"
                  >
                    <span className="text-[12px] leading-none font-bold text-white sm:text-[20px]">{row.rank}</span>
                    <span className="text-brand text-[20px] leading-none font-bold sm:text-[30px]">{stat}</span>
                    <Panel className="leading-none">
                      <p className="text-[14px] font-bold text-white sm:text-[20px]">{row.name}</p>
                      {row.team ? (
                        <p className="mt-1 text-[12px] font-normal text-white sm:mt-2 sm:text-[18px]">{row.team}</p>
                      ) : null}
                    </Panel>
                    {index < rows.length - 1 ? (
                      <Panel className="absolute right-0 bottom-0 left-[-1.25rem] h-px bg-gradient-to-r from-[#FFFFFF30] to-[#FFFFFF00] sm:left-[-2rem]" />
                    ) : null}
                  </Panel>
                );
              })}
            </Panel>

            {hasFeatured ? (
              <Panel className="mt-3 sm:mt-6">
                <Panel className="w-full rounded-[10px] bg-black/60 p-1.5 sm:rounded-[12px] sm:p-2">
                  <img
                    src={featuredImage}
                    alt={featuredName || featuredAlt}
                    className="h-[150px] w-full rounded-[8px] object-cover sm:h-[250px] sm:rounded-[10px]"
                  />
                  <Panel className="pt-4 pb-2 text-center leading-none">
                    <p className="text-brand text-[16px] font-semibold sm:text-[18px]">{featuredName}</p>
                    <p className="text-brand mt-2 text-[16px] font-semibold sm:mt-3 sm:text-[18px]">{featuredValue}</p>
                  </Panel>
                </Panel>
              </Panel>
            ) : null}
          </Panel>
        </Panel>
      </section>
    </Panel>
  );
}
