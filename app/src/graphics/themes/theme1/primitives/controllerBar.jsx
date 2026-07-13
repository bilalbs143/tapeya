import { memo, useLayoutEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { colors, geometry, ltBar, ltTypography } from '../config';
import { TEXT_SECONDARY } from '../layouts/shared/textStyles';
import { textGlowClass } from '../visualEffects';
import { AnimatedNumber, BallChip, BallTrack, Crest, GlowPanel, StrikeBatIcon } from './atoms';
import { BatterScoreInline } from './batterScore';
import { useContainerWidth } from './controllerBarHooks';
import { horizontalBarScale } from './controllerBarScaling';
import { DISPLAY_FONT } from './formatters';
import { bowlerFigParts, PLAYER_NAME_TRUNCATE_CLASS } from './playerBarHelpers';

// ── ControllerBar ─────────────────────────────────────────────────────────────
export const ControllerBar = memo(function ControllerBar({
  frame,
  teams,
  match,
  edgeToEdge = false,
  barVariant = 'default',
  zoneCPanel,
  truncatePlayerNames = false,
}) {
  const [ref, w] = useContainerWidth();
  const effectiveW = w > 0 ? w : DESIGN_W;

  return (
    <div ref={ref} className={cn('flex w-full max-w-full overflow-hidden', edgeToEdge ? 'justify-stretch' : 'justify-center')}>
      <HorizontalBar
        frame={frame}
        teams={teams}
        match={match}
        containerW={effectiveW}
        edgeToEdge={edgeToEdge}
        barVariant={barVariant}
        zoneCPanel={zoneCPanel}
        truncatePlayerNames={truncatePlayerNames}
      />
    </div>
  );
});

// ── EventSweep ────────────────────────────────────────────────────────────────
function EventSweep({ kind, radius }) {
  const wash = colors.eventWash[kind];
  if (!wash) return null;
  return (
    <div
      className="bc-animate-wkt-sweep pointer-events-none absolute top-0 right-0 bottom-0 left-0 z-[5]"
      style={{
        borderRadius: radius,
        background: `linear-gradient(90deg, transparent, ${wash} 50%, transparent)`,
      }}
    />
  );
}

// ── HorizontalBar ─────────────────────────────────────────────────────────────
const DESIGN_W = ltBar.designWidth;
const lt = ltTypography;
const SCORE_DISPLAY_CLASS = cn(DISPLAY_FONT, 'leading-[0.92] font-extrabold');
/** Zone C KPI columns — CRR, RRR, Need Target, team code, partnership, projected score, … */
/** Physical L/R padding — Chrome 86 / vMix ignore CSS logical padding-inline. */
const KPI_PANEL_SHELL_STYLE = {
  paddingLeft: lt.kpiColumnPaddingX,
  paddingRight: lt.kpiColumnPaddingX,
  gap: lt.kpiColumnGap,
};

/** 4-zone grid: A (fixed) | B (1fr — all remainder) | C (max-content) | D (fixed). */
const ZONE_GRID_STYLE = { gridTemplateColumns: 'auto minmax(0, 1fr) auto auto' };
const ZONE_A_CLASS = 'flex shrink-0 items-center';
const ZONE_B_CLASS = 'flex min-w-0 items-center';
const ZONE_C_CLASS = 'flex w-max shrink-0 items-center self-stretch';
const ZONE_D_CLASS = 'flex shrink-0 items-center';

/** Per-variant layout density — drives compression cascade (middle → batsmen → bowler). */
const VARIANT_DENSITY = {
  needTarget: 'compact',
  last30Balls: 'dense',
};

function HorizontalBar({
  frame,
  teams,
  match,
  containerW,
  edgeToEdge = false,
  barVariant = 'default',
  zoneCPanel,
  truncatePlayerNames = false,
}) {
  const bat = teams[match.battingCode];
  const bowl = teams[match.bowlingCode];
  const kind = (frame.event || {}).kind;
  const scale = horizontalBarScale(containerW, edgeToEdge);
  const radius = edgeToEdge ? geometry.barRadiusEdgeToEdge : geometry.barRadius;
  const bowlerStats = bowlerFigParts(frame.bowler);
  const isRunRate = barVariant === 'runRate';
  const isAtStage = barVariant === 'atStage';
  const isWinPrediction = barVariant === 'winPrediction';
  const isCurrentPartnership = barVariant === 'currentPartnership';
  const isLast12Balls = barVariant === 'last12Balls';
  const isLast30Balls = barVariant === 'last30Balls';
  const isNeedTarget = barVariant === 'needTarget';
  const isThisOver = barVariant === 'thisOver';
  const isFours = barVariant === 'fours';
  const isSixes = barVariant === 'sixes';
  const isFifties = barVariant === 'fifties';
  const isHundreds = barVariant === 'hundreds';
  const isRuns = barVariant === 'runs';
  const isWickets = barVariant === 'wickets';
  const isPreviousOver = barVariant === 'previousOver';
  const isLastBalls = isLast12Balls || isLast30Balls;
  const hideBowler = isRunRate || isAtStage || isWinPrediction || isCurrentPartnership || isLastBalls;
  const hideCrr = isThisOver || isFours || isSixes || isFifties || isHundreds || isRuns || isWickets || isPreviousOver;
  const showBowlTeamOnly = hideCrr && !isAtStage && !isWinPrediction && !isNeedTarget && !isCurrentPartnership;
  const density = VARIANT_DENSITY[barVariant] ?? 'standard';
  const isCompact = density === 'compact';
  const ballTrackSize = lt.ballChip;
  const batsmenTruncate = truncatePlayerNames;
  const bowlerTruncate = truncatePlayerNames;

  const innerRef = useRef(null);
  const [natH, setNatH] = useState(0);
  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const apply = () => setNatH((prev) => (prev === el.offsetHeight ? prev : el.offsetHeight));
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    apply();
    return () => ro.disconnect();
  }, []);

  return (
    <div className="max-w-full overflow-hidden" style={{ width: edgeToEdge ? '100%' : DESIGN_W * scale, height: natH * scale }}>
      <div ref={innerRef} className="origin-top-left" style={{ width: DESIGN_W, transform: `scale(${scale})` }}>
        <GlowPanel hideRing radius={radius} className="grid w-full items-stretch" style={ZONE_GRID_STYLE}>
          <EventSweep kind={kind} radius={radius} />

          {/* ZONE A — score (Priority 1, fixed) */}
          <div
            className={cn(ZONE_A_CLASS, 'gap-[18px] pr-[22px]')}
            style={{
              paddingLeft: ltBar.edgePaddingX,
              paddingTop: ltBar.controllerBarPaddingY,
              paddingBottom: ltBar.controllerBarPaddingY,
            }}
          >
            <Crest team={bat} size={ltBar.crestSize} accent={bat.color} borderPulseOrder={1} />
            <div className="flex items-center gap-4">
              <div className="flex flex-col self-stretch pr-[18px]">
                <div
                  className="[font-family:var(--font-ui)] font-bold tracking-[0.1em] whitespace-nowrap text-[var(--text)] uppercase"
                  style={{ fontSize: lt.teamName }}
                >
                  {bat.name}
                </div>
                <HMini label="OVERS" value={frame.oversText} hideLabel />
              </div>
              <div className="flex items-baseline gap-[5px]">
                <AnimatedNumber
                  value={frame.total}
                  className={cn(SCORE_DISPLAY_CLASS, 'text-[var(--score-color)]', textGlowClass('score'))}
                  style={{ fontSize: lt.scoreTotal }}
                />
                <span className={cn(SCORE_DISPLAY_CLASS, 'text-[var(--text-secondary)]')} style={{ fontSize: lt.scoreSep }}>
                  {frame.scoreSep ?? '/'}
                </span>
                <AnimatedNumber
                  value={frame.wkts}
                  className={cn(SCORE_DISPLAY_CLASS, 'text-white')}
                  style={{ fontSize: lt.scoreWkts }}
                />
              </div>
            </div>
          </div>

          {/* ZONE B — batsmen pill (Priority 2, receives all grid remainder) */}
          <div className={cn(ZONE_B_CLASS, 'py-0 pr-[10px] pl-1')}>
            <div
              className="relative flex w-full min-w-0 items-center rounded-[14px] border border-[rgba(120,140,255,0.28)] bg-[linear-gradient(180deg,rgba(40,52,84,0.55),rgba(16,22,38,0.65))] [box-shadow:inset_0_1px_0_rgba(255,255,255,0.07),0_0_calc(16px*var(--glow))_rgba(90,110,255,0.25)]"
              style={{
                paddingLeft: isCompact ? lt.columnPaddingXCompact : lt.columnPaddingX,
                paddingRight: isCompact ? lt.columnPaddingXCompact : lt.columnPaddingX,
                paddingTop: ltBar.controllerBarPaddingY - 4,
                paddingBottom: ltBar.controllerBarPaddingY - 4,
              }}
            >
              <HBat p={frame.striker} onStrike={frame.striker.onStrike} truncateName={batsmenTruncate} compact={isCompact} />
              <div
                className="mx-[14px] my-1 w-px self-stretch bg-[linear-gradient(180deg,transparent,rgba(150,170,255,0.5),transparent)]"
                aria-hidden="true"
              />
              <HBat
                p={frame.nonStriker}
                onStrike={frame.nonStriker.onStrike}
                truncateName={batsmenTruncate}
                compact={isCompact}
              />
            </div>
          </div>

          {/* ZONE C — variant middle (Priority 4, content-width only) */}
          {isLastBalls ? (
            <div className={cn(ZONE_C_CLASS, 'mx-2.5')}>
              <PartialDivider />
              {isLast30Balls ? (
                <Last30StatsPanel stats={frame.last30Stats} />
              ) : (
                <LastBallsPanel
                  chips={frame.last12Chips ?? []}
                  label={frame.last12Label ?? 'LAST 12 BALLS'}
                  totalRuns={frame.last12Runs ?? frame.runs ?? null}
                  chipSize={ballTrackSize}
                  fitContent
                />
              )}
            </div>
          ) : (
            <div className={cn(ZONE_C_CLASS, 'mx-2.5')}>
              <PartialDivider />
              {isAtStage ? (
                <AtStagePanel label={frame.stageLabel ?? 'AT THIS STAGE'} comparisons={frame.stageComparison} />
              ) : isWinPrediction ? (
                <WinPredictionPanel
                  label={frame.predictionLabel ?? 'WIN PREDICTION'}
                  predictions={frame.predictions}
                  teams={teams}
                />
              ) : isNeedTarget ? (
                <NeedTargetPanel runsToWin={frame.runsToWin} ballsRemaining={frame.ballsRemaining} />
              ) : isCurrentPartnership ? (
                <PartnershipPanel partnership={frame.partnership} team={bowl} />
              ) : barVariant === 'default' && zoneCPanel ? (
                <DefaultZoneCPanel panel={zoneCPanel} frame={frame} bowl={bowl} />
              ) : !hideCrr ? (
                <RunRateMetricsPanel frame={frame} bowl={bowl} includeRrr={isRunRate} />
              ) : showBowlTeamOnly ? (
                <BowlTeamOnlyPanel team={bowl} />
              ) : null}
            </div>
          )}

          {/* ZONE D — bowler + crest (Priority 3, fixed footprint) */}
          <div
            className={cn(ZONE_D_CLASS, 'gap-[18px] pl-3')}
            style={{
              paddingRight: ltBar.edgePaddingX,
              paddingTop: ltBar.controllerBarPaddingY,
              paddingBottom: ltBar.controllerBarPaddingY,
            }}
          >
            {!hideBowler && (
              <div className="min-w-0 text-right">
                <div className="flex min-w-0 items-baseline justify-between gap-[9px]">
                  <span
                    className={cn(
                      'min-w-0 overflow-hidden [font-family:var(--font-ui)] font-semibold text-ellipsis whitespace-nowrap text-white',
                      bowlerTruncate && PLAYER_NAME_TRUNCATE_CLASS,
                    )}
                    style={{ fontSize: lt.bowlerName }}
                  >
                    {frame.bowler.name.toUpperCase()}
                  </span>
                  <div
                    className={cn(
                      'flex shrink-0 items-baseline gap-[9px] font-semibold whitespace-nowrap text-[var(--text-secondary)] tabular-nums',
                      DISPLAY_FONT,
                    )}
                    style={{ fontSize: lt.bowlerFigures }}
                  >
                    <span>{bowlerStats.figures}</span>
                    <span>{bowlerStats.overs}</span>
                  </div>
                </div>
                <BowlerSubRow chipSize={ballTrackSize}>
                  {isPreviousOver ? (
                    <LastOverRunsLabel runs={frame.lastOverRuns} wickets={frame.lastOverWickets} rowHeight={ballTrackSize} />
                  ) : (
                    <BallTrack chips={frame.thisOverChips} size={ballTrackSize} max={6} />
                  )}
                </BowlerSubRow>
              </div>
            )}
            <Crest team={bowl} size={ltBar.crestSize} accent={bowl.color} borderPulseOrder={2} />
          </div>
        </GlowPanel>
      </div>
    </div>
  );
}

