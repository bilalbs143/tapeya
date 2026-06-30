/**
 * Atomic broadcast graphic elements — crests, ball chips, glow panels, animated numbers.
 */
import { memo, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import cricketBatIcon from '../../../../assets/cricket-bat.png';
import { colors, ltTypography, typography } from '../config';
import { crestPulseClass, crestRingBoxShadow, crestRingClassName, isAmbientPulseEnabled } from '../visualEffects';
import { crestCodeFontSize, crestCornerRadius, crestLogoPadding } from './crestMetrics';
import { overlayVariantFor } from './playerBarHelpers';

function StrikeBatIcon({ onStrike, size = 24 }) {
  if (!onStrike) {
    return <span className="inline-block shrink-0" style={{ width: size, height: size }} aria-hidden="true" />;
  }

  return (
    <img
      src={cricketBatIcon}
      alt=""
      draggable={false}
      className="shrink-0 opacity-90"
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}

export const AnimatedNumber = memo(function AnimatedNumber({ value, className, style }) {
  const ref = useRef(null);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current === value || !ref.current) {
      prev.current = value;
      return;
    }

    const el = ref.current;
    el.classList.remove('bc-animate-num-pop');
    void el.offsetWidth;
    el.classList.add('bc-animate-num-pop');
    prev.current = value;
  }, [value]);

  return (
    <span ref={ref} className={className} style={style}>
      {value}
    </span>
  );
});

export const CountUpNumber = memo(function CountUpNumber({ value, className, duration, delay = 0 }) {
  // Always start from 0 on mount — the count-up IS the reveal animation.
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);
  const spanRef = useRef(null);

  useEffect(() => {
    const end = Number(value) || 0;
    const start = Number(prevRef.current) || 0;

    if (start === end) {
      setDisplay(end);
      return;
    }

    // Scale duration to value range so small counts feel snappy and large ones feel weighty.
    const scaledDuration = duration ?? (end <= 20 ? 750 : end <= 200 ? 950 : 1150);
    let frameId = 0;
    let timerId = 0;

    const animate = () => {
      const startTime = performance.now();

      const tick = (now) => {
        const t = Math.min(1, (now - startTime) / scaledDuration);
        const eased = 1 - (1 - t) ** 3;
        setDisplay(Math.round(start + (end - start) * eased));
        if (t < 1) {
          frameId = requestAnimationFrame(tick);
        } else {
          prevRef.current = end;
          // Landing "pop" — snap the number into place with a brief scale bounce.
          const el = spanRef.current;
          if (el) {
            el.classList.remove('bc-animate-num-pop');
            void el.offsetWidth;
            el.classList.add('bc-animate-num-pop');
          }
        }
      };

      frameId = requestAnimationFrame(tick);
    };

    if (delay > 0) {
      timerId = setTimeout(animate, delay);
    } else {
      animate();
    }

    return () => {
      clearTimeout(timerId);
      cancelAnimationFrame(frameId);
    };
  }, [value, duration, delay]);

  return (
    <span ref={spanRef} className={className}>
      {display}
    </span>
  );
});

export const Crest = memo(function Crest({ team, size = 86, accent, accentAlt, borderPulseOrder }) {
  const ring = accent || team?.color || colors.accentA;
  // accentAlt is the counterpart team's color — used for the wide outer glow (25% of the pulse).
  // Falls back to the global accentB only when no team-specific alt is available.
  const ringAlt = accentAlt || colors.accentB;
  const pulseClass = crestPulseClass(borderPulseOrder);

  const src = team?.logoUrl ?? team?.logo;
  const label = team?.code ?? team?.name ?? '?';
  const cornerRadius = crestCornerRadius(size);
  const labelSize = crestCodeFontSize(size, label);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className={cn(crestRingClassName(), pulseClass)}
        style={{
          '--team-ring': ring,
          '--crest-ring': ring,
          '--crest-ring-alt': ringAlt,
          borderRadius: cornerRadius + 3,
          boxShadow: crestRingBoxShadow(ring),
        }}
      />
      {src ? (
        <img
          src={src}
          alt={team?.displayName ?? team?.fullName ?? team?.name ?? 'Team logo'}
          draggable={false}
          className={cn(
            'absolute inset-0 box-border block size-full object-contain',
            'bg-[radial-gradient(120%_120%_at_30%_25%,#1b2233,#0a0e17_70%)]',
          )}
          style={{ borderRadius: cornerRadius, padding: crestLogoPadding(size) }}
        />
      ) : (
        <div
          className={cn(
            'absolute inset-0 grid place-items-center px-[8%]',
            'bg-[radial-gradient(120%_120%_at_30%_25%,#1b2233,#0a0e17_70%)]',
            '[font-family:var(--font-display)] font-extrabold tracking-[0.06em] text-white uppercase',
          )}
          style={{ borderRadius: cornerRadius, fontSize: labelSize }}
        >
          {label}
        </div>
      )}
    </div>
  );
});

