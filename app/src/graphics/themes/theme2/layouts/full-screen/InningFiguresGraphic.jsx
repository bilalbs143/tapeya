/**
 * Inning Figures FS — theme3 InningsFigureCore look (Need Target shell, 2×2 stats).
 * Header uses theme1 placement + panelTitle/panelSub + team logo; optional gold RRR band (theme2-only).
 */
import { cn } from '@/lib/utils';

import { colors, fsSummaryPanel } from '../../config';
import { AnimatedNumber, DISPLAY_FONT, FSStage } from '../../primitives';
import { FsPageHeader } from '../shared/FsPageHeader';
import { fsFont } from '../shared/fsTypographyStyles';

const CARD_WIDTH = 920;
const CARD_MIN_H = 520;

function resolveTitle(data) {
  return data.title ?? data.matchLine ?? data.matchHeader ?? '';
}

function resolveSub(data) {
  return data.sub ?? data.tournamentLine ?? '';
}

function FigureChip({ children }) {
  return (
    <span
      className="flex items-center justify-center rounded-md border border-white/18 bg-black/35 px-4 py-2"
      style={{ minWidth: 88 }}
    >
      <span
        className={cn('font-bold tracking-[0.1em] text-white uppercase', DISPLAY_FONT)}
        style={fsFont(fsSummaryPanel.statLabelBox)}
      >
        {children}
      </span>
    </span>
  );
}

function FigureCell({ label, value }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-3.5">
      <FigureChip>{label}</FigureChip>
      <AnimatedNumber
        value={value}
        className={cn('leading-[0.9] font-black tracking-[-0.02em] text-white uppercase tabular-nums', DISPLAY_FONT)}
        style={fsFont(fsSummaryPanel.heroMetricMd)}
      />
    </div>
  );
}

function RequiredRunRateBand({ value }) {
  if (value == null || value === '') return null;

  return (
    <div
      className="absolute bottom-0 left-1/2 z-[2] flex -translate-x-1/2 items-center justify-center rounded-[10px] px-7 py-3.5"
      style={{
        minWidth: 280,
        background: 'linear-gradient(180deg, #f0d878 0%, #e0c05a 45%, #c9a227 100%)',
        boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
      }}
      data-testid="inning-figures-rrr"
    >
      <span
        className={cn('font-black tracking-[0.06em] uppercase', DISPLAY_FONT)}
        style={{ color: colors.badgeText, ...fsFont(fsSummaryPanel.goldBand) }}
      >
        REQUIRED RUN RATE : {value}
      </span>
    </div>
  );
}

export function InningFiguresGraphic({ data, teams }) {
  const title = resolveTitle(data);
  const sub = resolveSub(data);
  const team = data.teamCode ? (teams?.[data.teamCode] ?? null) : null;
  const accent = data.accent ?? team?.color ?? undefined;
  const logoUrl = data.logoUrl ?? team?.logoUrl ?? null;
  const logoCode = team?.code ?? team?.displayName?.slice(0, 3) ?? null;
  const hasRrr = data.requiredRR != null && data.requiredRR !== '';

  return (
    <FSStage>
      <FsPageHeader
        title={title}
        sub={sub}
        size="panel"
        logoUrl={logoUrl}
        logoCode={logoCode}
        logoAlt={title}
        logoVariant="team"
        logoAccent={accent}
        logoTeam={team}
      />

      <div className="absolute top-[250px] right-0 left-0 z-[1] flex justify-center">
        <div className={cn('relative flex w-full max-w-[920px] flex-col items-center', hasRrr && 'pb-7')}>
          <div
            className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[14px]"
            style={{
              width: CARD_WIDTH,
              minHeight: CARD_MIN_H,
              padding: '48px 64px',
              background: colors.panelPlayer,
              boxShadow: '0 0 40px rgba(0,0,0,0.35)',
            }}
            data-testid="inning-figures-card"
          >
            <div className="grid w-full grid-cols-2 gap-x-16 gap-y-10">
              <FigureCell label="SCORE" value={data.score} />
              <FigureCell label="INNINGS" value={data.innings} />
              <FigureCell label="WICKETS" value={data.wickets} />
              <FigureCell label="OVERS" value={data.overs} />
            </div>
          </div>

          <RequiredRunRateBand value={data.requiredRR} />
        </div>
      </div>
    </FSStage>
  );
}
