/**
 * Shared scoreboard header used by lower-third graphic components.
 *
 * Props — all optional, fall back gracefully when session.context is not yet set:
 *   battingTeam   { name, shortCode, logoUrl, score, overs }
 *   bowlingTeam   { name, shortCode, logoUrl }
 *   batters       [{ name, runs, balls, onStrike }, ...] — use {@link normalizeBatters} upstream
 *   bowler        { name, figures, overs }
 *   currentOverBalls  ["6", "2", "W", ...]
 *
 * Consumers place children after importing this and wrapping with their own
 * outer layout — or use the exported style tokens directly.
 */
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

const defaultTeamLogo = `${CLOUDFRONT_APP_BASE}/images/standard/team-logo.png`;
const controllerFrameBg = `${CLOUDFRONT_APP_BASE}/images/background/controller-frame.png`;

// eslint-disable-next-line react-refresh/only-export-components
export const rightHalfStyle = {
  backgroundImage: `url(${controllerFrameBg})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};

// eslint-disable-next-line react-refresh/only-export-components
export const separatorStyle = {
  background: 'linear-gradient(180deg, #080807 0%, #FFFFFF 50%, #080807 100%)',
};

// eslint-disable-next-line react-refresh/only-export-components
export const batterSeparatorStyle = {
  background: 'linear-gradient(90deg, rgba(8,8,7,1) 0%, rgba(255,255,255,0.95) 50%, rgba(8,8,7,1) 100%)',
};

/** Truncated batter name + gold asterisk when on strike (synced from graphic context). */
export function BatterNameLabel({ name, onStrike, className = '' }) {
  if (name == null || String(name).trim() === '') {
    return null;
  }
  return (
    <span
      className={`inline-flex max-w-full min-w-0 items-baseline gap-0 ${className}`.trim()}
      title={onStrike ? 'On strike' : undefined}
    >
      <span className="min-w-0 truncate">{name}</span>
      {onStrike ? (
        <span className="text-brand shrink-0 leading-none font-black" aria-hidden>
          *
        </span>
      ) : null}
    </span>
  );
}

/**
 * Lightning badge on free-hit ball chips (same markup as BallsTab / OverStrip / backoffice).
 */
export function FreeHitMicroBadge() {
  return (
    <span
      className="bg-brand text-ink absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[7px] font-black"
      title="Free Hit"
      aria-label="Free Hit delivery"
    >
      ⚡
    </span>
  );
}

/**
 * Returns Tailwind classes for a ball chip, matching the app's BallsTab colour
 * scheme exactly.  Free-hit deliveries end with "*" (e.g. "4*") and receive a
 * gold ring plus the FreeHitMicroBadge overlay in the caller.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function ballChipClass(ball) {
  const isFreeHit = typeof ball === 'string' && ball.endsWith('*');
  const key = isFreeHit ? ball.slice(0, -1) : ball;
  const ring = isFreeHit ? ' ring-2 ring-brand' : '';

  if (key === 'W') return `bg-red-600 text-white${ring}`;
  if (key === 'RH') return `bg-[#6B7280] text-white${ring}`;
  if (key === '4') return `bg-brand text-ink${ring}`;
  if (key === '6') return `bg-[#A855F7] text-white${ring}`;
  if (key === '0') return `border border-[#3B3B35] bg-surface text-white/60${ring}`;
  if (/(WD|NB|LB|B)$/.test(key)) return `bg-[#1E1E1C] border border-brand text-brand${ring}`;
  return `bg-brand text-ink${ring}`;
}

/**
 * Left block — team logo, short code, over count, score, batters side by side.
 * Rendered identically across all LT scoreboard components.
 */
/** “This over” ball chips — compact row for At Stage (and similar). */
export function AtStageOverChips({ balls = [], align = 'start' }) {
  if (!balls?.length) {
    return null;
  }
  const end = align === 'end';
  return (
    <div className={`mt-0.5 flex w-full min-w-0 flex-col gap-0.5 sm:mt-1 ${end ? 'items-end' : 'items-start'}`}>
      <span
        className={`text-[5px] font-semibold tracking-wide text-[#9CA3AF] uppercase sm:text-[9px] ${end ? 'text-right' : ''}`}
      >
        This over
      </span>
      <div className={`flex max-w-full flex-wrap gap-0.5 sm:gap-1 ${end ? 'justify-end' : 'justify-start'}`}>
        {balls.map((ball, index) => {
          const isFreeHit = typeof ball === 'string' && ball.endsWith('*');
          const displayLabel = isFreeHit ? ball.slice(0, -1) : ball;
          return (
            <span key={index} className="relative inline-block shrink-0">
              <span
                className={`inline-flex h-[14px] min-w-[14px] items-center justify-center rounded-md px-[3px] text-[7px] leading-none font-bold sm:h-[22px] sm:min-w-[22px] sm:rounded-md sm:px-1 sm:text-[11px] ${ballChipClass(ball)}`}
              >
                {displayLabel === '0' ? '•' : displayLabel}
              </span>
              {isFreeHit ? <FreeHitMicroBadge /> : null}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Right column for At Stage — first innings at the same legal-ball depth as
 * the chase (mirrors team, score, overs, batters, bowler, current over).
 */
export function ScoreboardAtStageMirror({
  battingTeam = {},
  batters = [],
  bowler = {},
  currentOverBalls = [],
  inningsLabel = '',
}) {
  const battingLogo = battingTeam.logoUrl ?? defaultTeamLogo;
  const batter0 = batters[0] ?? null;
  const batter1 = batters[1] ?? null;

  return (
    <div className="flex max-w-[48%] min-w-0 flex-1 flex-col items-end gap-0.5 sm:max-w-none sm:gap-1">
      {inningsLabel ? (
        <p className="text-brand m-0 max-w-full truncate text-right text-[5px] leading-none font-bold uppercase sm:text-[10px]">
          {inningsLabel}
        </p>
      ) : null}

      <div className="flex w-full min-w-0 flex-row-reverse items-center gap-0.5 sm:gap-3">
        <div className="flex shrink-0 flex-row-reverse items-center gap-1 sm:gap-3 sm:pl-3">
          <img
            src={battingLogo}
            alt={battingTeam.name || 'Team'}
            className="h-8 w-8 shrink-0 rounded-full object-cover sm:h-14 sm:w-14"
          />
          <div className="text-right">
            <p className="text-brand text-[11px] leading-none font-extrabold sm:text-[30px]">
              {battingTeam.shortCode || battingTeam.name || '—'}
            </p>
            <p className="mt-0.5 text-[8px] leading-none text-[#E2E2E2] sm:mt-1 sm:text-[14px]">
              {battingTeam.overs ? `${battingTeam.overs} OVER` : ''}
            </p>
          </div>
          <p className="mr-1 shrink-0 text-[11px] leading-none font-extrabold text-white sm:mr-4 sm:text-[28px]">
            {battingTeam.score ? battingTeam.score : '—'}
          </p>
        </div>

        <div className="mx-0.5 w-px shrink-0 self-stretch sm:mx-2" style={separatorStyle} />

        <div className="flex min-w-0 flex-1 flex-col items-end justify-center">
          <div className="flex items-center px-0.5 sm:hidden">
            <div className="text-right">
              {batter0 && (
                <div className="flex flex-row-reverse items-center gap-1 leading-none">
                  <span className="text-brand text-[11px] font-bold">{batter0.runs}</span>
                  <span className="text-brand text-[9px] font-bold">{batter0.balls}</span>
                  <span className="max-w-[36px] truncate text-[8px] font-medium text-[#E8E8E8]">
                    <BatterNameLabel
                      name={batter0.name}
                      onStrike={!!batter0.onStrike}
                      className="text-[8px] font-medium text-[#E8E8E8]"
                    />
                  </span>
                </div>
              )}
              {batter1 && (
                <>
                  <div className="my-0.5 ml-auto h-px w-[42px]" style={batterSeparatorStyle} />
                  <div className="flex flex-row-reverse items-center gap-1 leading-none">
                    <span className="text-brand text-[11px] font-bold">{batter1.runs}</span>
                    <span className="text-brand text-[9px] font-bold">{batter1.balls}</span>
                    <span className="max-w-[36px] truncate text-[8px] font-medium text-[#E8E8E8]">
                      <BatterNameLabel
                        name={batter1.name}
                        onStrike={!!batter1.onStrike}
                        className="text-[8px] font-medium text-[#E8E8E8]"
                      />
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="hidden w-full flex-col items-end px-1 sm:flex sm:px-2">
            {batter0 && (
              <div className="flex w-full flex-row-reverse items-center gap-2 leading-none sm:gap-3">
                <span className="text-brand text-[24px] font-bold">{batter0.runs}</span>
                <span className="text-brand text-[16px] font-bold">{batter0.balls}</span>
                <span className="max-w-[72px] truncate text-right text-[14px] font-medium text-[#E8E8E8]">
                  <BatterNameLabel
                    name={batter0.name}
                    onStrike={!!batter0.onStrike}
                    className="text-[14px] font-medium text-[#E8E8E8]"
                  />
                </span>
              </div>
            )}
            {batter1 && (
              <>
                <div className="my-1 mr-0 h-px w-[72px]" style={batterSeparatorStyle} />
                <div className="flex w-full flex-row-reverse items-center gap-2 leading-none sm:gap-3">
                  <span className="text-brand text-[24px] font-bold">{batter1.runs}</span>
                  <span className="text-brand text-[16px] font-bold">{batter1.balls}</span>
                  <span className="max-w-[72px] truncate text-right text-[14px] font-medium text-[#E8E8E8]">
                    <BatterNameLabel
                      name={batter1.name}
                      onStrike={!!batter1.onStrike}
                      className="text-[14px] font-medium text-[#E8E8E8]"
                    />
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {bowler?.name ? (
        <p className="m-0 max-w-full truncate text-right text-[6px] leading-tight text-[#C4C4C4] sm:text-[12px]">
          {bowler.name} · {bowler.figures} · {bowler.overs}
        </p>
      ) : null}

      <AtStageOverChips balls={currentOverBalls} align="end" />
    </div>
  );
}

export function ScoreboardLeft({ battingTeam = {}, batters = [] }) {
  const battingLogo = battingTeam.logoUrl ?? defaultTeamLogo;
  const batter0 = batters[0] ?? null;
  const batter1 = batters[1] ?? null;

  return (
    <>
      {/* Team logo + code + score */}
      <div className="flex items-center gap-1 pr-1.5 sm:gap-3 sm:pr-5">
        <img
          src={battingLogo}
          alt={battingTeam.name || 'Batting team'}
          className="h-8 w-8 rounded-full object-cover sm:h-14 sm:w-14"
        />
        <div>
          <p className="text-brand text-[11px] leading-none font-extrabold sm:text-[30px]">
            {battingTeam.shortCode || battingTeam.name || '—'}
          </p>
          <p className="mt-0.5 text-[8px] leading-none text-[#E2E2E2] sm:mt-1 sm:text-[14px]">
            {battingTeam.overs ? `${battingTeam.overs} OVER` : ''}
          </p>
        </div>
        <p className="ml-1 text-[11px] leading-none font-extrabold text-white sm:ml-6 sm:text-[28px]">
          {battingTeam.score || ''}
        </p>
      </div>

      <div className="mx-1 w-px self-stretch sm:mx-3" style={separatorStyle} />

      {/* Mobile batters */}
      <div className="flex items-center px-1 sm:hidden">
        <div>
          {batter0 && (
            <div className="flex items-center gap-1 leading-none">
              <span className="w-[30px] text-[8px] font-medium text-[#E8E8E8]">
                <BatterNameLabel
                  name={batter0.name}
                  onStrike={!!batter0.onStrike}
                  className="w-full text-[8px] font-medium text-[#E8E8E8]"
                />
              </span>
              <span className="text-brand text-[11px] font-bold">{batter0.runs}</span>
              <span className="text-brand text-[9px] font-bold">{batter0.balls}</span>
            </div>
          )}
          {batter1 && (
            <>
              <div className="my-0.5 h-px w-[30px]" style={batterSeparatorStyle} />
              <div className="flex items-center gap-1 leading-none">
                <span className="w-[30px] text-[8px] font-medium text-[#E8E8E8]">
                  <BatterNameLabel
                    name={batter1.name}
                    onStrike={!!batter1.onStrike}
                    className="w-full text-[8px] font-medium text-[#E8E8E8]"
                  />
                </span>
                <span className="text-brand text-[11px] font-bold">{batter1.runs}</span>
                <span className="text-brand text-[9px] font-bold">{batter1.balls}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Desktop batters */}
      <div className="hidden items-center px-3 sm:flex sm:px-6">
        <div>
          {batter0 && (
            <div className="flex items-center gap-3 leading-none">
              <span className="w-[72px] text-[14px] font-medium text-[#E8E8E8]">
                <BatterNameLabel
                  name={batter0.name}
                  onStrike={!!batter0.onStrike}
                  className="w-full text-[14px] font-medium text-[#E8E8E8]"
                />
              </span>
              <span className="text-brand text-[24px] font-bold">{batter0.runs}</span>
              <span className="text-brand text-[16px] font-bold">{batter0.balls}</span>
            </div>
          )}
          {batter1 && (
            <>
              <div className="my-1 h-px w-[72px]" style={batterSeparatorStyle} />
              <div className="flex items-center gap-3 leading-none">
                <span className="w-[72px] text-[14px] font-medium text-[#E8E8E8]">
                  <BatterNameLabel
                    name={batter1.name}
                    onStrike={!!batter1.onStrike}
                    className="w-full text-[14px] font-medium text-[#E8E8E8]"
                  />
                </span>
                <span className="text-brand text-[24px] font-bold">{batter1.runs}</span>
                <span className="text-brand text-[16px] font-bold">{batter1.balls}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/** Bowling team short code + logo, used on the far right of LT scorecards. */
export function BowlingTeamBadge({ bowlingTeam = {} }) {
  const bowlingLogo = bowlingTeam.logoUrl ?? defaultTeamLogo;
  return (
    <>
      <div className="flex items-center pr-1 sm:pr-10">
        <img
          src={bowlingLogo}
          alt={bowlingTeam.name || 'Bowling team'}
          className="h-8 w-8 rounded-full object-cover sm:h-14 sm:w-14"
        />
      </div>
    </>
  );
}

/** Bowler name + figures + over balls — right-side bowling block. */
export function BowlerBlock({ bowler = {}, currentOverBalls = [] }) {
  return (
    <div className="flex items-center pl-0.5 sm:pl-6">
      <div>
        <div className="mb-0.5 flex items-end justify-between gap-2 font-medium sm:mb-2 sm:gap-6">
          <div>
            <p className="text-[7px] leading-none text-[#E8E8E8] sm:text-[14px]">{bowler.name}</p>
            <div className="mt-0.5 h-px w-[28px] sm:mt-2 sm:w-[72px]" style={batterSeparatorStyle} />
          </div>
          <div className="mb-1 flex items-baseline gap-1 sm:gap-4">
            <p className="text-[7px] leading-none text-[#E8E8E8] sm:text-[18px]">{bowler.figures}</p>
            <p className="text-[7px] leading-none text-[#E8E8E8] sm:text-[14px]">{bowler.overs}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-0.5 sm:gap-1">
          {currentOverBalls.map((ball, index) => {
            const isFreeHit = typeof ball === 'string' && ball.endsWith('*');
            const displayLabel = isFreeHit ? ball.slice(0, -1) : ball;
            return (
              <div key={index} className="relative shrink-0">
                <span
                  className={`inline-flex h-[14px] min-w-[14px] items-center justify-center rounded-full px-[3px] text-[8px] leading-none font-bold sm:h-[24px] sm:min-w-[24px] sm:px-[5px] sm:text-[12px] ${ballChipClass(ball)}`}
                >
                  {displayLabel}
                </span>
                {isFreeHit ? <FreeHitMicroBadge /> : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
