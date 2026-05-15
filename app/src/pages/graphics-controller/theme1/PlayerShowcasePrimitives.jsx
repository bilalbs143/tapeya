import {
  avatarStageImageClass,
  avatarStageShellClass,
  controllerPanelSurfaceStyle,
  defaultPlayerAvatarUrl,
  PLAYER_PAGE_BG_CLASS,
  showcasePageWrapClass,
  showcaseSectionClass,
  showcaseTitleClass,
} from './playerGraphicTheme';

/**
 * Centered “showcase” page wrapper (intro / career / tournament player cards).
 */
export function PlayerShowcasePage({ children }) {
  return (
    <div className={`${showcasePageWrapClass} ${PLAYER_PAGE_BG_CLASS}`}>
      {children}
    </div>
  );
}

/**
 * Black card shell with optional section title (gold, uppercase).
 */
export function PlayerShowcaseSection({ title, children }) {
  return (
    <section className={showcaseSectionClass}>
      <div className="relative z-10">
        {title ? (
          <h2 className={showcaseTitleClass}>{title}</h2>
        ) : null}
        {children}
      </div>
    </section>
  );
}

/**
 * Hero avatar panel (controller-frame texture + player cut-out).
 */
export function PlayerAvatarStage({
  playerName = '',
  playerImageUrl = null,
  className = '',
}) {
  const avatarSrc = playerImageUrl ?? defaultPlayerAvatarUrl;
  return (
    <div
      className={`${avatarStageShellClass} ${className}`.trim()}
      style={controllerPanelSurfaceStyle()}
    >
      <img
        src={avatarSrc}
        alt={playerName || 'Player'}
        className={avatarStageImageClass}
      />
    </div>
  );
}

/**
 * Vertical stack of label/value pairs with theme1 dividers (tournament / career side column).
 */
export function PlayerVerticalStatList({ stats = [] }) {
  if (!stats.length) return null;
  return (
    <div className="rounded-[10px] bg-[#0C0601] px-3 py-4 text-white sm:py-5">
      {stats.map((item, index) => (
        <div key={item.label} className="text-center">
          <p className="text-[11px] leading-none font-medium sm:text-[12px]">
            {item.label}
          </p>
          <p className="mt-2 text-[13px] leading-none font-medium sm:text-[14px]">
            {item.value}
          </p>
          {index < stats.length - 1 ? (
            <div className="mx-auto my-3 h-px w-full bg-gradient-to-r from-[#080807] via-[#FFFFFF] to-[#080807]" />
          ) : null}
        </div>
      ))}
    </div>
  );
}

const identityCardClass =
  'rounded-[10px] bg-[#0C0601] px-4 py-4 text-[#DA9811] sm:px-5 sm:py-5';

const identityMutedLineClass =
  'mt-3 text-[13px] leading-none font-medium text-white sm:text-[14px]';

const identityAccentLineClass = 'mt-3 text-[13px] leading-none sm:text-[14px]';

/**
 * Name + team + role block (gold headline; team/role follow theme variant).
 */
export function PlayerIdentityBlurb({
  playerName = '',
  playerTeam = '',
  playerRole = '',
  secondaryTone = 'muted',
  dividerVariant = 'solid',
}) {
  const lineClass =
    secondaryTone === 'accent' ? identityAccentLineClass : identityMutedLineClass;
  const divider =
    dividerVariant === 'fade' ? (
      <PlayerIdentityFadeRule />
    ) : dividerVariant === 'none' ? null : (
      <div className="mt-3 h-px w-full bg-[#FFFFFF24]" />
    );

  return (
    <div className={identityCardClass}>
      {playerName ? (
        <p className="text-[15px] leading-none font-bold uppercase sm:text-[16px]">
          {playerName}
        </p>
      ) : null}
      {divider}
      {playerTeam ? <p className={lineClass}>{playerTeam}</p> : null}
      {playerRole ? (
        <p
          className={
            secondaryTone === 'accent'
              ? 'mt-2 text-[13px] leading-none sm:text-[14px]'
              : 'mt-2 text-[13px] leading-none font-medium sm:text-[14px]'
          }
        >
          {playerRole}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Gradient divider used beside identity on career-style cards.
 */
export function PlayerIdentityFadeRule() {
  return (
    <div className="mt-3 h-px w-full bg-gradient-to-r from-[#FFFFFF30] to-[#FFFFFF00]" />
  );
}
