import { Fragment, memo, useLayoutEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { colors, geometry, ltBar, ltTypography } from '../config';
import { TEXT_PRIMARY } from '../layouts/shared/textStyles';
import { textGlowClass } from '../visualEffects';
import { AnimatedNumber, BallChip, BallTrack, Crest, GlowPanel, StrikeBatIcon } from './atoms';
import { BatterScoreInline } from './batterScore';
import { useContainerWidth } from './controllerBarHooks';
import { horizontalBarScale } from './controllerBarScaling';
import { DISPLAY_FONT } from './formatters';
import { PlayerAvatarImage } from './PlayerAvatarImage';
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
  showPlayerImages = false,
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
        showPlayerImages={showPlayerImages}
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

/** 4-zone grid: A (fixed) | B (1fr) | C (stat) | D (bowler wash).
 * Zone D width is design-px (not %), so it doesn't collapse inside an `auto` track.
 * Height is content-sized: crestSize + 2×controllerBarPaddingY (see ltBar in config). */
const BOWLER_PANEL_WIDTH = Math.min(
  Math.round((ltBar.designWidth * ltBar.bowlerPanelWidthPercent) / 100),
  ltBar.bowlerPanelMaxWidth,
);
const LAST30_PANEL_WIDTH = Math.min(
  Math.round((ltBar.designWidth * ltBar.last30BowlerPanelWidthPercent) / 100),
  ltBar.last30BowlerPanelMaxWidth,
);

/** @param {boolean} showZoneC @param {number} zoneDWidth */
function zoneGridStyle(showZoneC, zoneDWidth) {
  return {
    gridTemplateColumns: showZoneC ? `auto minmax(0, 1fr) auto ${zoneDWidth}px` : `auto minmax(0, 1fr) ${zoneDWidth}px`,
    columnGap: ltBar.zoneGapX,
  };
}
const ZONE_A_CLASS = 'flex h-full shrink-0 items-center self-stretch';
const ZONE_B_CLASS = 'flex h-full min-w-0 items-stretch self-stretch';
const ZONE_C_CLASS = 'flex h-full w-max shrink-0 items-center justify-center self-stretch overflow-hidden';
const ZONE_D_CLASS = 'flex h-full shrink-0 items-stretch self-stretch';

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
  showPlayerImages = false,
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
  // Theme3: Last 12/30, Current Partnership, Win Prediction, At Stage live in Zone D (no Zone C).
  const isZoneDFeature = isLastBalls || isCurrentPartnership || isWinPrediction || isAtStage;
  const isWideZoneD = isLast30Balls || isCurrentPartnership || isWinPrediction || isAtStage;
  const hideBowler = isAtStage || isWinPrediction || isCurrentPartnership || isLastBalls;
  // Theme3: This Over / Previous Over / Tour Hits have no Zone C (team short lives in Zone D only).
  const hideCrr = isThisOver || isFours || isSixes || isFifties || isHundreds || isRuns || isWickets || isPreviousOver;
  const showZoneC = !isZoneDFeature && (isNeedTarget || (barVariant === 'default' && Boolean(zoneCPanel)) || !hideCrr);
  const zoneDWidth = isWideZoneD ? LAST30_PANEL_WIDTH : BOWLER_PANEL_WIDTH;
  // Session home/away colors (same tokens as theme1 crest accents) → LT panel washes.
  const battingBg = bat?.color || colors.panelPlayer;
  const bowlingBg = bowl?.color || colors.panelBowler;
  /**
   * Zone D wash rule (scoreboard LTs):
   * - Bowling color when Zone D is bowling identity (bowler / this-over / previous-over / default / need / run-rate / tour-hits).
   * - Batting color when Zone D is a batting-side feature (no bowler): Last 12/30, Partnership, At Stage, Win Prediction.
   * Main bar (A/B) always stays batting wash; bowl crest can still sit at the Zone D edge either way.
   */
  const zoneDBackground = hideBowler ? battingBg : bowlingBg;
  const density = VARIANT_DENSITY[barVariant] ?? 'standard';
  const isCompact = density === 'compact';
  const ballTrackSize = lt.ballChip;
  const batsmenTruncate = truncatePlayerNames;
  const bowlerTruncate = truncatePlayerNames;
  const showAvatars = showPlayerImages;

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
        <GlowPanel
          hideRing
          radius={radius}
          className="grid w-full items-stretch"
          style={{ ...zoneGridStyle(showZoneC, zoneDWidth), background: battingBg }}
        >
          <EventSweep kind={kind} radius={radius} />

          {/* ZONE A — crest + code + stacked score. Height from crest + paddingY (theme1). */}
          <div
            className={ZONE_A_CLASS}
            style={{
              paddingLeft: ltBar.edgePaddingX,
              paddingRight: ltBar.zoneAPaddingRight,
              paddingTop: ltBar.controllerBarPaddingY,
              paddingBottom: ltBar.controllerBarPaddingY,
            }}
          >
            <div className="flex shrink-0 items-center" style={{ gap: ltBar.crestToCodeGap }}>
              <Crest team={bat} size={ltBar.crestSize} accent={bat.color} borderPulseOrder={1} />
              <span
                className="shrink-0 [font-family:var(--font-ui)] font-bold tracking-tight whitespace-nowrap text-white uppercase"
                style={{ fontSize: lt.teamName, paddingLeft: 12, paddingRight: 12 }}
              >
                {bat.code ?? bat.name}
              </span>
            </div>
            <div className="flex w-max shrink-0 flex-col items-end leading-none" style={{ marginLeft: ltBar.teamCodeToScoreGap }}>
              <div className="flex shrink-0 items-baseline leading-none">
                <AnimatedNumber
                  value={frame.total}
                  className={cn(SCORE_DISPLAY_CLASS, 'text-white', textGlowClass('score'))}
                  style={{ fontSize: lt.scoreTotal }}
                />
                <span className={cn(SCORE_DISPLAY_CLASS, 'text-white')} style={{ fontSize: lt.scoreSep }}>
                  {frame.scoreSep ?? '-'}
                </span>
                <AnimatedNumber
                  value={frame.wkts}
                  className={cn(SCORE_DISPLAY_CLASS, 'text-white')}
                  style={{ fontSize: lt.scoreWkts }}
                />
              </div>
              {frame.oversText ? (
                <div className="flex shrink-0 items-baseline leading-none text-white" style={{ gap: 10 }}>
                  <span className={cn(DISPLAY_FONT, 'font-bold tabular-nums')} style={{ fontSize: lt.overs }}>
                    {frame.oversText}
                  </span>
                  {frame.oversLimit ? (
                    <span className={cn(DISPLAY_FONT, 'font-bold tabular-nums')} style={{ fontSize: lt.oversLimit }}>
                      ({frame.oversLimit})
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          {/* ZONE B — equal batter columns + divider between batters. */}
          <div className={cn(ZONE_B_CLASS, 'py-0')}>
            <PartialDivider />
            <div
              className="relative flex min-w-0 flex-1 items-stretch justify-center self-stretch"
              style={{
                paddingLeft: showAvatars ? ltBar.avatarPadX : isCompact ? lt.columnPaddingXCompact : 20,
                paddingRight: showAvatars ? ltBar.avatarPadX : isCompact ? lt.columnPaddingXCompact : 20,
              }}
            >
              <HBat
                p={frame.striker}
                onStrike={frame.striker.onStrike}
                truncateName={batsmenTruncate}
                compact={isCompact}
                showAvatar={showAvatars}
              />
            </div>
            <PartialDivider />
            <div
              className="relative flex min-w-0 flex-1 items-stretch justify-center self-stretch"
              style={{
                paddingLeft: showAvatars ? ltBar.avatarPadX : isCompact ? lt.columnPaddingXCompact : 20,
                paddingRight: showAvatars ? ltBar.avatarPadX : isCompact ? lt.columnPaddingXCompact : 20,
              }}
            >
              <HBat
                p={frame.nonStriker}
                onStrike={frame.nonStriker.onStrike}
                truncateName={batsmenTruncate}
                compact={isCompact}
                showAvatar={showAvatars}
              />
            </div>
          </div>

          {/* ZONE C — black KPI strip when the variant has stats; omitted for This Over / Prev Over / Tour Hits / Last 12–30 / Partnership / Win Prediction / At Stage (theme3). */}
          {showZoneC ? (
            <div
              className={ZONE_C_CLASS}
              style={{
                gap: ltBar.zoneCInnerGapX,
                background: colors.panelStat,
                minWidth: ltBar.statColMinWidth,
              }}
            >
              {isNeedTarget ? (
                <NeedTargetPanel runsToWin={frame.runsToWin} ballsRemaining={frame.ballsRemaining} />
              ) : barVariant === 'default' && zoneCPanel ? (
                <DefaultZoneCPanel key={zoneCPanel} panel={zoneCPanel} frame={frame} bowl={bowl} />
              ) : barVariant === 'default' ? (
                <StatItemColumn label={frame.rrLabel ?? 'CRR'} value={frame.rr} />
              ) : (
                <RunRateMetricsPanel frame={frame} bowl={bowl} includeRrr={isRunRate} hideTeamColumn={isRunRate} />
              )}
            </div>
          ) : null}

          {/* ZONE D — wash + bowler (or Last 12/30 / Partnership / Win Prediction / At Stage) + crest. */}
          <div
            className={cn(ZONE_D_CLASS, hideBowler && !isZoneDFeature && 'justify-end')}
            style={{
              gap: isZoneDFeature ? 8 : showAvatars && !hideBowler ? 20 : 32,
              width: '100%',
              minWidth: zoneDWidth,
              // No vertical pad when avatars fill the bar (flush bottom cutouts).
              paddingTop: showAvatars && !hideBowler ? 0 : ltBar.controllerBarPaddingY,
              paddingBottom: showAvatars && !hideBowler ? 0 : ltBar.controllerBarPaddingY,
              background: zoneDBackground,
            }}
          >
            {isLast30Balls ? (
              <div className="flex min-h-0 min-w-0 flex-1 items-stretch self-stretch overflow-hidden">
                <Last30StatsPanel stats={frame.last30Stats} />
              </div>
            ) : isLast12Balls ? (
              <div className="flex min-h-0 min-w-0 flex-1 items-stretch self-stretch overflow-hidden">
                <LastBallsPanel
                  chips={frame.last12Chips ?? []}
                  label={frame.last12Label ?? 'LAST 12 BALLS'}
                  totalRuns={frame.last12Runs ?? frame.runs ?? null}
                  chipSize={ballTrackSize}
                  fill
                />
              </div>
            ) : isCurrentPartnership ? (
              <div className="flex min-h-0 min-w-0 flex-1 items-stretch self-stretch overflow-hidden">
                <PartnershipPanel partnership={frame.partnership} hideTeamColumn fill />
              </div>
            ) : isAtStage ? (
              <div className="flex min-h-0 min-w-0 flex-1 items-stretch self-stretch overflow-hidden">
                <AtStagePanel label={frame.stageLabel ?? 'AT THIS STAGE'} comparisons={frame.stageComparison} fill />
              </div>
            ) : isWinPrediction ? (
              <div className="flex min-h-0 min-w-0 flex-1 items-stretch self-stretch overflow-hidden">
                <WinPredictionPanel
                  label={frame.predictionLabel ?? 'WIN PREDICTION'}
                  predictions={frame.predictions}
                  teams={teams}
                  fill
                />
              </div>
            ) : !hideBowler ? (
              <div
                className={cn('flex min-w-0 flex-1', showAvatars ? 'items-stretch' : 'items-center')}
                style={{
                  gap: showAvatars ? ltBar.avatarGap : undefined,
                  paddingLeft: showAvatars ? ltBar.avatarPadX : 28,
                  paddingRight: showAvatars ? ltBar.avatarPadEnd : 12,
                }}
              >
                {showAvatars ? <LtPlayerAvatar src={frame.bowler.avatarUrl} name={frame.bowler.name} /> : null}
                <div className={cn('min-w-0 flex-1 text-left', showAvatars && 'flex flex-col justify-center')}>
                  <div className="flex min-w-0 items-baseline justify-between" style={{ gap: ltBar.bowlerInlineGap }}>
                    <span
                      className={cn(
                        'min-w-0 overflow-hidden [font-family:var(--font-ui)] font-bold tracking-wide text-ellipsis whitespace-nowrap text-white',
                        bowlerTruncate && PLAYER_NAME_TRUNCATE_CLASS,
                      )}
                      style={{ fontSize: lt.bowlerName }}
                    >
                      {frame.bowler.name.toUpperCase()}
                    </span>
                    <div
                      className={cn('flex shrink-0 items-baseline whitespace-nowrap text-white tabular-nums', DISPLAY_FONT)}
                      style={{ gap: 8, fontSize: lt.bowlerFigures }}
                    >
                      <span className="font-bold">{bowlerStats.figures}</span>
                      <span className="font-bold" style={{ fontSize: lt.bowlerName }}>
                        ({bowlerStats.overs})
                      </span>
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
              </div>
            ) : null}
            <div className="flex h-full shrink-0 items-center" style={{ gap: 8, paddingLeft: 8, paddingRight: 16 }}>
              {(bowl.code || bowl.name) && (
                <span
                  className="shrink-0 [font-family:var(--font-ui)] font-bold tracking-wide whitespace-nowrap text-white uppercase"
                  style={{ fontSize: lt.teamName, paddingLeft: 12, paddingRight: 12 }}
                >
                  {bowl.code ?? bowl.name}
                </span>
              )}
              <Crest team={bowl} size={ltBar.crestSize} accent={bowl.color} borderPulseOrder={2} />
            </div>
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
      className="flex h-full shrink-0 items-center justify-center self-stretch"
      style={{ width: ltBar.dividerSlotWidth }}
    >
      <div
        className="w-px"
        style={{
          height: ltBar.dividerLineHeight,
          background: colors.batsmenDivider,
        }}
      />
    </div>
  );
}

/** Zone C panels — content-width only; never flex-grow into Zone B's budget. */
const PANEL_ROOT_CLASS = 'flex w-max shrink-0 items-center self-stretch';
const PANEL_COLUMN_SLOT_CLASS = 'flex shrink-0 items-center justify-center self-stretch';
const PANEL_TEAM_COLUMN_SHELL_CLASS = 'flex shrink-0 flex-col items-center justify-center text-center';

function PanelRoot({ children, className, ariaLabel }) {
  return (
    <div className={cn(PANEL_ROOT_CLASS, className)} style={{ gap: ltBar.zoneCInnerGapX }} aria-label={ariaLabel}>
      {children}
    </div>
  );
}

function PanelColumnSlot({ children }) {
  return <div className={PANEL_COLUMN_SLOT_CLASS}>{children}</div>;
}

/**
 * Side heading + divider + column slots + trailing divider.
 * Used by At Stage, Win Prediction, Last 30, and Current Partnership.
 * @param {{ leadingDivider?: boolean }} props — left rule before the heading (Zone D vs Zone B).
 */
function PanelWithHeading({ label, ariaLabel, children, headingVariant = 'kpi', className, leadingDivider = false }) {
  return (
    <PanelRoot className={className} ariaLabel={ariaLabel ?? label}>
      {leadingDivider ? <PartialDivider /> : null}
      <PanelHeadingLines label={label} variant={headingVariant} />
      <PartialDivider />
      {children}
      <PartialDivider />
    </PanelRoot>
  );
}

function BowlerSubRow({ chipSize, children }) {
  return (
    <div className="mt-2.5 flex items-center justify-start" style={{ height: chipSize }}>
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
          <span className={cn(labelClass, TEXT_PRIMARY)} style={{ fontSize: lt.lastOverLabel }}>
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
      className="box-border flex min-w-0 flex-1 basis-0 flex-col items-center justify-center text-center"
      style={{
        gap: lt.columnGap,
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
    <PanelWithHeading label="LAST 30 BALLS" headingVariant="last30" className="w-full min-w-0 flex-1" leadingDivider>
      {LAST_30_STAT_COLUMNS.map((col, index) => (
        <Fragment key={col.key}>
          {index > 0 ? <PartialDivider /> : null}
          <div className="flex min-w-0 flex-1 basis-0 items-center justify-center self-stretch">
            <Last30StatColumn label={col.label} value={stats[col.key]} />
          </div>
        </Fragment>
      ))}
    </PanelWithHeading>
  );
}

/** Center-panel multi-ball strip — same chip size as Zone D BallTrack (lt.ballChip). */
function LastBallsPanel({ chips, label = 'LAST 12 BALLS', totalRuns, chipSize = lt.ballChip, fitContent = false, fill = false }) {
  const list = chips ?? [];
  if (!list.length && totalRuns == null) return null;

  const body = (
    <div
      className={cn(
        'flex min-w-0 flex-col justify-center gap-2 overflow-hidden px-4',
        fitContent ? 'w-fit shrink-0' : 'min-w-0 flex-1',
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
          {list.map((chip, i) => (
            <BallChip key={`${chip.code}-${i}`} code={chip.code} chipType={chip.chipType} size={chipSize} animate={false} />
          ))}
        </div>
      </div>
    </div>
  );

  // Zone D feature fill — same left/right rules as Current Partnership PanelWithHeading.
  if (fill) {
    return (
      <PanelRoot className="w-full min-w-0 flex-1" ariaLabel={label}>
        <PartialDivider />
        {body}
        <PartialDivider />
      </PanelRoot>
    );
  }

  return body;
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
            className={cn(DISPLAY_FONT, 'font-semibold text-white tabular-nums')}
            style={{ fontSize: suffixBright ? lt.kpiWinPredictionPercentSuffix : lt.kpiPartnershipSuffix }}
          >
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Controller-3 StatItem — single black-column stack: heading(s) above, value below.
 * Used by Default LT Zone C rotation (CRR / Projected / Partnership / Need).
 */
function StatItemColumn({ label, value, sublabel = null }) {
  const lines = Array.isArray(label) ? label.filter(Boolean) : [label].filter((line) => line != null && line !== '');
  return (
    <div
      className="flex h-full w-full min-w-0 flex-col items-center justify-center overflow-hidden text-center"
      style={{ paddingLeft: 8, paddingRight: 8, gap: 4 }}
    >
      {lines.map((line, index) => (
        <span
          key={`${line}-${index}`}
          className="[font-family:var(--font-ui)] leading-none font-bold tracking-wide whitespace-nowrap text-white uppercase"
          style={{ fontSize: lines.length > 1 && index === 0 ? lt.kpiSideHeadingLine1 : lt.kpiColumnLabel }}
        >
          {line}
        </span>
      ))}
      <AnimatedNumber
        value={value ?? '—'}
        className={cn(DISPLAY_FONT, 'leading-none font-bold whitespace-nowrap text-white tabular-nums')}
        style={{ fontSize: lt.kpiMetricValue }}
      />
      {sublabel != null && sublabel !== '' ? (
        <span className="[font-family:var(--font-ui)] font-medium whitespace-nowrap text-white" style={{ fontSize: 14 }}>
          {sublabel}
        </span>
      ) : null}
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

function RunRateMetricsPanel({ frame, bowl, includeRrr = false, metric, teamFirst = false, hideTeamColumn = false }) {
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

  const teamColumn = hideTeamColumn ? null : (
    <PanelColumnSlot>
      <PanelTeamColumn team={bowl} />
    </PanelColumnSlot>
  );

  const metricColumns = columns.map((col, index) => (
    <Fragment key={col.key}>
      {index > 0 ? <PartialDivider /> : null}
      <PanelColumnSlot>
        <PanelMetricColumn label={col.label} value={col.value} />
      </PanelColumnSlot>
    </Fragment>
  ));

  return (
    <PanelRoot>
      {teamFirst && teamColumn ? (
        <>
          {teamColumn}
          <PartialDivider />
          {metricColumns}
        </>
      ) : (
        <>
          {metricColumns}
          {teamColumn ? (
            <>
              <PartialDivider />
              {teamColumn}
            </>
          ) : null}
        </>
      )}
      {/* Trailing divider only when Zone C also shows bowling team (theme1 family).
          Default LT matches controller-3: no line between CRR and bowler wash. */}
      {hideTeamColumn ? null : <PartialDivider />}
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
        <span className={cn(SCORE_DISPLAY_CLASS, TEXT_PRIMARY)} style={{ fontSize: lt.kpiAtStageSep }}>
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
      <StatItemColumn label={runsLabel} value={runsToWin} />
      <PartialDivider />
      <StatItemColumn label={ballsLabel} value={ballsRemaining} />
    </>
  );

  if (!withHeading) {
    return (
      <div className="flex w-fit shrink-0 items-center self-stretch" aria-label={ariaLabel}>
        {metrics}
      </div>
    );
  }

  // Default LT / controller-3 needTarget — two StatItems: TO WIN | BALLS (no side heading).
  return (
    <div className="flex w-fit shrink-0 items-center self-stretch" aria-label={ariaLabel}>
      {metrics}
    </div>
  );
}

function ProjectedScorePanel({ projectedScore, bowl, hideTeamColumn = false }) {
  if (projectedScore == null) return null;
  if (!hideTeamColumn && !bowl) return null;

  if (hideTeamColumn) {
    return <StatItemColumn label={['PROJECTED', 'SCORE']} value={projectedScore} />;
  }

  return (
    <PanelRoot>
      <PanelColumnSlot>
        <PanelTeamColumn team={bowl} />
      </PanelColumnSlot>
      <PartialDivider />
      <StatItemColumn label={['PROJECTED', 'SCORE']} value={projectedScore} />
      <PartialDivider />
    </PanelRoot>
  );
}

function DefaultZoneCPanel({ panel, frame, bowl }) {
  let content = null;
  switch (panel) {
    case 'crr':
      content = <StatItemColumn label={frame.rrLabel ?? 'CRR'} value={frame.rr} />;
      break;
    case 'rrr':
      content = frame.rrr == null ? null : <StatItemColumn label={frame.rrrLabel ?? 'RRR'} value={frame.rrr} />;
      break;
    case 'projectedScore':
      content = <ProjectedScorePanel projectedScore={frame.projectedScore} hideTeamColumn />;
      break;
    case 'partnership':
      content = <PartnershipPanel partnership={frame.partnership} team={bowl} hideTeamColumn />;
      break;
    case 'needTarget':
      content = <NeedTargetPanel runsToWin={frame.runsToWin} ballsRemaining={frame.ballsRemaining} withHeading />;
      break;
    default:
      content = <StatItemColumn label={frame.rrLabel ?? 'CRR'} value={frame.rr} />;
  }

  if (!content) return null;

  return <div className="bc-animate-zone-c-rise flex h-full w-full items-center justify-center">{content}</div>;
}

function AtStagePanel({ label = 'AT THIS STAGE', comparisons, fill = false }) {
  if (!comparisons?.length) return null;

  return (
    <PanelWithHeading label={label} className={fill ? 'w-full min-w-0 flex-1' : undefined} leadingDivider={fill}>
      {comparisons.map((entry, index) => (
        <Fragment key={entry.label ?? index}>
          {index > 0 ? <PartialDivider /> : null}
          {fill ? (
            <div className="flex min-w-0 flex-1 basis-0 items-center justify-center self-stretch">
              <AtStageTeamColumn entry={entry} />
            </div>
          ) : (
            <PanelColumnSlot>
              <AtStageTeamColumn entry={entry} />
            </PanelColumnSlot>
          )}
        </Fragment>
      ))}
    </PanelWithHeading>
  );
}

function WinPredictionTeamColumn({ team, entry }) {
  const code = String(team.code ?? team.name ?? '').toUpperCase();
  // Same label hierarchy as Partnership RUNS/BALLS (not oversized team-code style).
  return <PanelMetricColumn label={code} value={entry.percent} suffix="%" suffixBright />;
}

function WinPredictionPanel({ label = 'WIN PREDICTION', predictions, teams, fill = false }) {
  const entries = (predictions ?? []).map((entry) => ({ entry, team: teams[entry.teamCode] })).filter(({ team }) => team);

  if (!entries.length) return null;

  const metricSlot = (team, entry) =>
    fill ? (
      <div className="flex min-w-0 flex-1 basis-0 items-center justify-center self-stretch">
        <WinPredictionTeamColumn team={team} entry={entry} />
      </div>
    ) : (
      <PanelColumnSlot>
        <WinPredictionTeamColumn team={team} entry={entry} />
      </PanelColumnSlot>
    );

  return (
    <PanelWithHeading label={label} className={fill ? 'w-full min-w-0 flex-1' : undefined} leadingDivider={fill}>
      {entries.map(({ entry, team }, index) => (
        <Fragment key={entry.teamCode}>
          {index > 0 ? <PartialDivider /> : null}
          {metricSlot(team, entry)}
        </Fragment>
      ))}
    </PanelWithHeading>
  );
}

function PartnershipPanel({ partnership, team, hideTeamColumn = false, fill = false }) {
  if (!partnership) return null;
  if (!hideTeamColumn && !team) return null;

  if (hideTeamColumn && !fill) {
    const runs = partnership.runs ?? 0;
    const balls = partnership.balls;
    const value = balls != null ? `${runs}(${balls})` : runs;
    return <StatItemColumn label="PARTNERSHIP" value={value} />;
  }

  const metricSlot = (label, value) =>
    fill ? (
      <div className="flex min-w-0 flex-1 basis-0 items-center justify-center self-stretch">
        <PanelMetricColumn label={label} value={value} />
      </div>
    ) : (
      <PanelColumnSlot>
        <PanelMetricColumn label={label} value={value} />
      </PanelColumnSlot>
    );

  return (
    <PanelWithHeading label="CURRENT PARTNERSHIP" className={fill ? 'w-full min-w-0 flex-1' : undefined} leadingDivider={fill}>
      {metricSlot('RUNS', partnership.runs)}
      <PartialDivider />
      {metricSlot('BALLS', partnership.balls)}
      {!hideTeamColumn && team ? (
        <>
          <PartialDivider />
          <PanelColumnSlot>
            <PanelTeamColumn team={team} />
          </PanelColumnSlot>
        </>
      ) : null}
    </PanelWithHeading>
  );
}

/**
 * LT player cutout — same placeholder as FS PlayerAvatarImage when photo missing/broken.
 * Full bar height, feet flush to bottom edge, slight scale like controller-3 avatar-lg.
 */
function LtPlayerAvatar({ src, name }) {
  return (
    <div className="relative h-full shrink-0 overflow-hidden" style={{ width: ltBar.avatarWidth }}>
      <div className="absolute bottom-0 left-0 h-full w-full origin-bottom" style={{ transform: 'scale(1.05)' }}>
        <PlayerAvatarImage src={src} alt={name ?? 'Player'} fit="contain-bottom" plate={false} lining={false} />
      </div>
    </div>
  );
}

function HBat({ p, onStrike, truncateName = false, compact = false, showAvatar = false }) {
  const score = (
    <BatterScoreInline
      runs={p.runs}
      balls={p.balls}
      runsSize={compact ? lt.batRunsCompact : lt.batRuns}
      ballsSize={lt.batBalls}
      onStrike
      className="shrink-0"
    />
  );

  const nameBlock = (
    <div className="relative max-w-full min-w-0 leading-tight">
      {onStrike ? (
        <span
          className="pointer-events-none absolute top-1/2 right-full flex -translate-y-1/2 items-center justify-center"
          style={{ marginRight: 6 }}
          aria-hidden="true"
        >
          <StrikeBatIcon onStrike size={22} />
        </span>
      ) : null}
      <span
        className={cn(
          'block min-w-0 [font-family:var(--font-ui)] leading-none font-bold tracking-wide whitespace-nowrap text-white',
          truncateName ? PLAYER_NAME_TRUNCATE_CLASS : 'overflow-hidden text-ellipsis',
        )}
        style={{ fontSize: compact ? lt.batNameCompact : lt.batName }}
      >
        {p.name.toUpperCase()}
      </span>
    </div>
  );

  if (showAvatar) {
    return (
      <div className="flex h-full w-full min-w-0 items-stretch" style={{ gap: ltBar.avatarGap }}>
        <LtPlayerAvatar src={p.avatarUrl} name={p.name} />
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center overflow-visible">
          <div className="relative flex w-max max-w-full min-w-0 flex-col leading-none">
            {nameBlock}
            {score}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-max max-w-full min-w-0 items-center leading-none" style={{ gap: ltBar.batterNameScoreGap }}>
      {nameBlock}
      {score}
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
