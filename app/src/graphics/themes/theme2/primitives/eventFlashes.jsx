import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

import { animation, colors } from '../config';
import { isFlashBackgroundEnabled, isFlashTextGlowEnabled } from '../visualEffects';
import { accentMix, normalizeAccentColor, resolveCssColorRgb } from './accent';
import { StrapVapor } from './eventStraps';

// ── Flash overlays (full-screen transition header — single dominant title) ─────

function useFlashDismiss(durationMs) {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setLeaving(true), durationMs);
    return () => clearTimeout(timer);
  }, [durationMs]);
  return leaving;
}

/** Mix accent toward white (vMix-safe; avoids color-mix()). */
function accentTintTowardWhite(accent, accentWeight = 0.55) {
  const { r, g, b } = resolveCssColorRgb(normalizeAccentColor(accent));
  const w = 1 - accentWeight;
  return `rgb(${Math.round(r * accentWeight + 255 * w)}, ${Math.round(g * accentWeight + 255 * w)}, ${Math.round(b * accentWeight + 255 * w)})`;
}

/**
 * Theme3 ActionMessageOverlay recipe: white slam label + soft bloom + expanding ring,
 * optically centered above the default scorecard.
 *
 * @param {{
 *   label: string,
 *   accent: string,
 *   leaving?: boolean,
 * }} props
 */