function PartialDivider() {
  return (
    <div
      aria-hidden="true"
      className="my-4 w-px shrink-0 self-stretch bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.22),transparent)]"
    />
  );
}

/** Zone C panels — content-width only; never flex-grow into Zone B's budget. */
const PANEL_ROOT_CLASS = 'flex w-max shrink-0 items-center self-stretch';
const PANEL_COLUMN_SLOT_CLASS = 'flex shrink-0 items-center justify-center self-stretch';
const PANEL_TEAM_COLUMN_SHELL_CLASS = 'flex shrink-0 flex-col items-center justify-center text-center';

function PanelRoot({ children, className, ariaLabel }) {
  return (
    <div className={cn(PANEL_ROOT_CLASS, className)} aria-label={ariaLabel}>
      {children}
    </div>
  );
}

/** Middle panel with bowling team code only — double dividers (This Over, Previous Over, tour hits). */
function BowlTeamOnlyPanel({ team }) {
  return (
    <PanelRoot>
      <PanelColumnSlot>
        <PanelTeamColumn team={team} />
      </PanelColumnSlot>
      <PartialDivider />
    </PanelRoot>
  );
}

function PanelColumnSlot({ showDivider = false, children }) {
  return (
    <div className={PANEL_COLUMN_SLOT_CLASS}>
      {showDivider && <PartialDivider />}
      {children}
    </div>
  );
}

