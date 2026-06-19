import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

import { animation, colors } from '../config';
import { StrapVapor } from './eventStraps';

// ── Flash overlays ────────────────────────────────────────────────────────────
function useFlashDismiss(durationMs) {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setLeaving(true), durationMs);
    return () => clearTimeout(timer);
  }, [durationMs]);
  return leaving;
}

function FlashOverlay({ fixed, leaving, glow, children }) {
  return (
    <div
      className={cn(
        'pointer-events-none inset-0 grid place-items-center transition-opacity duration-500 ease-out',
        fixed ? 'fixed z-50' : 'absolute z-20',
        leaving ? 'opacity-0' : 'opacity-100',
      )}
    >
      <div className="absolute inset-0" style={{ background: glow }} />
      {children}
    </div>
  );
}

const BOUNDARY_THEMES = {
  four: {
    glow: colors.fourGlow,
    sparkInner: colors.fourSparkInner,
    sparkOuter: colors.fourSparkOuter,
    sparkShadow: colors.fourSparkShadow,
    title: 'FOUR',
    titleGradient: colors.fourTitleGradient,
    titleShadow: colors.fourTitleShadow,
    subtitleColor: colors.fourSubtitle,
    titleSize: { compact: 120, full: 300 },
  },
  wide: {
    glow: colors.wideGlow,
    sparkInner: colors.wideSparkInner,
    sparkOuter: colors.wideSparkOuter,
    sparkShadow: colors.wideSparkShadow,
    title: 'WIDE',
    titleGradient: colors.wideTitleGradient,
    titleShadow: colors.wideTitleShadow,
    subtitleColor: colors.wideSubtitle,
    titleSize: { compact: 120, full: 300 },
  },
  noBall: {
    glow: colors.noBallGlow,
    sparkInner: colors.noBallSparkInner,
    sparkOuter: colors.noBallSparkOuter,
    sparkShadow: colors.noBallSparkShadow,
    title: 'NO BALL',
    titleGradient: colors.noBallTitleGradient,
    titleShadow: colors.noBallTitleShadow,
    subtitleColor: colors.noBallSubtitle,
    titleSize: { compact: 120, full: 300 },
  },
  six: {
    glow: colors.sixGlow,
    sparkInner: colors.sixSparkInner,
    sparkOuter: colors.sixSparkOuter,
    sparkShadow: colors.sixSparkShadow,
    title: 'SIX',
    titleGradient: colors.sixTitleGradient,
    titleShadow: colors.sixTitleShadow,
    subtitleColor: colors.sixSubtitle,
    titleSize: { compact: 120, full: 300 },
  },
  fiftyUp: {
    glow: colors.fiftyUpGlow,
    sparkInner: colors.fiftyUpSparkInner,
    sparkOuter: colors.fiftyUpSparkOuter,
    sparkShadow: colors.fiftyUpSparkShadow,
    title: 'FIFTY',
    titleGradient: colors.fiftyUpTitleGradient,
    titleShadow: colors.fiftyUpTitleShadow,
    subtitleColor: colors.fiftyUpSubtitle,
    titleSize: { compact: 120, full: 300 },
  },
  hundredUp: {
    glow: colors.hundredUpGlow,
    sparkInner: colors.hundredUpSparkInner,
    sparkOuter: colors.hundredUpSparkOuter,
    sparkShadow: colors.hundredUpSparkShadow,
    title: 'HUNDRED',
    titleGradient: colors.hundredUpTitleGradient,
    titleShadow: colors.hundredUpTitleShadow,
    subtitleColor: colors.hundredUpSubtitle,
    titleSize: { compact: 120, full: 300 },
  },
  replay: {
    glow: colors.replayGlow,
    sparkInner: colors.replaySparkInner,
    sparkOuter: colors.replaySparkOuter,
    sparkShadow: colors.replaySparkShadow,
    title: 'REPLAY',
    titleGradient: colors.replayTitleGradient,
    titleShadow: colors.replayTitleShadow,
    subtitleColor: colors.replaySubtitle,
    titleSize: { compact: 120, full: 300 },
  },
  decisionPending: {
    glow: colors.decisionPendingGlow,
    sparkInner: colors.decisionPendingSparkInner,
    sparkOuter: colors.decisionPendingSparkOuter,
    sparkShadow: colors.decisionPendingSparkShadow,
    title: 'DECISION PENDING',
    titleGradient: colors.decisionPendingTitleGradient,
    titleShadow: colors.decisionPendingTitleShadow,
    subtitleColor: colors.decisionPendingSubtitle,
    titleSize: { compact: 120, full: 300 },
  },
};

