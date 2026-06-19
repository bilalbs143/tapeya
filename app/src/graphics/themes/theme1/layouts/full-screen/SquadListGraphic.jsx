/**
 * Full-screen squad list — shared by BATTING_SQUAD and BOWLING_SQUAD.
 */
import { cn } from '@/lib/utils';

import { colors } from '../../config';
import { accentMix, Crest, DISPLAY_FONT, FSStage, PlayerAvatarImage, ROW_ANIMATE_IN, UI_FONT } from '../../primitives';

const SQUAD_GOLD = colors.gold;
const SQUAD_GOLD_DARK = colors.goldDark;
const BADGE_TEXT = colors.badgeText;

const SQUAD_AVATAR_SIZE = 190;
const SQUAD_PLAYER_MAX_WIDTH = 270;
const SQUAD_HEADER_CREST_SIZE = 104;
const SQUAD_ROW_BASE_DELAY_MS = 120;
const SQUAD_PLAYER_STAGGER_MS = 70;
const SQUAD_PLAYERS_PER_ROW = 6;

const squadTitleClass = cn(
  'm-0 text-[62px] font-extrabold leading-[0.96] tracking-[0.01em] text-white uppercase',
  DISPLAY_FONT,
  '[text-shadow:0_2px_18px_rgba(0,0,0,0.5)]',
);

const headerSubClass = cn('mt-2 mb-0 text-[26px] font-semibold tracking-[0.06em] text-[var(--muted)] uppercase', UI_FONT);

const squadPlayerNameClass = cn('text-[30px] font-extrabold text-white uppercase', DISPLAY_FONT);

const squadRoleClass = cn(
  'mt-2 text-[18px] font-semibold tracking-[0.1em] text-[var(--muted)] uppercase',
  'whitespace-nowrap',
  UI_FONT,
);

const captainBadgeClass = cn('text-[22px] font-extrabold', DISPLAY_FONT);

const rrrBandTextClass = cn('text-[34px] font-extrabold tracking-[0.06em] uppercase', 'whitespace-nowrap', DISPLAY_FONT);

/** @param {number} rowStartDelay @param {number} index */
function getSquadPlayerDelay(rowStartDelay, index) {
  return rowStartDelay + index * SQUAD_PLAYER_STAGGER_MS;
}

function SquadAvatarSlot({ src, alt = 'Player avatar', size = SQUAD_AVATAR_SIZE }) {
  return (
    <div className="relative flex items-end justify-center overflow-hidden" style={{ width: size, height: size }}>
      <PlayerAvatarImage src={src} alt={alt} fit="contain-bottom" rounded />
    </div>
  );
}

function SquadRoleBadge({ label, className, style }) {
  return (
    <span
      className={cn('absolute grid size-[38px] place-items-center rounded-full', captainBadgeClass, className)}
      style={{ ...style, color: BADGE_TEXT }}
    >
      {label}
    </span>
  );
}

function SquadPlayerCard({ player, accent, rowStartDelay, index }) {
  const { name, role, captain, wicketKeeper, avatarUrl } = player;
  const badgeStyle = {
    background: `linear-gradient(180deg, ${SQUAD_GOLD}, ${SQUAD_GOLD_DARK})`,
  };

  return (
    <div
      className={cn('flex flex-col items-center', ROW_ANIMATE_IN, 'max-w-[270px] flex-[0_1_270px]')}
      style={{
        maxWidth: SQUAD_PLAYER_MAX_WIDTH,
        animationDelay: `${getSquadPlayerDelay(rowStartDelay, index)}ms`,
      }}
    >
      <div className="relative">
        <SquadAvatarSlot src={avatarUrl} alt={name} />
        {wicketKeeper ? <SquadRoleBadge label="WK" className="top-2 left-3.5 text-[16px]" style={badgeStyle} /> : null}
        {captain ? <SquadRoleBadge label="C" className="top-2 right-3.5" style={badgeStyle} /> : null}
      </div>

      <div
        className="mt-1.5 w-full rounded-[10px] px-2.5 py-2.5 text-center"
        style={{
          background: `linear-gradient(180deg, ${accentMix(accent, 19)}, rgba(14,19,32,0.7))`,
          border: `1px solid ${accentMix(accent, 27)}`,
        }}
      >
        <span className={squadPlayerNameClass}>{name}</span>
      </div>

      <span className={squadRoleClass}>{role}</span>
    </div>
  );
}

function SquadRow({ players, accent, startDelay }) {
  return (
    <div className="flex justify-center gap-[26px]">
      {players.map((player, index) => (
        <SquadPlayerCard
          key={player.id ?? `${player.name}-${index}`}
          player={player}
          accent={accent}
          rowStartDelay={startDelay}
          index={index}
        />
      ))}
    </div>
  );
}

function SquadHeader({ title, sub, accent, logoUrl, team }) {
  return (
    <div className="absolute top-14 right-16 left-16 z-[3] flex items-start gap-7">
      {logoUrl ? (
        <div className="relative shrink-0" style={{ width: SQUAD_HEADER_CREST_SIZE, height: SQUAD_HEADER_CREST_SIZE }}>
          <img src={logoUrl} alt={title} draggable={false} className="block size-full object-contain" />
        </div>
      ) : (
        <Crest team={team} size={SQUAD_HEADER_CREST_SIZE} accent={accent} />
      )}

      <div className="min-w-0 flex-1 pt-1">
        <h2 className={squadTitleClass}>{title}</h2>
        {sub ? <p className={headerSubClass}>{sub}</p> : null}
      </div>
    </div>
  );
}

function RequiredRunRateBand({ value }) {
  if (!value) return null;

  return (
    <div
      className="absolute right-[70px] bottom-10 left-[70px] grid h-[68px] place-items-center rounded-xl"
      style={{
        background: `linear-gradient(100deg, ${SQUAD_GOLD}, ${SQUAD_GOLD_DARK})`,
        boxShadow: `0 0 calc(20px * var(--glow)) ${SQUAD_GOLD}33`,
      }}
    >
      <span className={rrrBandTextClass} style={{ color: BADGE_TEXT }}>
        REQUIRED RUN RATE : {value}
      </span>
    </div>
  );
}

/**
 * @param {{ data: object, teams: Record<string, object> }} props
 */
export function SquadListGraphic({ data, teams }) {
  const team = teams[data.teamCode];
  const players = (data.players ?? []).map((player) => ({
    ...player,
    avatarUrl: player.avatarUrl ?? data.defaultAvatarUrl,
  }));
  const accent = data.accent ?? team?.color ?? colors.accentA;
  const top = players.slice(0, SQUAD_PLAYERS_PER_ROW);
  const bottom = players.slice(SQUAD_PLAYERS_PER_ROW);
  const title = data.title ?? team?.fullName ?? team?.displayName ?? '';

  if (!players.length) return null;

  return (
    <FSStage>
      <SquadHeader title={title} sub={data.sub} accent={accent} logoUrl={data.logoUrl} team={team} />

      <div className="absolute top-[250px] right-[70px] bottom-[150px] left-[70px] flex flex-col justify-center gap-[26px]">
        <SquadRow players={top} accent={accent} startDelay={SQUAD_ROW_BASE_DELAY_MS} />
        <SquadRow
          players={bottom}
          accent={accent}
          startDelay={SQUAD_ROW_BASE_DELAY_MS + SQUAD_PLAYERS_PER_ROW * SQUAD_PLAYER_STAGGER_MS}
        />
      </div>

      <RequiredRunRateBand value={data.requiredRR} />
    </FSStage>
  );
}