/**
 * Side heading + divider + column slots + trailing divider.
 * Used by At Stage, Win Prediction, Last 30, and Current Partnership.
 */
function PanelWithHeading({ label, ariaLabel, children, headingVariant = 'kpi' }) {
  return (
    <PanelRoot ariaLabel={ariaLabel ?? label}>
      <PanelHeadingLines label={label} variant={headingVariant} />
      <PartialDivider />
      {children}
      <PartialDivider />
    </PanelRoot>
  );
}

function BowlerSubRow({ chipSize, children }) {
  return (
    <div className="mt-3 flex items-center justify-end" style={{ height: chipSize }}>
      {children}
    </div>
  );
}

function LastOverRunsLabel({ runs, wickets = 0, rowHeight }) {
  if (runs == null) return null;
  const wicketCount = Number(wickets) || 0;
  const showWickets = wicketCount > 0;
  const labelClass = 'font-bold tracking-[0.08em] text-white';
  const valueClass = cn(SCORE_DISPLAY_CLASS, 'leading-none text-[var(--score-color)]', textGlowClass('scoreSm'));

  return (
    <div className="flex items-center gap-[0.4rem] [font-family:var(--font-ui)] whitespace-nowrap" style={{ height: rowHeight }}>
      <span className={labelClass} style={{ fontSize: lt.lastOverLabel }}>
        Last Over
      </span>
      <AnimatedNumber value={runs} className={valueClass} style={{ fontSize: lt.lastOverRuns }} />
      <span className={labelClass} style={{ fontSize: lt.lastOverLabel }}>
        Runs
      </span>
      {showWickets ? (
        <>
          <span className={cn(labelClass, TEXT_SECONDARY)} style={{ fontSize: lt.lastOverLabel }}>
            and
          </span>
          <AnimatedNumber value={wicketCount} className={valueClass} style={{ fontSize: lt.lastOverRuns }} />
          <span className={labelClass} style={{ fontSize: lt.lastOverLabel }}>
            {wicketCount === 1 ? 'Wicket' : 'Wickets'}
          </span>
        </>
      ) : null}
    </div>
  );
}

