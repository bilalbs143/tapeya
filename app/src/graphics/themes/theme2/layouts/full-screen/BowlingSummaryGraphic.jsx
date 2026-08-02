/**
 * Bowling Summary FS — theme3 BowlingSummaryCore look.
 * Shared TeamLogoOrCrest (session team color plate) for header + hero.
 */
import { cn } from '@/lib/utils';

import { colors, fsSummaryPanel } from '../../config';
import { accentGlowShadow, DISPLAY_FONT, FSStage, normalizeAccentColor, ROW_ANIMATE_IN, TeamLogoOrCrest } from '../../primitives';
import { FsPageHeader } from '../shared/FsPageHeader';
import { fsFont } from '../shared/fsTypographyStyles';

const STAT_CELL_SIZE = 34;
/** Per-stat column — kept narrow so longer broadcast names get room (theme1). */
const STAT_COL_WIDTH = 122;

const CREST_SIZE = 340;
const PANEL_LEFT = 70;
const PANEL_WIDTH = 1020;
const HERO_CREST_WIDTH = 700;

const COLUMN_LABELS = [
  { key: 'overs', label: 'OVERS' },
  { key: 'dots', label: 'DOTS' },
  { key: 'runs', label: 'RUNS' },
  { key: 'wickets', label: 'WICKETS' },
  { key: 'eco', label: 'ECO' },
];

const columnLabelClass = cn('text-center font-semibold tracking-[0.04em] text-white uppercase', DISPLAY_FONT);

const bowlerNameClass = cn(
  'min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left font-bold tracking-[0.03em] text-white uppercase',
  DISPLAY_FONT,
);

const statCellClass = cn('text-center font-bold leading-tight text-white tabular-nums', DISPLAY_FONT);

function resolveSub(data) {
  return data.sub ?? '';
}

function ColumnHeader() {
  return (
    <div className="flex w-full shrink-0 items-center px-[26px] pb-2">
      <span className="flex-1" aria-hidden="true" />
      {COLUMN_LABELS.map((col) => (
        <span
          key={col.key}
          className={columnLabelClass}
          style={{ width: STAT_COL_WIDTH, ...fsFont(fsSummaryPanel.columnLabelSm) }}
        >
          {col.label}
        </span>
      ))}
    </div>
  );
}

function StatCell({ value }) {
  return (
    <span className={statCellClass} style={{ width: STAT_COL_WIDTH, ...fsFont(STAT_CELL_SIZE) }}>
      {value}
    </span>
  );
}

function BowlerRow({ name, overs, dots, runs, wickets, eco, index }) {
  return (
    <div
      className={cn(ROW_ANIMATE_IN, 'flex w-full shrink-0 items-center rounded-lg border border-white/12 px-[26px]')}
      style={{
        minHeight: 52,
        background: colors.panelPlayer,
        animationDelay: `${index * 60}ms`,
      }}
    >
      <span className={bowlerNameClass} style={fsFont(fsSummaryPanel.bowlerName)}>
        {name}
      </span>
      <StatCell value={overs} />
      <StatCell value={dots} />
      <StatCell value={runs} />
      <StatCell value={wickets} />
      <StatCell value={eco} />
    </div>
  );
}

function FallOfWicketsBand({ label, accent, accentSecondary }) {
  if (!label) return null;
  const barAccent = normalizeAccentColor(accent, colors.gold);
  const gradientEnd = accentSecondary ? normalizeAccentColor(accentSecondary, barAccent) : barAccent;

  return (
    <div
      className="flex w-full shrink-0 items-center rounded-lg px-[22px] py-3"
      style={{
        minHeight: 52,
        background: `linear-gradient(100deg, ${barAccent}, ${gradientEnd})`,
        boxShadow: accentGlowShadow(barAccent, 20, '18px'),
      }}
      data-testid="bowling-summary-fow"
    >
      <span
        className={cn('font-bold tracking-[0.04em] uppercase', DISPLAY_FONT)}
        style={{ color: '#ffffff', ...fsFont(fsSummaryPanel.fowBand) }}
      >
        {label}
      </span>
    </div>
  );
}

