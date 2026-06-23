/**
 * Last wicket full-screen — dismissed batter match scorecard.
 */
import { cn } from '@/lib/utils';

import { resolveBroadcastNameParts } from '../../../../core/domain/playerNameResolver';
import { fsPlayerCard, fsSummaryPanel } from '../../config';
import { fmt, GlowPanel, PlayerAvatarImage, TeamLogoOrCrest } from '../../primitives';
import { FsStatColumn } from '../shared/FsStatColumn';
import { resolveFsStatLayout } from '../shared/fsStatLayout';
import {
  FS_DISMISSAL,
  FS_HEADER_SUB,
  FS_PLAYER_FIRST,
  FS_PLAYER_LAST,
  FS_PLAYER_ROLE,
  fsFont,
} from '../shared/fsTypographyStyles';

const AVATAR_W = 560;
const AVATAR_H = 760;
const PANEL_W = 560;
const CREST_SIZE = 210;

const STAT_FIELDS = [
  { key: 'runs', label: 'RUNS' },
  { key: 'balls', label: 'BALLS' },
  { key: 'fours', label: 'FOURS' },
  { key: 'sixes', label: 'SIXES' },
  { key: 'sr', label: 'S - RATE' },
];

function resolveBatter(batter, teams) {
  if (!batter?.name && !batter?.firstName) return null;
  const team = batter.teamCode ? teams[batter.teamCode] : null;
  return {
    batter,
    team,
    accent: team?.color ?? 'var(--accentA)',
  };
}

function resolveContent(batter) {
  const { firstName, lastName } = resolveBroadcastNameParts(batter);
  return { firstName, lastName };
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
  const statLayout = resolveFsStatLayout(STAT_FIELDS.length);
  const statsColumnHeight = statLayout.columnH;

  const statValues = {
    runs: b.runs ?? 0,
    balls: b.balls ?? 0,
    fours: b.fours ?? 0,
    sixes: b.sixes ?? 0,
    sr: b.sr ?? fmt.strikeRate(b.runs ?? 0, b.balls ?? 0),
  };

  return (
    <>
      {sub ? (
        <p
          className={cn('absolute top-14 right-16 left-16 z-[3] text-center', FS_HEADER_SUB)}
          style={fsFont(fsSummaryPanel.headerSub)}
        >
          {sub}
        </p>
      ) : null}
      <div className="absolute inset-0 flex items-center justify-center gap-10 px-16">
        <div className="relative shrink-0 overflow-hidden" style={{ width: AVATAR_W, height: AVATAR_H }}>
          <PlayerAvatarImage src={avatarUrl} alt={b.name ?? `${firstName} ${lastName}`} fit="cover-top" />
        </div>

        <div style={{ height: AVATAR_H }}>
          <FsStatColumn statFields={STAT_FIELDS} statValues={statValues} accent={accent} statLayout={statLayout} />
        </div>

        <GlowPanel className="flex shrink-0 flex-col px-10 py-12" style={{ width: PANEL_W, height: statsColumnHeight }}>
          <div className="flex items-start justify-between gap-6">
            <TeamLogoOrCrest logoUrl={logoUrl} team={team} accent={accent} size={CREST_SIZE} borderPulseOrder={1} />
          </div>
          <div className="mt-8">
            <p className={FS_PLAYER_FIRST} style={fsFont(fsPlayerCard.firstName)}>
              {firstName}
            </p>
            <p className={FS_PLAYER_LAST} style={fsFont(fsPlayerCard.lastName)}>
              {lastName}
            </p>
            {b.dismissal ? (
              <p className={cn(FS_DISMISSAL, 'mt-3')} style={fsFont(fsPlayerCard.dismissalHero)}>
                {b.dismissal}
              </p>
            ) : null}
            {b.role ? (
              <p className={cn(FS_PLAYER_ROLE, 'mt-2')} style={fsFont(fsPlayerCard.roleSm)}>
                {b.role}
              </p>
            ) : null}
          </div>
        </GlowPanel>
      </div>
    </>
  );
}