function BoundaryFlash({ variant, shot, compact, fixed = false }) {
  const theme = BOUNDARY_THEMES[variant];
  const leaving = useFlashDismiss(animation.flashDismissMs.boundary);

  return (
    <FlashOverlay fixed={fixed} leaving={leaving} glow={theme.glow}>
      <StrapVapor
        sparkInner={theme.sparkInner}
        sparkOuter={theme.sparkOuter}
        sparkShadow={theme.sparkShadow}
        bottom="34%"
        syncEnter
      />
      <div className="relative px-4 text-center">
        <div
          className="bc-flash-title bc-animate-strap-text-enter"
          style={{
            fontSize: compact ? (theme.titleSize?.compact ?? 96) : (theme.titleSize?.full ?? 230),
            backgroundImage: theme.titleGradient,
            filter: `drop-shadow(0 0 calc(40px*var(--glow)) ${theme.titleShadow})`,
          }}
        >
          {theme.title}
        </div>
        {shot && (
          <div
            className="bc-animate-strap-text-enter mt-2.5 [font-family:var(--font-ui)] font-semibold tracking-[0.04em]"
            style={{
              fontSize: compact ? 16 : 32,
              color: theme.subtitleColor,
              animationDelay: '0.12s',
            }}
          >
            {shot}
          </div>
        )}
      </div>
    </FlashOverlay>
  );
}

export function FourFlash(props) {
  return <BoundaryFlash variant="four" {...props} />;
}
export function WideFlash(props) {
  return <BoundaryFlash variant="wide" {...props} />;
}
export function NoBallFlash(props) {
  return <BoundaryFlash variant="noBall" {...props} />;
}
export function SixFlash(props) {
  return <BoundaryFlash variant="six" {...props} />;
}
export function FiftyUpFlash(props) {
  return <BoundaryFlash variant="fiftyUp" {...props} />;
}
export function HundredUpFlash(props) {
  return <BoundaryFlash variant="hundredUp" {...props} />;
}
export function ReplayFlash(props) {
  return <BoundaryFlash variant="replay" {...props} />;
}
export function DecisionPendingFlash(props) {
  return <BoundaryFlash variant="decisionPending" {...props} />;
}

export function WicketFlash({ compact, fixed = false }) {
  const leaving = useFlashDismiss(animation.flashDismissMs.wicket);
  return (
    <FlashOverlay fixed={fixed} leaving={leaving} glow={colors.wicketGlow}>
      <div className="bc-animate-six-pop relative px-4 text-center">
        <div
          className="bc-flash-title"
          style={{
            fontSize: compact ? 120 : 300,
            backgroundImage: colors.wicketTitleGradient,
            filter: `drop-shadow(0 0 calc(40px*var(--glow)) ${colors.wicketTextShadow})`,
          }}
        >
          WICKET
        </div>
      </div>
    </FlashOverlay>
  );
}

export function NotOutFlash({ compact, fixed = false }) {
  const leaving = useFlashDismiss(animation.flashDismissMs.wicket);
  return (
    <FlashOverlay fixed={fixed} leaving={leaving} glow={colors.notOutGlow}>
      <div className="bc-animate-six-pop relative px-4 text-center">
        <div
          className="bc-flash-title"
          style={{
            fontSize: compact ? 120 : 300,
            backgroundImage: colors.notOutTitleGradient,
            filter: `drop-shadow(0 0 calc(40px*var(--glow)) ${colors.notOutTextShadow})`,
          }}
        >
          NOT OUT
        </div>
      </div>
    </FlashOverlay>
  );
}
