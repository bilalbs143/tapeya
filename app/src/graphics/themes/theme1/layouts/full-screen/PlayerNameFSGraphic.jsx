/**
 * Player name full-screen card — shared by batsman and bowler NAME_FS controllers.
 */
import { resolveBroadcastNameParts } from '@tapeya/graphics-core/domain/playerNameResolver';

import { cn } from '@/lib/utils';

import { fsPill, fsPlayerCard, fsSummaryPanel } from '../../config';
import { FSStage, GlowPanel, PlayerAvatarImage, TeamLogoOrCrest, UI_FONT } from '../../primitives';
import { FsStatColumn } from '../shared/FsStatColumn';
import { resolveFsStatLayout } from '../shared/fsStatLayout';
import { FS_HEADER_SUB, FS_PLAYER_FIRST, FS_PLAYER_LAST, FS_PLAYER_ROLE, fsFont } from '../shared/fsTypographyStyles';

const FS_AVATAR_W = 560;
const FS_AVATAR_H = 760;
const FS_AVATAR_STAT_GAP = 40;
const FS_PANEL_W = 560;
const FS_PANEL_GAP = 40;
const FS_CREST_SIZE = 210;
const FS_STAT_BASE_DELAY_MS = 120;
const FS_STAT_STAGGER_MS = 80;

const teamCodeClass = cn('font-semibold leading-none tracking-[0.14em] uppercase', UI_FONT);

const careerLabelClass = cn('mt-4 font-medium text-[var(--text-secondary)]', UI_FONT);

const dividerClass = cn('my-[22px] mb-[18px] h-px', 'bg-[linear-gradient(90deg,rgba(120,140,255,0.6),transparent)]');

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
  const { firstName, lastName } = resolveBroadcastNameParts(player);
  return {
    firstName,
    lastName,
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
      {sub ? (
        <p
          className={cn('absolute top-14 right-16 left-16 z-[3] text-center', FS_HEADER_SUB)}
          style={fsFont(fsSummaryPanel.headerSub)}
        >
          {sub}
        </p>
      ) : null}
      <div className="absolute inset-0 flex items-center justify-center">
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
              <FsStatColumn statFields={statFields} statValues={statValues} statLayout={statLayout} getDelay={getStatDelay} />
            )}
          </div>

          <div className="flex flex-col justify-center gap-[26px]" style={{ width: FS_PANEL_W }}>
            <TeamMark team={team} accent={accent} logoUrl={logoUrl} />

            <GlowPanel radius={20} accent={accent} className="w-full px-[38px] py-[34px]">
              {topLabel ? (
                <div className="mb-5">
                  <p
                    className={cn('font-extrabold tracking-[0.18em] uppercase', UI_FONT)}
                    style={{ color: accent, ...fsFont(fsPill.caption) }}
                  >
                    {topLabel}
                  </p>
                  <div className="mt-[10px] h-px" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
                </div>
              ) : null}
              <div className={FS_PLAYER_FIRST} style={fsFont(fsPlayerCard.firstName)}>
                {firstName}
              </div>
              {lastName ? (
                <div className={FS_PLAYER_LAST} style={fsFont(fsPlayerCard.lastName)}>
                  {lastName}
                </div>
              ) : null}
              <div className={dividerClass} />
              {team?.code ? (
                <div className={teamCodeClass} style={{ color: accent, ...fsFont(fsPlayerCard.teamCode) }}>
                  {team.code}
                </div>
              ) : null}
              {detail ? (
                <div className={cn(FS_PLAYER_ROLE, 'mt-0.5')} style={fsFont(fsPlayerCard.role)}>
                  {detail}
                </div>
              ) : null}
              <div className={careerLabelClass} style={fsFont(fsPlayerCard.careerLabel)}>
                {careerLabel}
              </div>
            </GlowPanel>
          </div>
        </div>
      </div>
    </FSStage>
  );
}