const LAST_30_STAT_COLUMNS = [
  { key: 'dots', label: 'DOTS' },
  { key: 'fours', label: 'FOURS' },
  { key: 'sixes', label: 'SIXES' },
  { key: 'wickets', label: 'WICKETS' },
  { key: 'runs', label: 'RUNS' },
];

function Last30StatColumn({ label, value }) {
  return (
    <div
      className="box-border flex shrink-0 flex-col items-center justify-center text-center"
      style={{
        gap: lt.columnGap,
        width: lt.last30ColumnWidth,
        paddingLeft: lt.last30PaddingX,
        paddingRight: lt.last30PaddingX,
      }}
    >
      <span
        className="max-w-full overflow-hidden [font-family:var(--font-ui)] leading-none font-bold tracking-[0.1em] text-ellipsis whitespace-nowrap text-white"
        style={{ fontSize: lt.last30Label }}
      >
        {label}
      </span>
      <AnimatedNumber
        value={value ?? '—'}
        className={cn(SCORE_DISPLAY_CLASS, 'leading-none text-white', textGlowClass('subtleSm'))}
        style={{ fontSize: lt.last30Value }}
      />
    </div>
  );
}

function Last30StatsPanel({ stats }) {
  if (!stats) return null;
  return (
    <PanelWithHeading label="LAST 30 BALLS" headingVariant="last30">
      {LAST_30_STAT_COLUMNS.map((col, index) => (
        <PanelColumnSlot key={col.key} showDivider={index > 0}>
          <Last30StatColumn label={col.label} value={stats[col.key]} />
        </PanelColumnSlot>
      ))}
    </PanelWithHeading>
  );
}

