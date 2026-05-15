import {
  controllerPanelSurfaceStyle,
  PLAYER_PAGE_BG_CLASS,
  playerGraphicHorizontalRuleStyle,
  playerNameAccentClass,
} from './playerGraphicTheme';

/**
 * Bottom lower-third panel for live player match / career figures (theme1).
 * Used by batsman & bowler current + career overlays — one layout, configurable header.
 *
 * @param {object} props
 * @param {string} props.playerName
 * @param {import('react').ReactNode} [props.headerRight]  Primary figures or headline on the right
 * @param {{ label: string, value: string|number }[]} [props.stats]
 */
export default function PlayerLowerThirdPanel({
  playerName = '',
  headerRight = null,
  stats = [],
}) {
  return (
    <div
      className={`relative min-h-screen overflow-hidden ${PLAYER_PAGE_BG_CLASS}`}
    >
      <section className="absolute right-0 bottom-0 left-0 text-white">
        <div
          className="relative w-full overflow-hidden px-3 py-2 sm:px-10 sm:py-4"
          style={controllerPanelSurfaceStyle()}
        >
          <div className="flex items-start justify-between gap-2 sm:gap-6">
            <p className={`min-w-0 flex-1 ${playerNameAccentClass}`}>
              {playerName}
            </p>
            {headerRight != null && headerRight !== false ? (
              <div className="shrink-0 text-right">{headerRight}</div>
            ) : null}
          </div>
          <div
            className="mt-2 h-px w-full sm:mt-3"
            style={playerGraphicHorizontalRuleStyle}
          />

          <PlayerStatGrid stats={stats} />
        </div>
      </section>
    </div>
  );
}

/**
 * @param {{ label: string, value: string|number }[]} stats
 */
export function PlayerStatGrid({ stats = [] }) {
  if (!stats.length) return null;
  return (
    <div className="mt-2 flex flex-wrap items-start justify-center gap-x-6 gap-y-3 text-center sm:mt-5 sm:gap-x-12 sm:gap-y-4">
      {stats.map((item) => (
        <div key={item.label} className="min-w-0">
          <p className="text-[8px] leading-none font-medium text-[#EDEDED] sm:text-[16px]">
            {item.label}
          </p>
          <p className="mt-0.5 text-[10px] leading-none font-medium text-white sm:mt-2 sm:text-[16px]">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
