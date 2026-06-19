/**
 * Player name full-screen card — shared by batsman and bowler NAME_FS controllers.
 */
import { cn } from '@/lib/utils';

import {
  DISPLAY_FONT,
  FSStage,
  GlowPanel,
  Pill,
  PlayerAvatarImage,
  ROW_ANIMATE_IN,
  TeamLogoOrCrest,
  UI_FONT,
} from '../../primitives';
import { resolveFsStatLayout } from '../shared/fsStatLayout';
import { StatTile } from '../shared/StatTile';

const FS_AVATAR_W = 560;
const FS_AVATAR_H = 760;
const FS_AVATAR_STAT_GAP = 40;
const FS_PANEL_W = 560;
const FS_PANEL_GAP = 40;
const FS_CREST_SIZE = 210;
const FS_STAT_BASE_DELAY_MS = 120;
const FS_STAT_STAGGER_MS = 80;

const firstNameClass = cn('text-[46px] font-semibold leading-none tracking-[0.02em] text-[var(--text)] uppercase', DISPLAY_FONT);

const lastNameClass = cn(
  'text-[92px] font-extrabold leading-[0.95] tracking-[0.01em] text-white uppercase',
  DISPLAY_FONT,
  '[text-shadow:0_0_calc(20px*var(--glow))_rgba(120,140,255,0.5)]',
);

const dividerClass = cn('my-[22px] mb-[18px] h-px', 'bg-[linear-gradient(90deg,rgba(120,140,255,0.6),transparent)]');

const teamCodeClass = cn('text-2xl font-semibold leading-none tracking-[0.14em] uppercase', UI_FONT);

const roleClass = cn('mt-0.5 text-[38px] font-bold leading-[1.05] text-white capitalize', DISPLAY_FONT);

const careerLabelClass = cn('mt-4 text-2xl font-medium text-[var(--muted)]', UI_FONT);

const headerSubClass = cn('m-0 text-[26px] font-semibold tracking-[0.06em] text-[var(--muted)] uppercase', UI_FONT);

/** @param {number} index */
function getStatDelay(index) {
  return FS_STAT_BASE_DELAY_MS + index * FS_STAT_STAGGER_MS;
}

function resolvePlayer(player, teams) {
  if (!player?.name && !player?.firstName) return null;

  const team = player.teamCode ? teams[player.teamCode] : null;
  return {
    player,
    team,
    accent: team?.color ?? 'var(--accentA)',
  };
}

function resolvePlayerContent(player) {
  if (player.firstName) {
    return {
      firstName: player.firstName,
      lastName: player.lastName ?? '',
      detail: player.role ?? player.tournamentName ?? '',
    };
  }

  const parts = (player.name ?? '').trim().split(/\s+/);
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
    detail: player.role ?? player.tournamentName ?? '',
  };
}

function PlayerAvatarSlot({ src, alt = 'Player avatar', width = FS_AVATAR_W, height = FS_AVATAR_H }) {
  return (
    <div className="relative shrink-0 overflow-hidden" style={{ width, height }}>
      <PlayerAvatarImage src={src} alt={alt} fit="cover-top" />
    </div>
  );
}

function TeamMark({ team, accent, logoUrl }) {
  if (!team && !logoUrl) return null;

  return <TeamLogoOrCrest logoUrl={logoUrl} team={team} accent={accent} size={FS_CREST_SIZE} borderPulseOrder={1} />;
}

/**
 * @param {{
 *   player: object,
 *   teams: Record<string, object>,
 *   statFields?: Array<{ key: string, label: string }>,
 *   statValues?: Record<string, string | number>,
 *   careerLabel?: string,
 *   panelDetail?: string,
 *   panelDetail?: string,
 *   topLabel?: string,
 *   sub?: string,
 * }} props
 */
export function PlayerNameFSGraphic({
  player,
  teams,
  statFields = [],
  statValues = {},
  careerLabel = 'Match Career',
  panelDetail,
  topLabel,
  sub,
}) {
  const resolved = resolvePlayer(player, teams);
  if (!resolved) return null;

  const { player: resolvedPlayer, team, accent } = resolved;
  const { firstName, lastName, detail: resolvedDetail } = resolvePlayerContent(resolvedPlayer);
  const detail = panelDetail ?? resolvedDetail;
  const logoUrl = resolvedPlayer.logoUrl ?? team?.logoUrl;
  const avatarUrl = resolvedPlayer.avatarUrl;
  const playerName = resolvedPlayer.name ?? [firstName, lastName].filter(Boolean).join(' ');

  const hasStats = statFields.length > 0;
  const statLayout = resolveFsStatLayout(statFields.length);
  const clusterHeight = FS_AVATAR_H;

  return (
    <FSStage>
      {sub ? <p className={cn('absolute top-14 right-16 left-16 z-[3] text-center', headerSubClass)}>{sub}</p> : null}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-10">
        {topLabel ? <Pill variant="caption">{topLabel}</Pill> : null}
        <div className="flex items-center" style={{ gap: FS_PANEL_GAP }}>
          <div
            className="flex items-stretch"
            style={{
              height: clusterHeight,
              gap: hasStats ? FS_AVATAR_STAT_GAP : 0,
            }}
          >
            <PlayerAvatarSlot src={avatarUrl} alt={playerName} />

            {hasStats && (
              <div className="flex h-full flex-col justify-center" style={{ height: statLayout.columnH, gap: statLayout.gap }}>
                {statFields.map((field, index) => (
                  <div key={field.key} className={ROW_ANIMATE_IN} style={{ animationDelay: `${getStatDelay(index)}ms` }}>
                    <StatTile
                      label={field.label}
                      value={statValues[field.key]}
                      accent={accent}
                      height={statLayout.tileH}
                      width={statLayout.tileW}
                      labelSize={statLayout.labelSize}
                      valueSize={statLayout.valueSize}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center gap-[26px]" style={{ width: FS_PANEL_W }}>
            <TeamMark team={team} accent={accent} logoUrl={logoUrl} />

            <GlowPanel radius={20} accent={accent} className="w-full px-[38px] py-[34px]">
              <div className={firstNameClass}>{firstName}</div>
              {lastName && <div className={lastNameClass}>{lastName}</div>}
              <div className={dividerClass} />
              {team?.code && (
                <div className={teamCodeClass} style={{ color: accent }}>
                  {team.code}
                </div>
              )}
              {detail && <div className={roleClass}>{detail}</div>}
              <div className={careerLabelClass}>{careerLabel}</div>
            </GlowPanel>
          </div>
        </div>
      </div>
    </FSStage>
  );
}
