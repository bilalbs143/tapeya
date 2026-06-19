/**
 * Ported from theme-controller — render-only graphic.
 */
import { cn } from '@/lib/utils';

import { accentGlowShadow, accentMix, DISPLAY_FONT, FSStage, UI_FONT } from '../../primitives';
import { ChartRightCrests } from './ChartRightCrests';

/** Manhattan chart plot area — design canvas pixels (PSL reference). */
const CHART_W = 1180;
const CHART_H = 600;

const BAR_GAP = 26;

/** Stagger: top team bar base delay (ms). */
const BAR_TOP_BASE_DELAY_MS = 150;
/** Extra offset before bottom team bar in the same bucket (ms). */
const BAR_BOTTOM_DELAY_OFFSET_MS = 60;
/** Per-bucket stagger increment (ms). */
const BAR_BUCKET_STAGGER_MS = 120;

/** Shared chart frame padding — PSL reference. */
const CHART_PAD_L = 96;
const CHART_PAD_T = 24;
const CHART_PAD_B = 64;
const CHART_PAD_R = 24;

const chartTitleClass = cn('m-0 text-[76px] font-extrabold leading-[0.95] text-white uppercase whitespace-nowrap', DISPLAY_FONT);

const chartSubClass = cn('mt-2.5 mb-0 text-[24px] font-semibold tracking-[0.06em] text-[var(--muted)] uppercase', UI_FONT);

const axisTickClass = cn('text-[30px] font-bold text-[var(--muted)]', DISPLAY_FONT);

const axisLabelClass = cn('text-[18px] font-semibold tracking-[0.12em] text-[var(--faint)] uppercase', UI_FONT);

const xLabelClass = cn('text-[32px] font-bold text-white', DISPLAY_FONT);

function ChartHeader({ title, sub }) {
  return (
    <div className="absolute top-14 right-[520px] left-[70px] z-[3]">
      <h2 className={chartTitleClass}>{title}</h2>
      {sub ? <p className={chartSubClass}>{sub}</p> : null}
    </div>
  );
}

function ChartFrame({ width, height, yTicks, yMax, xLabels = null, yLabel, xLabel, children }) {
  const plotW = width - CHART_PAD_L - CHART_PAD_R;
  const plotH = height - CHART_PAD_T - CHART_PAD_B;

  return (
    <div className="relative" style={{ width, height }}>
      {yTicks.map((tick) => {
        const y = CHART_PAD_T + plotH - (tick / yMax) * plotH;

        return (
          <div key={tick}>
            <div className="absolute h-px bg-white/14" style={{ left: CHART_PAD_L, top: y, width: plotW }} />
            <span
              className={cn('absolute text-right', axisTickClass)}
              style={{
                left: 0,
                top: y - 18,
                width: CHART_PAD_L - 18,
              }}
            >
              {tick}
            </span>
          </div>
        );
      })}

      <div
        className="absolute"
        style={{
          left: CHART_PAD_L,
          top: CHART_PAD_T,
          width: plotW,
          height: plotH,
        }}
      >
        {typeof children === 'function' ? children({ plotW, plotH }) : children}
      </div>

      {xLabels ? (
        <div
          className="absolute flex justify-around"
          style={{
            left: CHART_PAD_L,
            top: CHART_PAD_T + plotH + 12,
            width: plotW,
          }}
        >
          {xLabels.map((label, index) => (
            <span key={index} className={xLabelClass}>
              {label}
            </span>
          ))}
        </div>
      ) : null}

      {yLabel ? (
        <span
          className={cn('absolute origin-left -rotate-90', axisLabelClass)}
          style={{ left: -8, top: CHART_PAD_T + plotH / 2 }}
        >
          {yLabel}
        </span>
      ) : null}

      {xLabel ? (
        <span
          className={cn('absolute w-full text-center', axisLabelClass)}
          style={{
            left: CHART_PAD_L,
            top: height - 24,
            width: plotW,
          }}
        >
          {xLabel}
        </span>
      ) : null}
    </div>
  );
}

