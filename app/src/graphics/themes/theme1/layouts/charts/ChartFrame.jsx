import { cn } from '@/lib/utils';

import { fsChart } from '../../config';
import { fsFont } from '../../primitives';
import { CHART_AXIS_LABEL, CHART_AXIS_TICK, CHART_X_LABEL } from './chartTypographyStyles';

/** Shared chart frame padding — PSL reference. */
export const CHART_PAD_L = 96;
export const CHART_PAD_T = 24;
export const CHART_PAD_B = 64;
export const CHART_PAD_R = 24;

export function ChartFrame({ width, height, yTicks, yMax, xLabels = null, yLabel, xLabel, children }) {
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
