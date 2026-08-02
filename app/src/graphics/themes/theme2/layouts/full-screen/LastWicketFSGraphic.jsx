/**
 * Last Wicket FS — theme3 LastWicketFsCore / MatchFS shell.
 * Tournament header + portrait | vertical stats | wine card (logo + name + how out).
 */
import { cn } from '@/lib/utils';

import { resolveFsNameParts } from '../../adapters/_shared';
import { colors, fsPlayerCard, fsSummaryPanel } from '../../config';
import { DISPLAY_FONT, fmt, FSStage, PlayerAvatarImage, TeamLogoOrCrest } from '../../primitives';
import { FsStatColumn } from '../shared/FsStatColumn';
import { resolveFsStatLayout } from '../shared/fsStatLayout';
import { FS_HEADER_SUB, FS_PLAYER_FIRST, FS_PLAYER_LAST, fsFont } from '../shared/fsTypographyStyles';

const AVATAR_W = 560;
const AVATAR_H = 760;
const AVATAR_STAT_GAP = 40;
const PANEL_W = 560;
const PANEL_GAP = 40;
const LOGO_SIZE = 88;
const STAT_BASE_DELAY_MS = 120;
const STAT_STAGGER_MS = 80;

const STAT_FIELDS = [
  { key: 'runs', label: 'RUNS' },
  { key: 'balls', label: 'BALLS' },
  { key: 'fours', label: 'FOURS' },
  { key: 'sixes', label: 'SIXES' },
  { key: 'sr', label: 'S - RATE' },
];

/** @param {number} index */
function getStatDelay(index) {
  return STAT_BASE_DELAY_MS + index * STAT_STAGGER_MS;
}

function resolveBatter(batter, teams) {
  if (!batter?.name && !batter?.firstName && !batter?.lastName) return null;
  const team = batter.teamCode ? teams[batter.teamCode] : null;
  return {
    batter,
    team,
    accent: batter.accent ?? team?.color ?? undefined,
  };
}

function resolveContent(batter) {
  if (batter.firstName || batter.lastName) {
    return { firstName: batter.firstName ?? '', lastName: batter.lastName ?? '' };
  }
  const { firstName, lastName } = resolveFsNameParts(batter);
  return { firstName, lastName };
}

function TeamLogoTile({ team, logoUrl, accent }) {
  if (!team && !logoUrl) return null;

  return (
    <TeamLogoOrCrest
      logoUrl={logoUrl}
      team={team}
      name={team?.displayName ?? team?.name}
      shortName={team?.code}
      accent={accent}
      size={LOGO_SIZE}
    />
  );
}

/**
 * @param {{ batter: object, teams: Record<string, object>, sub?: string }} props
 */
export function LastWicketFSGraphic({ batter, teams, sub }) {
  const resolved = resolveBatter(batter, teams);
  if (!resolved) return null;

  const { batter: b, team, accent } = resolved;
  const { firstName, lastName } = resolveContent(b);
  const logoUrl = b.logoUrl ?? team?.logoUrl;
  const avatarUrl = b.avatarUrl;
  const playerName = b.name ?? [firstName, lastName].filter(Boolean).join(' ');
  const displayLast = lastName || playerName;
  const howOut = b.dismissal ?? b.howOut ?? '';
  const statLayout = resolveFsStatLayout(STAT_FIELDS.length);

  const statValues = {
    runs: b.runs ?? 0,
    balls: b.balls ?? 0,
    fours: b.fours ?? 0,
    sixes: b.sixes ?? 0,
    sr: b.sr ?? fmt.strikeRate(b.runs ?? 0, b.balls ?? 0),
  };

  return (
    <FSStage>
      {sub ? (
        <p
          className={cn('absolute top-14 right-16 left-16 z-[3] text-center', FS_HEADER_SUB)}
          style={fsFont(fsSummaryPanel.headerSub)}
          data-testid="last-wicket-fs-tournament"
        >
          {sub}
        </p>
      ) : null}

      <div
        className="absolute top-0 right-0 bottom-0 left-0 z-[1] flex items-center justify-center px-16"
        style={{ paddingTop: sub ? 36 : 0 }}
      >
        <div className="flex items-center" style={{ gap: PANEL_GAP }}>
          <div className="flex items-stretch" style={{ height: AVATAR_H, gap: AVATAR_STAT_GAP }}>
            <div
              className="relative shrink-0 overflow-hidden rounded"
              style={{ width: AVATAR_W, height: AVATAR_H }}
              data-testid="last-wicket-fs-avatar"
            >
              <PlayerAvatarImage src={avatarUrl} alt={playerName} fit="cover-top" />
            </div>

            <FsStatColumn
              statFields={STAT_FIELDS}
              statValues={statValues}
              statLayout={statLayout}
              getDelay={getStatDelay}
              tone="batsman"
            />
          </div>

          <div
            className="flex shrink-0 flex-col items-start justify-start gap-[18px] rounded px-9 py-8"
            style={{
              width: PANEL_W,
              minHeight: 280,
              background: colors.panelPlayer,
            }}
            data-testid="last-wicket-fs-card"
          >
            <TeamLogoTile team={team} logoUrl={logoUrl} accent={accent} />

            <div className="flex w-full flex-col gap-1">
              {firstName && lastName ? (
                <>
                  <p className={FS_PLAYER_FIRST} style={fsFont(fsPlayerCard.firstName)}>
                    {firstName}
                  </p>
                  <p className={FS_PLAYER_LAST} style={fsFont(fsPlayerCard.lastName)}>
                    {lastName}
                  </p>
                </>
              ) : (
                <p className={FS_PLAYER_LAST} style={fsFont(fsPlayerCard.lastName)}>
                  {displayLast}
                </p>
              )}
            </div>

            {howOut ? (
              <p
                className={cn('font-semibold tracking-[0.06em] text-white/90 uppercase', DISPLAY_FONT)}
                style={fsFont(fsPlayerCard.dismissalHero)}
              >
                {howOut}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </FSStage>
  );
}
