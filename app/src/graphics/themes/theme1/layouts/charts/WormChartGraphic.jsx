/**
 * Ported from theme-controller — render-only graphic.
 */
import { useLayoutEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { fsChart } from '../../config';
import { accentMix, DISPLAY_FONT, fsFont, FSStage, UI_FONT } from '../../primitives';
import { chartGlowFilter } from '../../visualEffects';
import { TEXT_SECONDARY } from '../shared/textStyles';
import { ChartHeader } from './ChartHeader';
import { ChartRightCrests } from './ChartRightCrests';
import { CHART_AXIS_LABEL, CHART_AXIS_TICK, CHART_X_LABEL } from './chartTypographyStyles';

/** Cyan milestone markers on the worm line — matches PSL reference. */
const WORM_MARKER_COLOR = '#3ad6ff';

/** Worm chart plot area — design canvas pixels (PSL reference). */
const CHART_W = 1180;
const CHART_H = 560;

/** Shared chart frame padding — PSL reference. */
const CHART_PAD_L = 96;
const CHART_PAD_T = 24;
const CHART_PAD_B = 64;
const CHART_PAD_R = 24;

/**
 * Map cumulative run values to SVG plot coordinates.
 *
 * @param {number[]} values cumulative runs per over
 * @param {{ xMax: number, yMax: number, plotW: number, plotH: number }} scale
 * @returns {[number, number][]}
 */
function toPlotPoints(values, { xMax, yMax, plotW, plotH }) {
  return values
    .map((value, index) => {
      if (value == null) return null;
      const x = ((index + 1) / xMax) * plotW;
      const y = plotH - (value / yMax) * plotH;
      return [x, y];
    })
    .filter(Boolean);
}

/** @param {[number, number][]} points */
function toPathD(points) {
  return points.map((point, index) => `${index ? 'L' : 'M'}${point[0].toFixed(1)} ${point[1].toFixed(1)}`).join(' ');
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
              className={cn('absolute text-right', CHART_AXIS_TICK)}
              style={{
                ...fsFont(fsChart.axisTick),
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
            <span key={index} className={CHART_X_LABEL} style={fsFont(fsChart.xLabel)}>
              {label}
            </span>
          ))}
        </div>
      ) : null}

      {yLabel ? (
        <span
          className={cn('absolute origin-left -rotate-90', CHART_AXIS_LABEL)}
          style={{ ...fsFont(fsChart.axisLabel), left: -8, top: CHART_PAD_T + plotH / 2 }}
        >
          {yLabel}
        </span>
      ) : null}

      {xLabel ? (
        <span
          className={cn('absolute w-full text-center', CHART_AXIS_LABEL)}
          style={{
            ...fsFont(fsChart.axisLabel),
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

function MiniStat({ label, value, accent }) {
  return (
    <div
      className={cn('flex h-14 flex-1 items-center justify-between rounded-[10px] px-[22px]', 'border')}
      style={{
        background: `linear-gradient(100deg, ${accentMix(accent, 33)}, rgba(14,19,32,.85))`,
        borderColor: accentMix(accent, 27),
      }}
    >
      <span className={cn('text-[20px] font-semibold tracking-[0.1em] uppercase', TEXT_SECONDARY, UI_FONT)}>{label}</span>
      <span className={cn('text-[34px] font-extrabold text-white', DISPLAY_FONT)}>{value}</span>
    </div>
  );
}

function WormMeta({ name, meta, accent }) {
  return (
    <div className="flex flex-1 flex-col gap-2.5">
      <div
        className="flex h-16 items-center overflow-hidden rounded-xl border"
        style={{
          background: 'linear-gradient(180deg, rgba(22,28,42,.92), rgba(11,15,24,.95))',
          borderColor: accentMix(accent, 33),
        }}
      >
        <span
          className={cn(
            'flex-1 overflow-hidden px-[22px] text-[30px] font-extrabold tracking-[0.02em]',
            'text-ellipsis whitespace-nowrap text-white uppercase',
            DISPLAY_FONT,
          )}
        >
          {name}
        </span>
        <span className={cn('px-[18px] text-[36px] font-extrabold whitespace-nowrap text-white', DISPLAY_FONT)}>
          {meta.total}
        </span>
        <span className="flex h-full flex-col justify-center px-[22px]" style={{ background: accentMix(accent, 20) }}>
          <span className={cn('text-[16px] font-semibold tracking-[0.1em] text-[var(--text-secondary)] uppercase', UI_FONT)}>
            OVERS
          </span>
          <span className={cn('text-[30px] font-extrabold text-white', DISPLAY_FONT)}>{meta.overs}</span>
        </span>
      </div>

      <div className="flex gap-2.5">
        <MiniStat label="FOURS" value={meta.fours} accent={accent} />
        <MiniStat label="SIXES" value={meta.sixes} accent={accent} />
      </div>
    </div>
  );
}

function WormLines({ topSeries, bottomSeries, topColor, bottomColor, xMax, yMax, plotW, plotH, markerPointIndices = [] }) {
  const scale = { xMax, yMax, plotW, plotH };
  const origin = [0, plotH];
  const topPoints = [origin, ...toPlotPoints(topSeries, scale)];
  const bottomPoints = [origin, ...toPlotPoints(bottomSeries, scale)];
  const topPathRef = useRef(null);
  const bottomPathRef = useRef(null);
  const [lengths, setLengths] = useState({ top: 0, bottom: 0 });

  useLayoutEffect(() => {
    setLengths({
      top: topPathRef.current?.getTotalLength() ?? 0,
      bottom: bottomPathRef.current?.getTotalLength() ?? 0,
    });
  }, [plotW, plotH, topSeries, bottomSeries, xMax, yMax]);

  const markerPoints = markerPointIndices.map((index) => bottomPoints[index]).filter(Boolean);

  const pathClass = cn(
    'fill-none stroke-[6px] [stroke-linejoin:round] [stroke-linecap:round]',
    'motion-safe:animate-[wormDraw_1.1s_cubic-bezier(.2,.9,.2,1)_forwards]',
    'motion-reduce:animate-none motion-reduce:[stroke-dashoffset:0]',
  );

  const pathsReady = lengths.top > 0 && lengths.bottom > 0;

  return (
    <svg width={plotW} height={plotH} className="absolute inset-0 overflow-visible" aria-hidden="true">
      <path
        key={pathsReady ? `top-${lengths.top}` : 'top-pending'}
        ref={topPathRef}
        d={toPathD(topPoints)}
        className={pathClass}
        stroke={topColor}
        style={{
          filter: chartGlowFilter(`drop-shadow(0 0 calc(8px * var(--glow)) ${topColor})`),
          strokeDasharray: pathsReady ? lengths.top : undefined,
          strokeDashoffset: pathsReady ? lengths.top : undefined,
          animationDelay: '180ms',
        }}
      />
      <path
        key={pathsReady ? `bottom-${lengths.bottom}` : 'bottom-pending'}
        ref={bottomPathRef}
        d={toPathD(bottomPoints)}
        className={pathClass}
        stroke={bottomColor}
        style={{
          filter: chartGlowFilter(`drop-shadow(0 0 calc(8px * var(--glow)) ${bottomColor})`),
          strokeDasharray: pathsReady ? lengths.bottom : undefined,
          strokeDashoffset: pathsReady ? lengths.bottom : undefined,
          animationDelay: '320ms',
        }}
      />
      {markerPoints.map((point, index) => (
        <circle
          key={index}
          cx={point[0]}
          cy={point[1]}
          r="11"
          fill={WORM_MARKER_COLOR}
          stroke="#0a0e17"
          strokeWidth="3"
          style={{ filter: `drop-shadow(0 0 8px ${WORM_MARKER_COLOR})` }}
        />
      ))}
    </svg>
  );
}

export function WormChartGraphic({ data }) {
  const { title, sub, teams, chart, meta } = data;
  const plotW = CHART_W - CHART_PAD_L - CHART_PAD_R;
  const plotH = CHART_H - CHART_PAD_T - CHART_PAD_B;
  const markerLeft = chart.markerOver ? CHART_PAD_L + (chart.markerOver / chart.xMax) * plotW - 8 : null;

  return (
    <FSStage>
      <ChartHeader title={title} sub={sub} />
      <ChartRightCrests top={teams.top} bottom={teams.bottom} />

      <div className="absolute top-[220px] left-[70px]" style={{ width: CHART_W, height: CHART_H }}>
        <ChartFrame
          width={CHART_W}
          height={CHART_H}
          yMax={chart.yMax}
          yTicks={chart.yTicks}
          yLabel={chart.yLabel ?? 'RUNS'}
          xLabel="OVERS"
        >
          {({ plotW: innerPlotW, plotH: innerPlotH }) => (
            <WormLines
              topSeries={chart.topSeries}
              bottomSeries={chart.bottomSeries}
              topColor={teams.top.accent}
              bottomColor={teams.bottom.accent}
              xMax={chart.xMax}
              yMax={chart.yMax}
              plotW={innerPlotW}
              plotH={innerPlotH}
              markerPointIndices={chart.markerPointIndices}
            />
          )}
        </ChartFrame>

        {markerLeft != null ? (
          <span
            className={CHART_X_LABEL}
            style={{
              ...fsFont(fsChart.xLabel),
              position: 'absolute',
              left: markerLeft,
              top: CHART_PAD_T + plotH + 14,
            }}
          >
            {chart.markerOver}
          </span>
        ) : null}
      </div>

      <div className="absolute right-[540px] bottom-11 left-[70px] flex gap-7">
        <WormMeta name={teams.bottom.name} meta={meta.bottom} accent={teams.bottom.accent} />
        <WormMeta name={teams.top.name} meta={meta.top} accent={teams.top.accent} />
      </div>
    </FSStage>
  );
}
