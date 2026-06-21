import { forwardRef, memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { animation, colors, geometry, ltBar } from '../config';
import { useContainerWidth } from './controllerBarHooks';
import { horizontalBarScale } from './controllerBarScaling';

// ── Constants ──────────────────────────────────────────────────────────────────
const STRAP_DESIGN_W = ltBar.designWidth;

// Separate speeds create a parallax depth effect between the two layers.
// Both are derived from measured rendered width so word length never affects speed.
const TICKER_PX_PER_SEC = 140; // main foreground ticker — faster, punchy
const BG_PX_PER_SEC = 85; // background word grid — slower, receding depth

const TICKER_WORD_REPEATS = 10;
const TICKER_WORD_GAP = 100; // px gap between main ticker word instances
const TICKER_FONT_SIZE = '68px';

const BG_FONT_SIZE = '42px';
const BG_WORD_GAP = 120; // px gap between bg word instances (measured proportionally)

/** Dense spark field for event straps (flash overlays use animation.sparkCount). */
const STRAP_SPARK_COUNT = 120;

// ── Variant config ─────────────────────────────────────────────────────────────
const STRAP_VARIANTS = {
  noBall: {
    title: 'NO BALL',
    accent: colors.noBallStrapAccent,
    panelGlow: colors.noBallStrapPanelGlow,
    titleShadow: colors.noBallStrapTitleShadow,
    bandBg: 'linear-gradient(to bottom, rgba(176,24,128,0.68), rgba(140,10,96,0.68))',
    bandSolid: 'rgba(140,10,96,0.68)',
    sparkInner: colors.noBallSparkInner,
    sparkOuter: colors.noBallSparkOuter,
    sparkShadow: colors.noBallSparkShadow,
  },
  six: {
    title: 'SIX',
    accent: colors.sixStrapAccent,
    panelGlow: colors.sixStrapPanelGlow,
    titleShadow: colors.sixStrapTitleShadow,
    bandBg: 'linear-gradient(to bottom, rgba(176,136,0,0.68), rgba(138,106,0,0.68))',
    bandSolid: 'rgba(138,106,0,0.68)',
    sparkInner: colors.sixSparkInner,
    sparkOuter: colors.sixSparkOuter,
    sparkShadow: colors.sixSparkShadow,
  },
  four: {
    title: 'FOUR',
    accent: colors.fourStrapAccent,
    panelGlow: colors.fourStrapPanelGlow,
    titleShadow: colors.fourStrapTitleShadow,
    bandBg: 'linear-gradient(to bottom, rgba(18,84,200,0.68), rgba(10,62,168,0.68))',
    bandSolid: 'rgba(10,62,168,0.68)',
    sparkInner: colors.fourSparkInner,
    sparkOuter: colors.fourSparkOuter,
    sparkShadow: colors.fourSparkShadow,
  },
  wide: {
    title: 'WIDE',
    accent: colors.wideStrapAccent,
    panelGlow: colors.wideStrapPanelGlow,
    titleShadow: colors.wideStrapTitleShadow,
    bandBg: 'linear-gradient(to bottom, rgba(204,116,0,0.68), rgba(168,88,0,0.68))',
    bandSolid: 'rgba(168,88,0,0.68)',
    sparkInner: colors.wideSparkInner,
    sparkOuter: colors.wideSparkOuter,
    sparkShadow: colors.wideSparkShadow,
  },
  notOut: {
    title: 'NOT OUT',
    accent: colors.notOutStrapAccent,
    panelGlow: colors.notOutStrapPanelGlow,
    titleShadow: colors.notOutStrapTitleShadow,
    bandBg: 'linear-gradient(to bottom, rgba(0,152,72,0.68), rgba(0,110,48,0.68))',
    bandSolid: 'rgba(0,110,48,0.68)',
    sparkInner: '#d4ffe8',
    sparkOuter: colors.notOutStrapAccent,
    sparkShadow: colors.notOutStrapTitleShadow,
  },
  out: {
    title: 'OUT',
    accent: colors.outStrapAccent,
    panelGlow: colors.outStrapPanelGlow,
    titleShadow: colors.outStrapTitleShadow,
    bandBg: 'linear-gradient(to bottom, rgba(204,8,32,0.68), rgba(168,0,16,0.68))',
    bandSolid: 'rgba(168,0,16,0.68)',
    sparkInner: '#ffc8d4',
    sparkOuter: colors.outStrapAccent,
    sparkShadow: colors.outStrapTitleShadow,
  },
  fiftyUp: {
    title: 'FIFTY',
    accent: colors.fiftyUpStrapAccent,
    panelGlow: colors.fiftyUpStrapPanelGlow,
    titleShadow: colors.fiftyUpStrapTitleShadow,
    bandBg: 'linear-gradient(to bottom, rgba(152,112,48,0.68), rgba(116,80,16,0.68))',
    bandSolid: 'rgba(116,80,16,0.68)',
    sparkInner: colors.fiftyUpSparkInner,
    sparkOuter: colors.fiftyUpSparkOuter,
    sparkShadow: colors.fiftyUpSparkShadow,
  },
  hundredUp: {
    title: 'HUNDRED',
    accent: colors.hundredUpStrapAccent,
    panelGlow: colors.hundredUpStrapPanelGlow,
    titleShadow: colors.hundredUpStrapTitleShadow,
    bandBg: 'linear-gradient(to bottom, rgba(176,136,0,0.68), rgba(140,106,0,0.68))',
    bandSolid: 'rgba(140,106,0,0.68)',
    sparkInner: colors.hundredUpSparkInner,
    sparkOuter: colors.hundredUpSparkOuter,
    sparkShadow: colors.hundredUpSparkShadow,
  },
  replay: {
    title: 'REPLAY',
    accent: colors.replayStrapAccent,
    panelGlow: colors.replayStrapPanelGlow,
    titleShadow: colors.replayStrapTitleShadow,
    bandBg: 'linear-gradient(to bottom, rgba(8,152,184,0.68), rgba(4,112,144,0.68))',
    bandSolid: 'rgba(4,112,144,0.68)',
    sparkInner: colors.replaySparkInner,
    sparkOuter: colors.replaySparkOuter,
    sparkShadow: colors.replaySparkShadow,
  },
  decisionPending: {
    title: 'DECISION PENDING',
    accent: colors.decisionPendingStrapAccent,
    panelGlow: colors.decisionPendingStrapPanelGlow,
    titleShadow: colors.decisionPendingStrapTitleShadow,
    bandBg: 'linear-gradient(to bottom, rgba(192,96,0,0.68), rgba(154,68,0,0.68))',
    bandSolid: 'rgba(154,68,0,0.68)',
    sparkInner: colors.decisionPendingSparkInner,
    sparkOuter: colors.decisionPendingSparkOuter,
    sparkShadow: colors.decisionPendingSparkShadow,
  },
};

// ── Spark particles ────────────────────────────────────────────────────────────
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

/** Rising vapor/spark particles — shared by event straps and full-screen flashes. */
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

// ── Scroll measurement ─────────────────────────────────────────────────────────
// useLayoutEffect fires before paint — no flash on mount.
// document.fonts.ready guards against measurements before the display font loads.
function useElementWidth(ref, key) {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const w = el.offsetWidth;
    if (w) setWidth(w);
  }, [key]);

  useEffect(() => {
    let live = true;
    const el = ref.current;
    if (!el) return;

    document.fonts.ready.then(() => {
      if (!live) return;
      const w = el.offsetWidth;
      if (w) setWidth((prev) => (prev === w ? prev : w));
    });

    return () => {
      live = false;
    };
  }, [key]);

  return width;
}