/** Center-panel multi-ball strip — same chip size as Zone D BallTrack (lt.ballChip). */
function LastBallsPanel({ chips, label = 'LAST 12 BALLS', totalRuns, chipSize = lt.ballChip, fitContent = false }) {
  if (!chips?.length) return null;
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col justify-center gap-2 overflow-hidden px-4',
        fitContent ? 'w-fit shrink-0' : 'w-full flex-1',
      )}
    >
      <span
        className="[font-family:var(--font-ui)] leading-none font-bold tracking-[0.12em] text-white"
        style={{ fontSize: lt.last12Heading }}
      >
        {label}
      </span>
      <div className={cn('flex items-center gap-3', fitContent ? 'w-fit' : 'w-full')}>
        {totalRuns != null && (
          <AnimatedNumber
            value={totalRuns}
            className={cn(
              DISPLAY_FONT,
              'flex shrink-0 items-center justify-center leading-none font-extrabold text-white',
              textGlowClass('subtleSm'),
            )}
            style={{ height: chipSize, minWidth: chipSize + lt.last12TotalMinWidthExtra, fontSize: lt.last12TotalRuns }}
          />
        )}
        <div className="flex min-w-0 flex-nowrap items-center gap-1.5 overflow-hidden">
          {chips.map((chip, i) => (
            <BallChip key={`${chip.code}-${i}`} code={chip.code} chipType={chip.chipType} size={chipSize} animate={false} />
          ))}
        </div>
      </div>
    </div>
  );
}

function splitStageLabel(label) {
  const words = label.trim().split(/\s+/);
  if (words.length <= 2) return words;
  return [words.slice(0, -1).join(' '), words[words.length - 1]];
}

/** Multi-line section heading — center-aligned side column label. */
function PanelHeadingLines({ label, variant = 'kpi' }) {
  const lines = splitStageLabel(label);
  const paddingX = variant === 'last30' ? lt.columnPaddingX : lt.kpiColumnPaddingX;
  const line1Size = variant === 'last30' ? lt.sideHeadingLine1 : lt.kpiSideHeadingLine1;
  const line2Size = variant === 'last30' ? lt.sideHeadingLine2 : lt.kpiSideHeadingLine2;
  return (
    <div
      className="flex shrink-0 flex-col items-center justify-center gap-1 leading-[1.1]"
      style={{ paddingLeft: paddingX, paddingRight: paddingX }}
    >
      {lines.map((line, index) => {
        const isLast = index === lines.length - 1;
        const isEmphasized = lines.length === 1 || (isLast && lines.length > 1);
        return (
          <span
            key={line}
            className={cn(
              'block text-center [font-family:var(--font-ui)] leading-none tracking-[0.12em] text-white',
              isEmphasized ? 'font-extrabold tracking-[0.1em]' : 'font-bold',
            )}
            style={{ fontSize: isEmphasized ? line2Size : line1Size }}
          >
            {line}
          </span>
        );
      })}
    </div>
  );
}