function ManhattanBar({ value, yMax, plotH, color, delay, badge = null }) {
  const height = (value / yMax) * plotH;
  if (!height) return null;

  return (
    <div
      className={cn(
        'relative w-[150px] origin-bottom rounded-t-lg',
        'motion-safe:animate-[barGrow_.7s_cubic-bezier(.2,.9,.2,1)_both]',
        'motion-reduce:animate-none',
      )}
      style={{
        height,
        background: `linear-gradient(180deg, ${color}, ${accentMix(color, 67)})`,
        boxShadow: `0 0 calc(20px * var(--glow)) ${accentMix(color, 27)}, inset 0 1px 0 rgba(255,255,255,.18)`,
        animationDelay: `${delay}ms`,
      }}
    >
      {badge != null ? (
        <span
          className={cn(
            'absolute -top-[18px] left-1/2 grid size-10 -translate-x-1/2 place-items-center',
            'rounded-full bg-white text-[24px] font-extrabold text-[#0a0e17]',
            'shadow-[0_4px_14px_rgba(0,0,0,0.5)]',
            DISPLAY_FONT,
          )}
        >
          {badge}
        </span>
      ) : null}
    </div>
  );
}

function ManhattanBars({ buckets, yMax, plotH, topColor, bottomColor, topWicketBadges = null }) {
  return (
    <div className="absolute inset-0 flex">
      {buckets.map((bucket, index) => (
        <div key={bucket.label} className="relative flex flex-1 items-end justify-center" style={{ gap: BAR_GAP }}>
          <ManhattanBar
            value={bucket.top}
            yMax={yMax}
            plotH={plotH}
            color={topColor}
            delay={BAR_TOP_BASE_DELAY_MS + index * BAR_BUCKET_STAGGER_MS}
            badge={topWicketBadges?.find((b) => b.bucketIndex === index)?.value ?? null}
          />
          <ManhattanBar
            value={bucket.bottom}
            yMax={yMax}
            plotH={plotH}
            color={bottomColor}
            delay={BAR_TOP_BASE_DELAY_MS + BAR_BOTTOM_DELAY_OFFSET_MS + index * BAR_BUCKET_STAGGER_MS}
          />
        </div>
      ))}
    </div>
  );
}

function TeamStrip({ name, score, accent }) {
  return (
    <div
      className="flex h-[70px] flex-1 items-center rounded-xl px-7"
      style={{
        background: `linear-gradient(100deg, ${accentMix(accent, 80)}, ${accentMix(accent, 20)} 85%)`,
        boxShadow: accentGlowShadow(accent, 13),
      }}
    >
      <span className={cn('text-[34px] font-extrabold tracking-[0.02em] whitespace-nowrap text-white uppercase', DISPLAY_FONT)}>
        {name}
      </span>
      <span className={cn('ml-auto text-[40px] font-extrabold whitespace-nowrap text-white', DISPLAY_FONT)}>{score}</span>
    </div>
  );
}

export function ManhattGraphic({ data }) {
  const { title, sub, teams, chart, summary } = data;
  const xLabels = chart.buckets.map((bucket) => bucket.label);

  return (
    <FSStage>
      <ChartHeader title={title} sub={sub} />
      <ChartRightCrests top={teams.top} bottom={teams.bottom} />

      <div className="absolute top-[240px] left-[70px]" style={{ width: CHART_W, height: CHART_H }}>
        <ChartFrame
          width={CHART_W}
          height={CHART_H}
          yMax={chart.yMax}
          yTicks={chart.yTicks}
          xLabels={xLabels}
          yLabel={chart.yLabel ?? 'RUNS PER OVER'}
          xLabel={chart.xLabel ?? 'OVERS'}
        >
          {({ plotH }) => (
            <ManhattanBars
              buckets={chart.buckets}
              yMax={chart.yMax}
              plotH={plotH}
              topColor={teams.top.accent}
              bottomColor={teams.bottom.accent}
              topWicketBadges={chart.topWicketBadges}
            />
          )}
        </ChartFrame>
      </div>

      <div className="absolute right-[580px] bottom-12 left-[70px] flex flex-col gap-3.5">
        <TeamStrip
          name={summary.top.name ?? teams.top.shortName ?? teams.top.name}
          score={summary.top.score}
          accent={teams.top.accent}
        />
        <TeamStrip
          name={summary.bottom.name ?? teams.bottom.shortName ?? teams.bottom.name}
          score={summary.bottom.score}
          accent={teams.bottom.accent}
        />
      </div>
    </FSStage>
  );
}
