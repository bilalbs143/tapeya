/**
 * Event LT bars — theme3 ActionBannerLowerThird look.
 * Full-bleed wine bar (h=139), four equal labels, chromatic text-shadow pulse.
 * StrapVapor kept for FST / flash overlays (not used on the LT bar itself).
 */
import { memo, useMemo } from 'react';

import { cn } from '@/lib/utils';

import { animation, colors, geometry, ltBar } from '../config';
import { useContainerWidth } from './controllerBarHooks';
import { horizontalBarScale } from './controllerBarScaling';
import { DISPLAY_FONT } from './formatters';

const STRAP_DESIGN_W = ltBar.designWidth;
const LABEL_COUNT = 4;
const ANIMATION_DELAYS_MS = [0, 240, 480, 720];
const COMPACT_LABEL_MIN_LENGTH = 8;
const LABEL_SIZE = 72;
const LABEL_SIZE_COMPACT = 36;

/** Dense spark field for flash overlays (not the ActionBanner LT). */
const STRAP_SPARK_COUNT = 120;

const STRAP_VARIANTS = {
  noBall: { title: 'NO BALL' },
  six: { title: 'SIX' },
  four: { title: 'FOUR' },
  wide: { title: 'WIDE' },
  notOut: { title: 'NOT OUT' },
  out: { title: 'OUT' },
  fiftyUp: { title: 'FIFTY' },
  hundredUp: { title: 'HUNDRED' },
  replay: { title: 'REPLAY' },
  decisionPending: { title: 'DECISION PENDING' },
};

function useSparkParticles(count, maxDelayS) {
  return useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: 2 + Math.random() * 96,
        delay: Math.random() * (maxDelayS ?? 1.2),
        dur: 1.0 + Math.random() * 2.8,
        size: 2 + Math.random() * 18,
        peak: 0.22 + Math.random() * 0.78,
        drift: (Math.random() - 0.5) * 160,
      })),
    [count, maxDelayS],
  );
}

/** Rising vapor/spark particles — shared by full-screen flash overlays. */
export function StrapVapor({ sparkInner, sparkOuter, sparkShadow, bottom = '0', syncEnter = false }) {
  const maxDelayS = syncEnter ? animation.strapTextEnterS : undefined;
  const sparks = useSparkParticles(STRAP_SPARK_COUNT, maxDelayS);

  return sparks.map((spark, i) => (
    <span
      key={i}
      aria-hidden
      className="bc-animate-spark-rise pointer-events-none absolute rounded-full"
      style={{
        bottom,
        left: `${spark.left}%`,
        width: spark.size,
        height: spark.size,
        background: `radial-gradient(circle, ${sparkInner}, ${sparkOuter})`,
        boxShadow: `0 0 8px ${sparkShadow}`,
        animationDelay: `${spark.delay}s`,
        animationDuration: `${spark.dur}s`,
        '--spark-peak': spark.peak,
        '--spark-drift': `${spark.drift}px`,
      }}
    />
  ));
}

/**
 * Theme3 ActionBanner — four balanced labels on wine panel.
 * @param {{ title: string, scale: number, radius: number }} props
 */
function ActionBanner({ title, scale, radius }) {
  const labels = Array.from({ length: LABEL_COUNT }, () => title);
  const isCompact = labels.some((label) => String(label).length > COMPACT_LABEL_MIN_LENGTH);
  const fontSize = isCompact ? LABEL_SIZE_COMPACT : LABEL_SIZE;

  return (
    <div
      className="origin-top-left overflow-hidden"
      style={{
        width: STRAP_DESIGN_W,
        transform: `scale(${scale})`,
        borderRadius: radius,
      }}
      data-testid="action-banner"
    >
      <div
        className="relative flex w-full items-center overflow-hidden"
        style={{
          height: ltBar.height,
          background: colors.panelPlayer,
        }}
      >
        <div className="grid h-full w-full grid-cols-4 items-center">
          {labels.map((label, index) => (
            <div key={`${label}-${index}`} className="flex h-full min-w-0 items-center justify-center overflow-hidden px-2">
              <span
                className={cn(
                  DISPLAY_FONT,
                  'bc-animate-action-text-shadow inline-block text-center leading-none font-bold tracking-[0.04em] text-white uppercase motion-reduce:animate-none',
                  isCompact && 'leading-tight tracking-[0.02em]',
                )}
                style={{
                  fontSize,
                  animationDelay: `${ANIMATION_DELAYS_MS[index] ?? 0}ms`,
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EventStrapBar({ variant, edgeToEdge = true }) {
  const tokens = STRAP_VARIANTS[variant];
  const [ref, w] = useContainerWidth();
  const effectiveW = w > 0 ? w : STRAP_DESIGN_W;
  const scale = horizontalBarScale(effectiveW, edgeToEdge);
  const radius = edgeToEdge ? geometry.barRadiusEdgeToEdge : geometry.barRadius;
  const scaledH = ltBar.height * scale;
  const scaledW = edgeToEdge ? '100%' : STRAP_DESIGN_W * scale;

  if (!tokens) return null;

  return (
    <div ref={ref} className={cn('flex w-full max-w-full overflow-hidden', edgeToEdge ? 'justify-stretch' : 'justify-center')}>
      <div className="max-w-full overflow-hidden" style={{ width: scaledW, height: scaledH }}>
        <ActionBanner title={tokens.title} scale={scale} radius={radius} />
      </div>
    </div>
  );
}

export const NoBallBar = memo(function NoBallBar({ edgeToEdge = true }) {
  return <EventStrapBar variant="noBall" edgeToEdge={edgeToEdge} />;
});
export const SixBar = memo(function SixBar({ edgeToEdge = true }) {
  return <EventStrapBar variant="six" edgeToEdge={edgeToEdge} />;
});
export const FourBar = memo(function FourBar({ edgeToEdge = true }) {
  return <EventStrapBar variant="four" edgeToEdge={edgeToEdge} />;
});
export const WideBar = memo(function WideBar({ edgeToEdge = true }) {
  return <EventStrapBar variant="wide" edgeToEdge={edgeToEdge} />;
});
export const NotOutBar = memo(function NotOutBar({ edgeToEdge = true }) {
  return <EventStrapBar variant="notOut" edgeToEdge={edgeToEdge} />;
});
export const OutBar = memo(function OutBar({ edgeToEdge = true }) {
  return <EventStrapBar variant="out" edgeToEdge={edgeToEdge} />;
});
export const FiftyUpBar = memo(function FiftyUpBar({ edgeToEdge = true }) {
  return <EventStrapBar variant="fiftyUp" edgeToEdge={edgeToEdge} />;
});
export const HundredUpBar = memo(function HundredUpBar({ edgeToEdge = true }) {
  return <EventStrapBar variant="hundredUp" edgeToEdge={edgeToEdge} />;
});
export const ReplayBar = memo(function ReplayBar({ edgeToEdge = true }) {
  return <EventStrapBar variant="replay" edgeToEdge={edgeToEdge} />;
});
export const DecisionPendingBar = memo(function DecisionPendingBar({ edgeToEdge = true }) {
  return <EventStrapBar variant="decisionPending" edgeToEdge={edgeToEdge} />;
});
