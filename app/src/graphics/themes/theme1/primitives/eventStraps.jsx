import { memo, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { animation, colors, geometry, ltBar, ltTypography } from '../config';
import { GlowPanel } from './atoms';
import { useContainerWidth } from './controllerBarHooks';
import { horizontalBarScale } from './controllerBarScaling';

// ── EventStrapBar (NoBall, Six, …) ────────────────────────────────────────────
const STRAP_DESIGN_W = ltBar.designWidth;

const STRAP_VARIANTS = {
  noBall: {
    title: 'NO BALL',
    accent: colors.noBallStrapAccent,
    panelGlow: colors.noBallStrapPanelGlow,
    sweep: colors.noBallStrapSweep,
    titleShadow: colors.noBallStrapTitleShadow,
    sparkInner: colors.noBallSparkInner,
    sparkOuter: colors.noBallSparkOuter,
    sparkShadow: colors.noBallSparkShadow,
  },
  six: {
    title: 'SIX',
    accent: colors.sixStrapAccent,
    panelGlow: colors.sixStrapPanelGlow,
    sweep: colors.sixStrapSweep,
    titleShadow: colors.sixStrapTitleShadow,
    sparkInner: colors.sixSparkInner,
    sparkOuter: colors.sixSparkOuter,
    sparkShadow: colors.sixSparkShadow,
  },
  four: {
    title: 'FOUR',
    accent: colors.fourStrapAccent,
    panelGlow: colors.fourStrapPanelGlow,
    sweep: colors.fourStrapSweep,
    titleShadow: colors.fourStrapTitleShadow,
    sparkInner: colors.fourSparkInner,
    sparkOuter: colors.fourSparkOuter,
    sparkShadow: colors.fourSparkShadow,
  },
  wide: {
    title: 'WIDE',
    accent: colors.wideStrapAccent,
    panelGlow: colors.wideStrapPanelGlow,
    sweep: colors.wideStrapSweep,
    titleShadow: colors.wideStrapTitleShadow,
    sparkInner: colors.wideSparkInner,
    sparkOuter: colors.wideSparkOuter,
    sparkShadow: colors.wideSparkShadow,
  },
  notOut: {
    title: 'NOT OUT',
    accent: colors.notOutStrapAccent,
    panelGlow: colors.notOutStrapPanelGlow,
    sweep: colors.notOutStrapSweep,
    titleShadow: colors.notOutStrapTitleShadow,
    sparkInner: '#d4ffe8',
    sparkOuter: colors.notOutStrapAccent,
    sparkShadow: colors.notOutStrapTitleShadow,
  },
  out: {
    title: 'OUT',
    accent: colors.outStrapAccent,
    panelGlow: colors.outStrapPanelGlow,
    sweep: colors.outStrapSweep,
    titleShadow: colors.outStrapTitleShadow,
    sparkInner: '#ffc8d4',
    sparkOuter: colors.outStrapAccent,
    sparkShadow: colors.outStrapTitleShadow,
  },
  fiftyUp: {
    title: 'FIFTY',
    accent: colors.fiftyUpStrapAccent,
    panelGlow: colors.fiftyUpStrapPanelGlow,
    sweep: colors.fiftyUpStrapSweep,
    titleShadow: colors.fiftyUpStrapTitleShadow,
    sparkInner: colors.fiftyUpSparkInner,
    sparkOuter: colors.fiftyUpSparkOuter,
    sparkShadow: colors.fiftyUpSparkShadow,
  },
  hundredUp: {
    title: 'HUNDRED',
    accent: colors.hundredUpStrapAccent,
    panelGlow: colors.hundredUpStrapPanelGlow,
    sweep: colors.hundredUpStrapSweep,
    titleShadow: colors.hundredUpStrapTitleShadow,
    sparkInner: colors.hundredUpSparkInner,
    sparkOuter: colors.hundredUpSparkOuter,
    sparkShadow: colors.hundredUpSparkShadow,
  },
  replay: {
    title: 'REPLAY',
    accent: colors.replayStrapAccent,
    panelGlow: colors.replayStrapPanelGlow,
    sweep: colors.replayStrapSweep,
    titleShadow: colors.replayStrapTitleShadow,
    sparkInner: colors.replaySparkInner,
    sparkOuter: colors.replaySparkOuter,
    sparkShadow: colors.replaySparkShadow,
  },
  decisionPending: {
    title: 'DECISION PENDING',
    accent: colors.decisionPendingStrapAccent,
    panelGlow: colors.decisionPendingStrapPanelGlow,
    sweep: colors.decisionPendingStrapSweep,
    titleShadow: colors.decisionPendingStrapTitleShadow,
    sparkInner: colors.decisionPendingSparkInner,
    sparkOuter: colors.decisionPendingSparkOuter,
    sparkShadow: colors.decisionPendingSparkShadow,
  },
};

function useSparkParticles(count = animation.sparkCount, maxDelayS) {
  return useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: 6 + Math.random() * 88,
        delay: Math.random() * (maxDelayS ?? 0.5),
        dur: 1.4 + Math.random() * 1.1,
        size: 5 + Math.random() * 8,
      })),
    [count, maxDelayS],
  );
}