/** KPI column label — CRR / RRR / TO WIN / team codes / RUNS. */
const PANEL_COLUMN_LABEL_CLASS = cn(
  'max-w-full overflow-hidden [font-family:var(--font-ui)] leading-none font-extrabold tracking-[0.1em] text-ellipsis whitespace-nowrap text-white',
  textGlowClass('subtleXs'),
);

/** Team short code — standalone column or column header above a KPI value. */
const PANEL_TEAM_CODE_CLASS = cn(
  'max-w-full overflow-hidden whitespace-nowrap [font-family:var(--font-ui)] leading-none font-black tracking-[0.1em] text-ellipsis text-white',
  textGlowClass('subtleMd'),
);

const PANEL_METRIC_VALUE_CLASS = cn(DISPLAY_FONT, 'leading-[0.9] font-extrabold text-white', textGlowClass('subtle'));

/**
 * Standard Zone C KPI block — label above value, consistent padding and hierarchy.
 * Used by Need Target, Run Rate, Win Prediction, At Stage, and Current Partnership.
 */
function PanelMetricColumn({ label, value, suffix, hideLabel = false, suffixBright = false, teamLabel = false }) {
  const showLabel = !hideLabel && label != null;
  return (
    <div className="flex shrink-0 flex-col items-center justify-center text-center" style={KPI_PANEL_SHELL_STYLE}>
      {showLabel ? (
        <span
          className={teamLabel ? PANEL_TEAM_CODE_CLASS : PANEL_COLUMN_LABEL_CLASS}
          style={{ fontSize: teamLabel ? lt.kpiTeamCodeAsLabel : lt.kpiColumnLabel }}
        >
          {label}
        </span>
      ) : null}
      <div className="flex items-baseline justify-center" style={suffix != null ? { gap: lt.kpiValueGap } : undefined}>
        <AnimatedNumber value={value ?? '—'} className={PANEL_METRIC_VALUE_CLASS} style={{ fontSize: lt.kpiMetricValue }} />
        {suffix != null ? (
          <span
            className={cn(DISPLAY_FONT, 'font-semibold tabular-nums', suffixBright ? 'text-white' : TEXT_SECONDARY)}
            style={{ fontSize: suffixBright ? lt.kpiWinPredictionPercentSuffix : lt.kpiPartnershipSuffix }}
          >
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function PanelTeamColumn({ team }) {
  const code = team.code ?? team.name;
  const name = team.name ?? code;
  const showSecondary = name && String(name).toUpperCase() !== String(code).toUpperCase();
  return (
    <div className={PANEL_TEAM_COLUMN_SHELL_CLASS} style={KPI_PANEL_SHELL_STYLE}>
      <span className={PANEL_TEAM_CODE_CLASS} style={{ fontSize: lt.kpiTeamCode }}>
        {code}
      </span>
      {showSecondary ? (
        <span
          className="max-w-full overflow-hidden [font-family:var(--font-ui)] leading-none font-bold tracking-[0.06em] text-ellipsis whitespace-nowrap text-[var(--text)] uppercase"
          style={{ fontSize: lt.kpiTeamNameSecondary }}
        >
          {name}
        </span>
      ) : null}
    </div>
  );
}

function RunRateMetricsPanel({ frame, bowl, includeRrr = false, metric, teamFirst = false }) {
  /** @type {{ key: string, label: string, value: string|number|null|undefined }[]} */
  const columns = [];
  if (metric === 'rrr') {
    if (frame.rrr != null) {
      columns.push({ key: 'rrr', label: frame.rrrLabel ?? 'RRR', value: frame.rrr });
    }
  } else {
    columns.push({ key: 'crr', label: frame.rrLabel ?? 'CRR', value: frame.rr });
    if (includeRrr && frame.rrr != null) {
      columns.push({ key: 'rrr', label: frame.rrrLabel ?? 'RRR', value: frame.rrr });
    }
  }

  if (columns.length === 0) return null;

  const teamColumn = (
    <PanelColumnSlot>
      <PanelTeamColumn team={bowl} />
    </PanelColumnSlot>
  );

  const metricColumns = columns.map((col, index) => (
    <PanelColumnSlot key={col.key} showDivider={index > 0}>
      <PanelMetricColumn label={col.label} value={col.value} />
    </PanelColumnSlot>
  ));

  return (
    <PanelRoot>
      {teamFirst ? (
        <>
          {teamColumn}
          <PartialDivider />
          {metricColumns}
        </>
      ) : (
        <>
          {metricColumns}
          <PartialDivider />
          {teamColumn}
        </>
      )}
      <PartialDivider />
    </PanelRoot>
  );
}

function AtStageTeamColumn({ entry }) {
  const separator = entry.scoreSep ?? '-';
  return (
    <div className="flex shrink-0 flex-col items-center justify-center text-center" style={KPI_PANEL_SHELL_STYLE}>
      <span className={PANEL_TEAM_CODE_CLASS} style={{ fontSize: lt.kpiTeamCodeAsLabel }}>
        {entry.label}
      </span>
      <div className="flex items-baseline justify-center" style={{ gap: lt.kpiValueGap }}>
        <AnimatedNumber value={entry.total} className={PANEL_METRIC_VALUE_CLASS} style={{ fontSize: lt.kpiMetricValue }} />
        <span className={cn(SCORE_DISPLAY_CLASS, TEXT_SECONDARY)} style={{ fontSize: lt.kpiAtStageSep }}>
          {separator}
        </span>
        <AnimatedNumber
          value={entry.wkts}
          className={cn(SCORE_DISPLAY_CLASS, 'text-white')}
          style={{ fontSize: lt.kpiAtStageWkts }}
        />
      </div>
    </div>
  );
}

function NeedTargetPanel({ runsToWin, ballsRemaining, runsLabel = 'TO WIN', ballsLabel = 'BALLS', withHeading = false }) {
  if (runsToWin == null && ballsRemaining == null) return null;

  const ariaLabel = `${runsLabel} ${runsToWin}, ${ballsLabel} ${ballsRemaining}`;
  const metrics = (
    <>
      <PanelColumnSlot>
        <PanelMetricColumn label={runsLabel} value={runsToWin} />
      </PanelColumnSlot>
      <PartialDivider />
      <PanelColumnSlot>
        <PanelMetricColumn label={ballsLabel} value={ballsRemaining} />
      </PanelColumnSlot>
      <PartialDivider />
    </>
  );

  if (!withHeading) {
    return (
      <div className="flex w-fit shrink-0 items-center self-stretch" aria-label={ariaLabel}>
        {metrics}
      </div>
    );
  }

  return (
    <PanelRoot ariaLabel={ariaLabel}>
      <PanelHeadingLines label="NEED TARGET" />
      <PartialDivider />
      {metrics}
    </PanelRoot>
  );
}

function ProjectedScorePanel({ projectedScore, bowl, hideTeamColumn = false }) {
  if (projectedScore == null) return null;
  if (!hideTeamColumn && !bowl) return null;

  return (
    <PanelRoot>
      {!hideTeamColumn ? (
        <>
          <PanelColumnSlot>
            <PanelTeamColumn team={bowl} />
          </PanelColumnSlot>
          <PartialDivider />
        </>
      ) : null}
      <PanelHeadingLines label="PROJECTED SCORE" />
      <PartialDivider />
      <PanelColumnSlot>
        <PanelMetricColumn label="SCORE" value={projectedScore} />
      </PanelColumnSlot>
      <PartialDivider />
    </PanelRoot>
  );
}

function DefaultZoneCPanel({ panel, frame, bowl }) {
  switch (panel) {
    case 'crr':
      return <RunRateMetricsPanel frame={frame} bowl={bowl} metric="crr" />;
    case 'rrr':
      return <RunRateMetricsPanel frame={frame} bowl={bowl} metric="rrr" />;
    case 'projectedScore':
      return <ProjectedScorePanel projectedScore={frame.projectedScore} hideTeamColumn />;
    case 'partnership':
      return <PartnershipPanel partnership={frame.partnership} team={bowl} hideTeamColumn />;
    case 'needTarget':
      return <NeedTargetPanel runsToWin={frame.runsToWin} ballsRemaining={frame.ballsRemaining} withHeading />;
    default:
      return <RunRateMetricsPanel frame={frame} bowl={bowl} metric="crr" />;
  }
}

function AtStagePanel({ label = 'AT THIS STAGE', comparisons }) {
  if (!comparisons?.length) return null;

  return (
    <PanelWithHeading label={label}>
      {comparisons.map((entry, index) => (
        <PanelColumnSlot key={entry.label ?? index} showDivider={index > 0}>
          <AtStageTeamColumn entry={entry} />
        </PanelColumnSlot>
      ))}
    </PanelWithHeading>
  );
}

function WinPredictionTeamColumn({ team, entry }) {
  const code = team.code ?? team.name;
  return <PanelMetricColumn label={code} value={entry.percent} suffix="%" suffixBright teamLabel />;
}

function WinPredictionPanel({ label = 'WIN PREDICTION', predictions, teams }) {
  const entries = (predictions ?? []).map((entry) => ({ entry, team: teams[entry.teamCode] })).filter(({ team }) => team);

  if (!entries.length) return null;

  return (
    <PanelWithHeading label={label}>
      {entries.map(({ entry, team }, index) => (
        <PanelColumnSlot key={entry.teamCode} showDivider={index > 0}>
          <WinPredictionTeamColumn team={team} entry={entry} />
        </PanelColumnSlot>
      ))}
    </PanelWithHeading>
  );
}

function PartnershipPanel({ partnership, team, hideTeamColumn = false }) {
  if (!partnership) return null;
  if (!hideTeamColumn && !team) return null;
  return (
    <PanelRoot>
      <PanelHeadingLines label="CURRENT PARTNERSHIP" />
      <PartialDivider />
      <PanelColumnSlot>
        <PanelMetricColumn label="RUNS" value={partnership.runs} />
      </PanelColumnSlot>
      <PartialDivider />
      <PanelColumnSlot>
        <PanelMetricColumn label="BALLS" value={partnership.balls} />
      </PanelColumnSlot>
      {!hideTeamColumn ? (
        <>
          <PartialDivider />
          <PanelColumnSlot>
            <PanelTeamColumn team={team} />
          </PanelColumnSlot>
        </>
      ) : null}
      <PartialDivider />
    </PanelRoot>
  );
}

function HMini({ label, value, labelClassName, hideLabel }) {
  return (
    <div className="flex flex-col">
      {!hideLabel ? (
        <span
          className={cn(
            '[font-family:var(--font-ui)] font-semibold tracking-[0.14em] text-[var(--text-secondary)]',
            labelClassName ?? 'text-xs',
          )}
        >
          {label}
        </span>
      ) : null}
      <span
        className={cn(DISPLAY_FONT, 'leading-none font-bold whitespace-nowrap text-[var(--text)]')}
        style={{ fontSize: lt.overs }}
      >
        {value}
      </span>
    </div>
  );
}

function HBat({ p, onStrike, truncateName = false, compact = false }) {
  return (
    <div className={cn('flex min-w-0 flex-1 items-center', onStrike ? 'gap-2' : 'gap-3')}>
      <StrikeBatIcon onStrike={onStrike} size={24} />
      <span
        className={cn(
          '[font-family:var(--font-ui)] leading-none whitespace-nowrap',
          truncateName ? cn('min-w-0 flex-1', PLAYER_NAME_TRUNCATE_CLASS) : 'min-w-0 flex-1 overflow-hidden text-ellipsis',
          onStrike ? 'font-bold text-white' : cn('font-bold', TEXT_SECONDARY),
        )}
        style={{ fontSize: compact ? lt.batNameCompact : lt.batName }}
      >
        {p.name.toUpperCase()}
      </span>
      <BatterScoreInline
        runs={p.runs}
        balls={p.balls}
        runsSize={compact ? lt.batRunsCompact : lt.batRuns}
        ballsSize={lt.batBalls}
        onStrike={onStrike}
        className="ml-2"
      />
    </div>
  );
}

// ── Shared score / name annotation ────────────────────────────────────────────

/**
 * Renders the not-out asterisk (*) in gold superscript style.
 * Wrap the sibling element and this in a `flex items-start` container so the
 * asterisk appears at the top-right (superscript) of the number or name.
 */
export function NotOutStar({ notOut }) {
  if (!notOut) return null;
  return <span className={cn(DISPLAY_FONT, 'text-[22px] leading-none font-extrabold text-[#f5c85a]')}>*</span>;
}
