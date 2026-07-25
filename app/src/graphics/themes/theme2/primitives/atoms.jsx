/**
 * Atomic broadcast graphic elements — crests, ball chips, glow panels, animated numbers.
 */
import { memo, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import cricketBatIcon from '../../../../assets/cricket-bat.png';
import { ltBar, ltTypography, typography } from '../config';
import { crestCornerRadius } from './crestMetrics';
import { DISPLAY_FONT } from './formatters';
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

/**
 * Team crest — bare logo (no navy pulse ring), soft rounded corners + inset + drop-shadow.
 * `borderPulseOrder` kept for call-site compat; unused.
 */
export const Crest = memo(function Crest({ team, size = ltBar.crestSize, accent, borderPulseOrder: _borderPulseOrder }) {
  const src = team?.logoUrl ?? team?.logo;
  const code = String(team?.code ?? team?.name ?? '?').toUpperCase();
  const name = team?.fullName ?? team?.displayName ?? team?.name ?? null;
  const letter = code.slice(0, 1) || '?';
  const inset = Math.max(2, Math.round(size * 0.06));
  const radius = crestCornerRadius(size);
  const fallback = resolveCrestFallbackTheme(accent);

  return (
    <div
      className="relative flex shrink-0 items-center justify-center overflow-hidden"
      style={{ width: size, height: size, borderRadius: radius }}
    >
      {src ? (
        <img
          src={src}
          alt={name ?? code}
          draggable={false}
          className="block size-full object-contain object-center"
          style={{
            padding: inset,
            borderRadius: radius,
            // Soft lift on dark panels — keeps transparent PNG crests readable.
            filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.55)) drop-shadow(0 0 1px rgba(0,0,0,0.35))',
          }}
        />
      ) : (
        <div
          className="flex size-full flex-col items-center justify-center"
          style={{ background: fallback.bg, borderRadius: radius }}
        >
          <span
            className={cn(DISPLAY_FONT, 'leading-none font-black')}
            style={{ color: fallback.text, fontSize: Math.round(size * 0.29) }}
          >
            {letter}
          </span>
          {code.length > 1 ? (
            <span
              className="mt-0.5 max-w-[90%] truncate font-bold tracking-wide uppercase"
              style={{ color: fallback.sub, fontSize: Math.max(8, Math.round(size * 0.118)) }}
            >
              {code}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
});

/** Gold plate by default; wine/rose when accent leans red (Zone D / wine teams). */
function resolveCrestFallbackTheme(accent) {
  const gold = {
    bg: 'linear-gradient(to bottom, #3a2f14, #171106)',
    text: '#fcd34d',
    sub: 'rgba(253, 230, 138, 0.7)',
  };
  const wine = {
    bg: 'linear-gradient(to bottom, #4a0f1f, #1c060d)',
    text: '#fecdd3',
    sub: 'rgba(254, 205, 211, 0.7)',
  };
  if (!accent || typeof accent !== 'string') return gold;
  const hex = accent.trim().toLowerCase();
  // Rough red/wine heuristic — hex with strong R and weaker G/B.
  const m = hex.match(/^#?([0-9a-f]{6})$/i);
  if (!m) return gold;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return r > 120 && r > g + 40 && r > b + 40 ? wine : gold;
}

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
      paddingLeft: 0,
      paddingRight: 0,
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
              className="inline-block shrink-0 border border-white/25 bg-transparent"
              style={{ width: size, height: size, borderRadius: 4 }}
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

/**
 * Solid panel shell — no ambient sweep / neon ring (controller-3 has neither).
 * `ambientPulse` / `hideRing` / `accent` kept for call-site compat; ignored.
 */
export const GlowPanel = memo(function GlowPanel({
  children,
  className,
  radius = 20,
  ambientPulse: _ambientPulse,
  hideRing: _hideRing,
  accent: _accent,
  style,
  ...rest
}) {
  return (
    <div className={cn('bc-panel', className)} style={{ borderRadius: radius, ...style }} {...rest}>
      {children}
    </div>
  );
});

export { StrikeBatIcon };
