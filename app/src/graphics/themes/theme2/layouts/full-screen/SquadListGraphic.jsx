/**
 * Full-screen squad grid — theme3 BattingSquadCore look for both BATTING_SQUAD and BOWLING_SQUAD
 * (same chrome for both, matching theme1). Theme2 extras: C/WK badges, optional RRR.
 */
import { cn } from '@/lib/utils';

import { colors, fsSquad } from '../../config';
import { DISPLAY_FONT, FSStage, PlayerAvatarImage, ROW_ANIMATE_IN, UI_FONT } from '../../primitives';
import { colorHaloShadow } from '../../visualEffects';
import { FsPageHeader } from '../shared/FsPageHeader';
import { fsFont } from '../shared/fsTypographyStyles';

const CARD_WIDTH = 240;
const SQUAD_PLAYERS_PER_ROW = 6;
const SQUAD_ROW_BASE_DELAY_MS = 0;
const SQUAD_PLAYER_STAGGER_MS = 70;

const GOLD_BADGE = `linear-gradient(180deg, ${colors.gold}, ${colors.goldDark})`;

const squadPlayerNameClass = cn(
  'block w-full overflow-hidden text-ellipsis whitespace-nowrap font-bold tracking-[0.03em] text-white uppercase',
  DISPLAY_FONT,
);

/** @param {number} index */
function getSquadPlayerDelay(index) {
  return SQUAD_ROW_BASE_DELAY_MS + index * SQUAD_PLAYER_STAGGER_MS;
}

function RoleBadge({ label, className, fontSize }) {
  return (
    <span
      className={cn('absolute grid size-[34px] place-items-center rounded-full font-extrabold', DISPLAY_FONT, className)}
      style={{
        background: GOLD_BADGE,
        color: colors.badgeText,
        ...fsFont(fontSize),
      }}
    >
      {label}
    </span>
  );
}

function SquadPlayerCard({ player, index }) {
  const { name, role, avatarUrl, captain, wicketKeeper } = player;

  return (
    <article
      className={cn('flex flex-col items-center gap-2.5', ROW_ANIMATE_IN)}
      style={{ width: CARD_WIDTH, animationDelay: `${getSquadPlayerDelay(index)}ms` }}
    >
      <div className="relative w-full overflow-hidden rounded-md" style={{ aspectRatio: '1 / 1' }}>
        <PlayerAvatarImage src={avatarUrl} alt={name} fit="contain-bottom" />
        {wicketKeeper ? <RoleBadge label="WK" className="top-2 left-2.5 z-[2]" fontSize={fsSquad.roleBadgeSm} /> : null}
        {captain ? <RoleBadge label="C" className="top-2 right-2.5 z-[2]" fontSize={fsSquad.captainBadge} /> : null}
      </div>

      <div
        className="flex w-full items-center justify-center rounded-lg border border-white/14 px-2.5 py-2.5 text-center"
        style={{ minHeight: 44, background: colors.panelPlayer }}
      >
        <span className={squadPlayerNameClass} style={fsFont(fsSquad.playerName)}>
          {name}
        </span>
      </div>

      {role ? (
        <span className={cn('font-semibold tracking-[0.06em] text-white uppercase', UI_FONT)} style={fsFont(fsSquad.subLabel)}>
          {role}
        </span>
      ) : null}
    </article>
  );
}

function SquadRow({ players, startIndex }) {
  return (
    <div className="flex w-full items-start justify-center gap-[26px]">
      {players.map((player, index) => (
        <SquadPlayerCard key={player.id ?? `${player.name}-${startIndex + index}`} player={player} index={startIndex + index} />
      ))}
    </div>
  );
}

/** Theme2-only footer — not in theme3 squad. */
function RequiredRunRateBand({ value }) {
  if (value == null || value === '') return null;

  return (
    <div
      className="absolute right-16 bottom-10 left-16 z-[3] flex h-[68px] items-center justify-center rounded-xl"
      style={{
        background: `linear-gradient(100deg, ${colors.gold}, ${colors.goldDark})`,
        boxShadow: colorHaloShadow(colors.gold),
      }}
    >
      <span
        className={cn('font-extrabold tracking-[0.06em] whitespace-nowrap uppercase', DISPLAY_FONT)}
        style={{ color: colors.badgeText, ...fsFont(fsSquad.goldBand) }}
      >
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
  const top = players.slice(0, SQUAD_PLAYERS_PER_ROW);
  const bottom = players.slice(SQUAD_PLAYERS_PER_ROW);
  const title = data.title ?? team?.fullName ?? team?.displayName ?? '';
  const code = team?.code ?? data.teamCode?.toUpperCase?.() ?? '';
  const accent = data.accent ?? team?.color ?? undefined;
  const hasRrr = data.requiredRR != null && data.requiredRR !== '';

  if (!players.length) return null;

  return (
    <FSStage>
      <FsPageHeader
        title={title}
        sub={data.sub}
        size="md"
        logoUrl={data.logoUrl ?? team?.logoUrl}
        logoCode={code}
        logoAlt={title}
        logoVariant="team"
        logoAccent={accent}
        logoTeam={team}
      />

      <div
        className="absolute right-12 left-12 z-[1] mx-auto flex max-w-[1680px] flex-col items-center justify-center gap-7"
        style={{ top: 248, bottom: hasRrr ? 140 : 70 }}
      >
        {top.length ? <SquadRow players={top} startIndex={0} /> : null}
        {bottom.length ? <SquadRow players={bottom} startIndex={SQUAD_PLAYERS_PER_ROW} /> : null}
      </div>

      <RequiredRunRateBand value={data.requiredRR} />
    </FSStage>
  );
}