function SummaryFooter({ extras, overs, total }) {
  return (
    <div
      className="mt-3.5 flex w-full shrink-0 items-center justify-between rounded-[10px] border border-white/14 px-6 py-3"
      style={{ minHeight: 72, background: colors.panelPlayer }}
      data-testid="bowling-summary-footer"
    >
      <div className="flex items-center gap-[18px]">
        <div className="flex items-baseline gap-2.5">
          <span
            className={cn('font-medium tracking-[0.04em] text-white uppercase', DISPLAY_FONT)}
            style={fsFont(fsSummaryPanel.scoreStripLabel)}
          >
            EXTRAS
          </span>
          <span
            className={cn('leading-none font-black text-white tabular-nums', DISPLAY_FONT)}
            style={fsFont(fsSummaryPanel.scoreStripValue)}
          >
            {extras ?? 0}
          </span>
        </div>
        <span className="h-7 w-px shrink-0 self-center bg-white/25" aria-hidden="true" />
        <div className="flex items-baseline gap-2.5">
          <span
            className={cn('font-medium tracking-[0.04em] text-white uppercase', DISPLAY_FONT)}
            style={fsFont(fsSummaryPanel.scoreStripLabel)}
          >
            OVERS
          </span>
          <span
            className={cn('leading-none font-black text-white tabular-nums', DISPLAY_FONT)}
            style={fsFont(fsSummaryPanel.scoreStripValue)}
          >
            {overs ?? '0.0'}
          </span>
        </div>
      </div>
      <span
        className={cn('font-black tracking-[0.02em] text-white tabular-nums', DISPLAY_FONT)}
        style={fsFont(fsSummaryPanel.scoreStripHero)}
      >
        {total ?? '0-0'}
      </span>
    </div>
  );
}

function HeroCrest({ logoUrl, title, team, accent }) {
  return (
    <TeamLogoOrCrest
      logoUrl={logoUrl}
      team={team}
      name={title}
      shortName={team?.code ?? title?.slice(0, 3)}
      accent={accent}
      size={CREST_SIZE}
      data-testid="bowling-summary-crest"
    />
  );
}

export function BowlingSummaryGraphic({ data, teams }) {
  const team = data.teamCode ? (teams?.[data.teamCode] ?? null) : null;
  const title = data.title ?? team?.fullName ?? team?.displayName ?? '';
  const accent = data.accent ?? team?.color ?? undefined;
  const bowlers = data.bowlers ?? [];

  if (!bowlers.length || !data.scoreStrip) return null;

  return (
    <FSStage>
      <FsPageHeader
        title={title}
        sub={resolveSub(data)}
        size="panel"
        logoUrl={data.crestLogoUrl ?? team?.logoUrl}
        logoCode={team?.code ?? title?.slice(0, 3)}
        logoAlt={title}
        logoVariant="team"
        logoAccent={accent}
        logoTeam={team}
      />

      <div className="absolute top-[248px] bottom-16 z-[1] flex flex-col" style={{ left: PANEL_LEFT, width: PANEL_WIDTH }}>
        <div className="flex min-h-0 w-full flex-1 flex-col gap-2">
          <ColumnHeader />
          <div className="flex w-full flex-col gap-2">
            {bowlers.map((bowler, index) => (
              <BowlerRow
                key={bowler.name ? `bowler-${bowler.name}` : `bowler-${index}`}
                name={bowler.name}
                overs={bowler.overs}
                dots={bowler.dots}
                runs={bowler.runs}
                wickets={bowler.wickets}
                eco={bowler.eco}
                index={index}
              />
            ))}
          </div>
        </div>

        <FallOfWicketsBand label={data.fallOfWicketsLabel} accent={accent} accentSecondary={data.accentSecondary} />

        <SummaryFooter extras={data.scoreStrip.extras} overs={data.scoreStrip.overs} total={data.scoreStrip.total} />
      </div>

      <div
        className="absolute top-0 bottom-0 z-[1] grid place-items-center"
        style={{ right: PANEL_LEFT, width: HERO_CREST_WIDTH }}
      >
        <HeroCrest logoUrl={data.crestLogoUrl} title={title} team={team} accent={accent} />
      </div>
    </FSStage>
  );
}