/** Rising vapor/spark particles — shared by event straps and full-screen flashes. */
export function StrapVapor({ sparkInner, sparkOuter, sparkShadow, bottom = '0', syncEnter = false }) {
  const maxDelayS = syncEnter ? animation.strapTextEnterS : undefined;
  const sparks = useSparkParticles(animation.sparkCount, maxDelayS);

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
        boxShadow: `0 0 10px ${sparkShadow}`,
        animationDelay: `${spark.delay}s`,
        animationDuration: `${spark.dur}s`,
      }}
    />
  ));
}

function EventStrap({ variant, containerW, edgeToEdge = true }) {
  const tokens = STRAP_VARIANTS[variant];
  const innerRef = useRef(null);
  const [natH, setNatH] = useState(0);
  const scale = horizontalBarScale(containerW, edgeToEdge);
  const radius = edgeToEdge ? geometry.barRadiusEdgeToEdge : geometry.barRadius;

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
    <div
      className="max-w-full overflow-hidden"
      style={{ width: edgeToEdge ? '100%' : STRAP_DESIGN_W * scale, height: natH * scale }}
    >
      <div ref={innerRef} className="origin-top-left" style={{ width: STRAP_DESIGN_W, transform: `scale(${scale})` }}>
        <GlowPanel
          radius={radius}
          accent={tokens.accent}
          hideRing
          className="flex w-full items-center justify-center overflow-hidden px-[38px]"
          style={{
            height: ltBar.height,
            boxShadow: `0 18px 50px rgba(0,0,0,.55), 0 0 calc(30px*var(--glow)) ${tokens.panelGlow}, inset 0 1px 0 rgba(255,255,255,.07)`,
          }}
        >
          <div
            className="bc-animate-strap-sweep pointer-events-none absolute inset-0 z-[5]"
            style={{
              borderRadius: radius,
              background: `linear-gradient(90deg, transparent, ${tokens.sweep} 50%, transparent)`,
            }}
          />
          <StrapVapor sparkInner={tokens.sparkInner} sparkOuter={tokens.sparkOuter} sparkShadow={tokens.sparkShadow} />
          <span
            className="bc-animate-strap-text-loop relative z-[6] text-center [font-family:var(--font-display)] leading-[0.9] font-extrabold tracking-[0.02em] whitespace-nowrap text-white"
            style={{
              fontSize: ltTypography.strapTitle,
              textShadow: `0 0 calc(34px*var(--glow)) ${tokens.titleShadow}`,
            }}
          >
            {tokens.title}
          </span>
        </GlowPanel>
      </div>
    </div>
  );
}

function EventStrapBar({ variant, edgeToEdge = true }) {
  const [ref, w] = useContainerWidth();
  return (
    <div ref={ref} className={cn('flex w-full max-w-full overflow-hidden', edgeToEdge ? 'justify-stretch' : 'justify-center')}>
      {w === 0 ? null : <EventStrap variant={variant} containerW={w} edgeToEdge={edgeToEdge} />}
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