function FstActionOverlay({ label, accent, leaving = false }) {
  const {
    cycleS,
    opticalPadY,
    glowSize,
    glowBlur,
    ringSize,
    titleSize,
    titleSizeCompact,
    letterSpacing,
    letterSpacingCompact,
    compactLabelMinLength,
  } = animation.fstAction;

  const isCompact = String(label).length >= compactLabelMinLength;
  const resolvedAccent = normalizeAccentColor(accent);
  const glowBackground = `radial-gradient(circle, ${accentMix(resolvedAccent, 50)} 0%, ${accentMix(resolvedAccent, 28)} 32%, ${accentMix(resolvedAccent, 12)} 58%, transparent 78%)`;
  const textShadow = `0 0 28px ${accentMix(resolvedAccent, 70)}, 0 4px 18px rgba(0,0,0,0.45)`;
  const cycle = `${cycleS}s`;

  return (
    <div
      className={cn('bc-fst-action', leaving && 'is-leaving')}
      style={{ paddingBottom: opticalPadY, '--fst-accent': resolvedAccent }}
      aria-live="polite"
    >
      {isFlashBackgroundEnabled() ? (
        <div
          className="bc-fst-action-glow"
          style={{
            width: glowSize,
            height: glowSize,
            filter: `blur(${glowBlur}px)`,
            background: glowBackground,
            animationDuration: cycle,
          }}
          aria-hidden
        />
      ) : null}
      <div
        className="bc-fst-action-ring"
        style={{
          width: ringSize,
          height: ringSize,
          borderColor: accentTintTowardWhite(resolvedAccent, 0.55),
          animationDuration: cycle,
        }}
        aria-hidden
      />
      <span
        className={cn('bc-fst-action-label bc-flash-title', isCompact && 'is-compact')}
        style={{
          fontSize: isCompact ? titleSizeCompact : titleSize,
          letterSpacing: isCompact ? letterSpacingCompact : letterSpacing,
          textShadow,
          animationDuration: cycle,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function FlashOverlay({ fixed, leaving, glow, children }) {
  return (
    <div
      className={cn(
        'pointer-events-none top-0 right-0 bottom-0 left-0 grid place-items-center transition-opacity duration-500 ease-out',
        fixed ? 'fixed z-50' : 'absolute z-20',
        leaving ? 'opacity-0' : 'opacity-100',
      )}
    >
      {isFlashBackgroundEnabled() && glow ? (
        <div className="absolute top-0 right-0 bottom-0 left-0" style={{ background: glow }} />
      ) : null}
      {children}
    </div>
  );
}

const BOUNDARY_THEMES = {
  four: {
    accent: colors.fourTitleColor,
    glow: colors.fourGlow,
    sparkInner: colors.fourSparkInner,
    sparkOuter: colors.fourSparkOuter,
    sparkShadow: colors.fourSparkShadow,
    title: 'FOUR',
    fstTitle: 'FOUR',
    titleColor: colors.fourTitleColor,
    titleShadow: colors.fourTitleShadow,
    subtitleColor: colors.fourSubtitle,
    titleSize: { compact: 120, full: 300 },
  },
  wide: {
    accent: colors.wideTitleColor,
    glow: colors.wideGlow,
    sparkInner: colors.wideSparkInner,
    sparkOuter: colors.wideSparkOuter,
    sparkShadow: colors.wideSparkShadow,
    title: 'WIDE',
    fstTitle: 'WIDE',
    titleColor: colors.wideTitleColor,
    titleShadow: colors.wideTitleShadow,
    subtitleColor: colors.wideSubtitle,
    titleSize: { compact: 120, full: 300 },
  },
  noBall: {
    accent: colors.noBallTitleColor,
    glow: colors.noBallGlow,
    sparkInner: colors.noBallSparkInner,
    sparkOuter: colors.noBallSparkOuter,
    sparkShadow: colors.noBallSparkShadow,
    title: 'NO BALL',
    fstTitle: 'NO BALL',
    titleColor: colors.noBallTitleColor,
    titleShadow: colors.noBallTitleShadow,
    subtitleColor: colors.noBallSubtitle,
    titleSize: { compact: 120, full: 300 },
  },
  six: {
    accent: colors.sixTitleColor,
    glow: colors.sixGlow,
    sparkInner: colors.sixSparkInner,
    sparkOuter: colors.sixSparkOuter,
    sparkShadow: colors.sixSparkShadow,
    title: 'SIX',
    fstTitle: 'SIX',
    titleColor: colors.sixTitleColor,
    titleShadow: colors.sixTitleShadow,
    subtitleColor: colors.sixSubtitle,
    titleSize: { compact: 120, full: 300 },
  },
  fiftyUp: {
    accent: colors.fiftyUpTitleColor,
    glow: colors.fiftyUpGlow,
    sparkInner: colors.fiftyUpSparkInner,
    sparkOuter: colors.fiftyUpSparkOuter,
    sparkShadow: colors.fiftyUpSparkShadow,
    title: 'FIFTY',
    fstTitle: '50',
    titleColor: colors.fiftyUpTitleColor,
    titleShadow: colors.fiftyUpTitleShadow,
    subtitleColor: colors.fiftyUpSubtitle,
    titleSize: { compact: 120, full: 300 },
  },
  hundredUp: {
    accent: colors.hundredUpTitleColor,
    glow: colors.hundredUpGlow,
    sparkInner: colors.hundredUpSparkInner,
    sparkOuter: colors.hundredUpSparkOuter,
    sparkShadow: colors.hundredUpSparkShadow,
    title: 'HUNDRED',
    fstTitle: '100',
    titleColor: colors.hundredUpTitleColor,
    titleShadow: colors.hundredUpTitleShadow,
    subtitleColor: colors.hundredUpSubtitle,
    titleSize: { compact: 120, full: 300 },
  },
  replay: {
    accent: colors.replayTitleColor,
    glow: colors.replayGlow,
    sparkInner: colors.replaySparkInner,
    sparkOuter: colors.replaySparkOuter,
    sparkShadow: colors.replaySparkShadow,
    title: 'REPLAY',
    fstTitle: 'REPLAY',
    titleColor: colors.replayTitleColor,
    titleShadow: colors.replayTitleShadow,
    subtitleColor: colors.replaySubtitle,
    titleSize: { compact: 120, full: 300 },
  },
  decisionPending: {
    accent: colors.decisionPendingTitleColor,
    glow: colors.decisionPendingGlow,
    sparkInner: colors.decisionPendingSparkInner,
    sparkOuter: colors.decisionPendingSparkOuter,
    sparkShadow: colors.decisionPendingSparkShadow,
    title: 'DECISION PENDING',
    fstTitle: 'DECISION PENDING',
    titleColor: colors.decisionPendingTitleColor,
    titleShadow: colors.decisionPendingTitleShadow,
    subtitleColor: colors.decisionPendingSubtitle,
    titleSize: { compact: 120, full: 300 },
  },
};

function BoundaryFlash({ variant, shot, compact, fixed = false }) {
  const theme = BOUNDARY_THEMES[variant];
  const leaving = useFlashDismiss(animation.flashDismissMs.boundary);
  const shotDisplay = shot ? String(shot).toUpperCase() : null;

  if (fixed) {
    return <FstActionOverlay label={theme.fstTitle ?? theme.title} accent={theme.accent} leaving={leaving} />;
  }

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
            color: theme.titleColor,
            ...(isFlashTextGlowEnabled()
              ? {
                  textShadow: `0 0 calc(40px * var(--glow)) ${theme.titleShadow}`,
                  filter: `drop-shadow(0 0 calc(40px*var(--glow)) ${theme.titleShadow})`,
                }
              : {}),
          }}
        >
          {theme.title}
        </div>
        {shotDisplay ? (
          <div
            className="bc-animate-strap-text-enter mt-2.5 [font-family:var(--font-ui)] font-semibold tracking-[0.04em] uppercase"
            style={{
              fontSize: compact ? 16 : 32,
              color: theme.subtitleColor,
              animationDelay: '0.12s',
            }}
          >
            {shotDisplay}
          </div>
        ) : null}
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

  if (fixed) {
    return <FstActionOverlay label="OUT" accent={colors.wicketTitleColor} leaving={leaving} />;
  }

  return (
    <FlashOverlay fixed={fixed} leaving={leaving} glow={colors.wicketGlow}>
      <div className="bc-animate-six-pop relative px-4 text-center">
        <div
          className="bc-flash-title"
          style={{
            fontSize: compact ? 120 : 300,
            color: colors.wicketTitleColor,
            ...(isFlashTextGlowEnabled()
              ? {
                  textShadow: `0 0 calc(40px * var(--glow)) ${colors.wicketTextShadow}`,
                  filter: `drop-shadow(0 0 calc(40px*var(--glow)) ${colors.wicketTextShadow})`,
                }
              : {}),
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

  if (fixed) {
    return <FstActionOverlay label="NOT OUT" accent={colors.notOutTitleColor} leaving={leaving} />;
  }

  return (
    <FlashOverlay fixed={fixed} leaving={leaving} glow={colors.notOutGlow}>
      <div className="bc-animate-six-pop relative px-4 text-center">
        <div
          className="bc-flash-title"
          style={{
            fontSize: compact ? 120 : 300,
            color: colors.notOutTitleColor,
            ...(isFlashTextGlowEnabled()
              ? {
                  textShadow: `0 0 calc(40px * var(--glow)) ${colors.notOutTextShadow}`,
                  filter: `drop-shadow(0 0 calc(40px*var(--glow)) ${colors.notOutTextShadow})`,
                }
              : {}),
          }}
        >
          NOT OUT
        </div>
      </div>
    </FlashOverlay>
  );
}
