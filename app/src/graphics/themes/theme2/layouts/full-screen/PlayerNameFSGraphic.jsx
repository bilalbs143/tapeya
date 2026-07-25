/**
 * Player name full-screen card — theme3 NameFS / MatchFS shell.
 * Shared by batsman and bowler NAME_FS / MATCH_FS / TOURNAMENT_FS.
 * Bowler and batsman share the same stage + wine panel chrome.
 */
import { cn } from '@/lib/utils';

import { resolveFsNameParts } from '../../adapters/_shared';
import { colors, fsPill, fsPlayerCard, fsSummaryPanel } from '../../config';
import { FSStage, PlayerAvatarImage, TeamLogoOrCrest, UI_FONT } from '../../primitives';
import { FsStatColumn } from '../shared/FsStatColumn';
import { resolveFsStatLayout } from '../shared/fsStatLayout';
import { FS_HEADER_SUB, FS_PLAYER_FIRST, FS_PLAYER_LAST, FS_PLAYER_ROLE, fsFont } from '../shared/fsTypographyStyles';

const FS_AVATAR_W = 560;
const FS_AVATAR_H = 760;
const FS_AVATAR_STAT_GAP = 40;
const FS_PANEL_W = 560;
const FS_PANEL_GAP = 40;
const FS_LOGO_SIZE = 120;
const FS_STAT_BASE_DELAY_MS = 120;
const FS_STAT_STAGGER_MS = 80;

/** Theme3 amber team code on identity card. */
const TEAM_CODE_COLOR = '#fde68a';

const teamCodeClass = cn('font-bold leading-none tracking-[0.14em] uppercase', UI_FONT);

const careerLabelClass = cn('mt-3 font-medium text-white/75', UI_FONT);

/** @param {number} index */
function getStatDelay(index) {
  return FS_STAT_BASE_DELAY_MS + index * FS_STAT_STAGGER_MS;
}

function resolvePlayer(player, teams) {
  if (!player?.name && !player?.firstName && !player?.lastName) return null;

  const team = player.teamCode ? teams[player.teamCode] : null;
  return {
    player,
    team,
    accent: team?.color ?? colors.accentA,
  };
}

function resolvePlayerContent(player) {
  if (player.firstName || player.lastName) {
    return {
      firstName: player.firstName ?? '',
      lastName: player.lastName ?? '',
      detail: player.role ?? player.tournamentName ?? '',
    };
  }
  const { firstName, lastName } = resolveFsNameParts(player);
  return {
    firstName,
    lastName,
    detail: player.role ?? player.tournamentName ?? '',
  };
}

function PlayerAvatarSlot({ src, alt = 'Player avatar', width = FS_AVATAR_W, height = FS_AVATAR_H }) {
  return (
    <div className="relative shrink-0 overflow-hidden rounded" style={{ width, height }}>
      <PlayerAvatarImage src={src} alt={alt} fit="cover-top" />
    </div>
  );
}

/** Square logo tile — session team color plate. */
function TeamLogoTile({ team, logoUrl, accent }) {
  if (!team && !logoUrl) return null;

  return (
    <TeamLogoOrCrest
      logoUrl={logoUrl}
      team={team}
      name={team?.displayName ?? team?.name}
      shortName={team?.code}
      accent={accent}
      size={FS_LOGO_SIZE}
    />
  );
}

/**
 * @param {{
 *   player: object,
 *   teams: Record<string, object>,
 *   statFields?: Array<{ key: string, label: string }>,
 *   statValues?: Record<string, string | number>,
 *   careerLabel?: string,
 *   panelDetail?: string,
 *   topLabel?: string,
 *   sub?: string,
 *   variant?: 'batsman' | 'bowler',
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
  variant: _variant = 'batsman',
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
      <div className="absolute top-0 right-0 bottom-0 left-0 z-[1] flex items-center justify-center">
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
              <FsStatColumn
                statFields={statFields}
                statValues={statValues}
                statLayout={statLayout}
                getDelay={getStatDelay}
                tone="batsman"
              />
            )}
          </div>

          <div className="flex flex-col justify-center gap-6" style={{ width: FS_PANEL_W }}>
            <TeamLogoTile team={team} logoUrl={logoUrl} accent={accent} />

            <div className="w-full rounded px-9 py-8" style={{ background: colors.panelPlayer }}>
              {topLabel ? (
                <div className="mb-4">
                  <p
                    className={cn('font-extrabold tracking-[0.18em] text-white uppercase', UI_FONT)}
                    style={fsFont(fsPill.caption)}
                  >
                    {topLabel}
                  </p>
                  <div className="mt-2.5 h-px bg-gradient-to-r from-white/50 to-transparent" />
                </div>
              ) : null}
              <div className="flex flex-col gap-1">
                {firstName ? (
                  <div className={FS_PLAYER_FIRST} style={fsFont(fsPlayerCard.firstName)}>
                    {firstName}
                  </div>
                ) : null}
                {lastName ? (
                  <div className={FS_PLAYER_LAST} style={fsFont(fsPlayerCard.lastName)}>
                    {lastName}
                  </div>
                ) : null}
              </div>
              <div className="my-5 h-px bg-white/20" />
              <div className="flex flex-col gap-1">
                {team?.code ? (
                  <div className={teamCodeClass} style={{ color: TEAM_CODE_COLOR, ...fsFont(fsPlayerCard.teamCode) }}>
                    {team.code}
                  </div>
                ) : null}
                {detail ? (
                  <div className={cn(FS_PLAYER_ROLE, 'mt-0.5')} style={fsFont(fsPlayerCard.role)}>
                    {detail}
                  </div>
                ) : null}
                {careerLabel ? (
                  <div className={careerLabelClass} style={fsFont(fsPlayerCard.careerLabel)}>
                    {careerLabel}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </FSStage>
  );
}