/** Shared ball-chip type — display face reads bold at chip sizes; mono was too light at 600/700. */
const BALL_CHIP_TYPE_STYLE = {
  fontFamily: typography.fontDisplay,
  fontWeight: ltTypography.ballChipFontWeight,
};

/** Compound delivery tokens (e.g. WD+W, 2NB+W) need a pill chip + smaller type. */
function resolveBallChipLayout(display, size) {
  const text = String(display ?? '');
  const compound = text !== '•' && (text.includes('+') || text.length > 3);

  if (!compound) {
    return {
      compound: false,
      style: {
        ...BALL_CHIP_TYPE_STYLE,
        width: size,
        height: size,
        fontSize: size * ltTypography.ballChipFontScale,
      },
    };
  }

  const len = text.length;
  const compoundScale = ltTypography.ballChipCompoundFontScale;
  const fontScale =
    len >= 6 ? compoundScale.len6 : len >= 5 ? compoundScale.len5 : len >= 4 ? compoundScale.len4 : compoundScale.default;

  return {
    compound: true,
    style: {
      ...BALL_CHIP_TYPE_STYLE,
      width: 'auto',
      minWidth: size,
      height: size,
      paddingInline: 0,
      fontSize: size * fontScale,
      letterSpacing: '-0.03em',
    },
  };
}

export const BallChip = memo(function BallChip({ code, chipType, size = 28, animate = true }) {
  const variant = chipType ? overlayVariantFor({ chip_type: chipType }) : overlayVariantFor(code);
  const display = code === '•' || code === '0' || code === '' ? '•' : code;
  const { compound, style } = resolveBallChipLayout(display, size);

  return (
    <span
      data-variant={variant}
      className={cn('bc-ball-chip', compound && 'bc-ball-chip--compound', animate && 'bc-animate-chip-in')}
      style={style}
    >
      {display}
    </span>
  );
});

export const BallTrack = memo(function BallTrack({ balls = [], chips, size = 28, max = 6 }) {
  const items =
    chips ??
    balls.map((entry) =>
      typeof entry === 'object' && entry != null && 'code' in entry
        ? { code: entry.code, chipType: entry.chipType ?? null }
        : { code: entry, chipType: null },
    );

  const slotCount = Math.max(max, items.length);

  return (
    <div className="flex gap-1.5">
      {Array.from({ length: slotCount }, (_, index) => {
        const item = items[index];
        if (!item?.code) {
          return (
            <span
              key={index}
              className="inline-block shrink-0 rounded-full border border-white/10"
              style={{ width: size, height: size }}
              aria-hidden="true"
            />
          );
        }

        return (
          <BallChip
            key={`${index}-${item.code}`}
            code={item.code}
            chipType={item.chipType}
            size={size}
            animate={index === items.length - 1}
          />
        );
      })}
    </div>
  );
});

export const GlowPanel = memo(function GlowPanel({
  children,
  className,
  radius = 20,
  ambientPulse = isAmbientPulseEnabled(),
  hideRing = false,
  accent,
  style,
  ...rest
}) {
  const panelStyle = {
    borderRadius: radius,
    ...(accent ? { '--panel-ring-a': accent } : {}),
    ...style,
  };

  return (
    <div className={cn('bc-glow-panel', ambientPulse && 'glow-panel-ambient', className)} style={panelStyle} {...rest}>
      {!hideRing ? <div className="bc-glow-panel-ring" style={{ borderRadius: radius }} aria-hidden="true" /> : null}
      {children}
    </div>
  );
});

export { StrikeBatIcon };