function scrollAnim(px, pxPerSec) {
  return {
    animation: `tickerScroll ${(px / pxPerSec).toFixed(2)}s linear infinite`,
    '--ticker-px': `${px}px`,
  };
}

// ── Main ticker ────────────────────────────────────────────────────────────────
const TickerCopy = forwardRef(function TickerCopy({ title, textStyle }, ref) {
  return (
    <div ref={ref} className="flex shrink-0 items-center" style={{ gap: TICKER_WORD_GAP }}>
      {Array.from({ length: TICKER_WORD_REPEATS }, (_, i) => (
        <span
          key={i}
          className="shrink-0 [font-family:var(--font-display)] leading-none font-extrabold tracking-[0.06em] whitespace-nowrap text-white"
          style={textStyle}
        >
          {title}
        </span>
      ))}
    </div>
  );
});

const TickerTrack = memo(function TickerTrack({ title, titleShadow }) {
  const copy1Ref = useRef(null);
  const copy1W = useElementWidth(copy1Ref, title);
  const px = copy1W + TICKER_WORD_GAP;

  const textStyle = {
    fontSize: TICKER_FONT_SIZE,
    textShadow: `0 2px calc(16px*var(--glow)) ${titleShadow}, 0 0 calc(32px*var(--glow)) ${titleShadow}`,
  };

  return (
    <div
      className="bc-strap-ticker-track flex shrink-0 items-center will-change-transform"
      style={{ gap: TICKER_WORD_GAP, ...(copy1W ? scrollAnim(px, TICKER_PX_PER_SEC) : undefined) }}
    >
      <TickerCopy title={title} textStyle={textStyle} ref={copy1Ref} />
      <TickerCopy title={title} textStyle={textStyle} />
    </div>
  );
});

// ── Background word track ──────────────────────────────────────────────────────
const BG_TEXT_CLASS =
  'absolute whitespace-nowrap [font-family:var(--font-display)] font-extrabold tracking-[0.08em] text-white pointer-events-none';

const BgCopy = forwardRef(function BgCopy({ word, colSpacing, numCols }, ref) {
  const baseStyle = { fontSize: BG_FONT_SIZE, transform: 'translateY(-50%)' };
  return (
    <div ref={ref} className="relative shrink-0" style={{ width: colSpacing * numCols, height: '100%' }}>
      {Array.from({ length: numCols }, (_, i) => (
        <span key={`r1-${i}`} className={BG_TEXT_CLASS} style={{ ...baseStyle, left: i * colSpacing, top: '30%', opacity: 0.1 }}>
          {word}
        </span>
      ))}
      {Array.from({ length: numCols }, (_, i) => (
        <span
          key={`r2-${i}`}
          className={BG_TEXT_CLASS}
          style={{ ...baseStyle, left: i * colSpacing + colSpacing / 2, top: '70%', opacity: 0.07 }}
        >
          {word}
        </span>
      ))}
    </div>
  );
});

const BackgroundWordTrack = memo(function BackgroundWordTrack({ word }) {
  const wordMeasureRef = useRef(null);
  const copy1Ref = useRef(null);
  const [bgWordW, setBgWordW] = useState(0);
  const [animPx, setAnimPx] = useState(0);

  useLayoutEffect(() => {
    const el = wordMeasureRef.current;
    if (!el) return;
    const w = el.offsetWidth;
    if (w) setBgWordW(w);
  }, [word]);

  useLayoutEffect(() => {
    if (!bgWordW) return;
    const el = copy1Ref.current;
    if (!el) return;
    const w = el.offsetWidth;
    if (w) setAnimPx(w);
  }, [bgWordW, word]);

  useEffect(() => {
    let live = true;

    document.fonts.ready.then(() => {
      if (!live) return;
      const measureEl = wordMeasureRef.current;
      if (measureEl) {
        const w = measureEl.offsetWidth;
        if (w) setBgWordW((prev) => (prev === w ? prev : w));
      }
      const copyEl = copy1Ref.current;
      if (copyEl && bgWordW) {
        const w = copyEl.offsetWidth;
        if (w) setAnimPx((prev) => (prev === w ? prev : w));
      }
    });

    return () => {
      live = false;
    };
  }, [word, bgWordW]);

  const colSpacing = bgWordW ? bgWordW + BG_WORD_GAP : 400;
  const numCols = Math.ceil(STRAP_DESIGN_W / colSpacing) + 3;

  return (
    <div
      className="bc-strap-ticker-track pointer-events-none absolute inset-y-0 left-0 flex will-change-transform"
      style={animPx ? scrollAnim(animPx, BG_PX_PER_SEC) : undefined}
      aria-hidden="true"
    >
      <span
        ref={wordMeasureRef}
        className="pointer-events-none absolute [font-family:var(--font-display)] font-extrabold tracking-[0.08em] whitespace-nowrap"
        style={{ fontSize: BG_FONT_SIZE, top: -9999, opacity: 0 }}
      >
        {word}
      </span>

      <BgCopy ref={copy1Ref} word={word} colSpacing={colSpacing} numCols={numCols} />
      <BgCopy word={word} colSpacing={colSpacing} numCols={numCols} />
    </div>
  );
});

// ── EventStrap ─────────────────────────────────────────────────────────────────
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

  if (!tokens) return null;

  return (
    <div
      className="max-w-full overflow-hidden"
      style={{ width: edgeToEdge ? '100%' : STRAP_DESIGN_W * scale, height: natH * scale }}
    >
      <div ref={innerRef} className="origin-top-left" style={{ width: STRAP_DESIGN_W, transform: `scale(${scale})` }}>
        <div
          className="relative flex w-full items-center overflow-hidden"
          style={{
            height: ltBar.height,
            borderRadius: radius,
            background: tokens.bandBg,
            boxShadow: `0 18px 50px rgba(0,0,0,.6), 0 0 calc(28px*var(--glow)) ${tokens.panelGlow}`,
          }}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 30%, rgba(255,255,255,0.35) 70%, transparent 100%)',
            }}
          />

          <BackgroundWordTrack word={tokens.title} />

          <StrapVapor sparkInner={tokens.sparkInner} sparkOuter={tokens.sparkOuter} sparkShadow={tokens.sparkShadow} />

          <TickerTrack title={tokens.title} titleShadow={tokens.titleShadow} />

          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[180px]"
            style={{ background: `linear-gradient(to right, ${tokens.bandSolid} 20%, transparent)` }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[180px]"
            style={{ background: `linear-gradient(to left, ${tokens.bandSolid} 20%, transparent)` }}
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-[rgba(0,0,0,0.25)]" />
        </div>
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
