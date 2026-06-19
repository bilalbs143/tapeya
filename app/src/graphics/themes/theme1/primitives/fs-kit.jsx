/**
 * Full-screen broadcast graphic primitives (1920×1080 design canvas).
 *
 * Used by break graphics, match bumpers, and other full-frame controllers.
 * Scales the fixed design canvas to *cover* the parent (edge-to-edge, no letterboxing).
 */
import { memo } from 'react';

import { cn } from '@/lib/utils';

import { colors } from '../config';
import { Crest } from './atoms';
import { crestCornerRadius, crestLogoPadding } from './crestMetrics';
import { FS_DESIGN_H, FS_DESIGN_W, useFitStage } from './useFitStage';

const PILL_VARIANTS = {
  label: 'px-[34px] py-3 text-[30px]',
  caption: 'px-[50px] py-[18px] text-[36px]',
};

/** Subtle diagonal accent stripes on the full-screen stage background. */
export const FSDiagonal = memo(function FSDiagonal() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className={cn(
          'absolute -inset-[25%] will-change-transform backface-hidden',
          'bg-[repeating-linear-gradient(125deg,rgba(120,140,255,0.05)_0_2px,transparent_2px_150px)]',
          'motion-safe:animate-[fsDiagonalStripesDriftA_36s_linear_infinite]',
          'motion-reduce:animate-none',
        )}
      />
      <div
        className={cn(
          'absolute -inset-[25%] will-change-transform backface-hidden',
          'bg-[repeating-linear-gradient(125deg,rgba(155,92,255,0.045)_0_90px,transparent_90px_220px)]',
          'motion-safe:animate-[fsDiagonalStripesDriftB_52s_linear_infinite]',
          'motion-reduce:animate-none',
        )}
      />
      <div
        className={cn(
          'absolute inset-0',
          'bg-[radial-gradient(80%_70%_at_50%_120%,rgba(91,124,255,0.12),transparent_70%)]',
          'motion-safe:animate-[fsDiagonalGlowPulse_10s_ease-in-out_infinite]',
          'motion-reduce:animate-none',
        )}
      />
    </div>
  );
});

/**
 * Full-screen 1920×1080 stage — scaled to fill the parent with no letterboxing.
 *
 * @param {{ children: React.ReactNode, designW?: number, designH?: number, className?: string }} props
 */
export const FSStage = memo(function FSStage({ children, designW = FS_DESIGN_W, designH = FS_DESIGN_H, className }) {
  const { ref, scale, ready } = useFitStage(designW, designH, 'cover');

  return (
    <div ref={ref} className={cn('absolute inset-0 overflow-hidden', className)}>
      {ready && (
        <div
          className="absolute top-1/2 left-1/2 origin-center"
          style={{
            width: designW,
            height: designH,
            transform: `translate(-50%, -50%) scale(${scale})`,
          }}
        >
          <div
            className={cn(
              'relative h-full w-full overflow-hidden',
              'bg-[radial-gradient(120%_100%_at_50%_-10%,#101a2e_0%,#0a0f1c_52%,#06080f_100%)]',
            )}
          >
            <FSDiagonal />
            {children}
          </div>
        </div>
      )}
    </div>
  );
});

/** Club crest slot — rounded square with neon ring and team logo image. */
export const TeamLogoSlot = memo(function TeamLogoSlot({ src, alt = 'Team logo', size = 300, accent, borderPulseOrder }) {
  const ring = accent || colors.accentA;
  const pulseClass =
    borderPulseOrder === 1 ? 'crest-ring-pulse-first' : borderPulseOrder === 2 ? 'crest-ring-pulse-second' : undefined;
  const cornerRadius = crestCornerRadius(size);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className={cn(
          'pointer-events-none absolute -inset-[3px] blur-[0.5px]',
          'opacity-[calc(0.5+0.5*var(--glow))]',
          '[background:linear-gradient(140deg,var(--team-ring),var(--accentB))]',
          '[box-shadow:0_0_calc(22px*var(--glow))_color-mix(in_srgb,var(--team-ring)_33%,transparent)]',
          pulseClass,
        )}
        style={{
          '--team-ring': ring,
          '--crest-ring': ring,
          '--crest-ring-alt': colors.accentB,
          borderRadius: cornerRadius + 3,
        }}
      />
      <img
        src={src}
        alt={alt}
        draggable={false}
        className={cn(
          'absolute inset-0 box-border block size-full object-contain',
          'bg-[radial-gradient(120%_120%_at_30%_25%,#1b2233,#0a0e17_70%)]',
        )}
        style={{ borderRadius: cornerRadius, padding: crestLogoPadding(size) }}
      />
    </div>
  );
});

/** Logo image when available; otherwise short-code crest fallback. */
export const TeamLogoOrCrest = memo(function TeamLogoOrCrest({
  logoUrl,
  name,
  shortName,
  team = null,
  accent,
  size = 300,
  borderPulseOrder,
  plain = false,
}) {
  const resolvedLogo = logoUrl ?? team?.logoUrl ?? team?.logo ?? null;
  const alt = name ?? team?.displayName ?? team?.fullName ?? team?.name ?? shortName ?? 'Team logo';
  const resolvedAccent = accent ?? team?.color;

  if (resolvedLogo) {
    if (plain) {
      return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <img src={resolvedLogo} alt={alt} draggable={false} className="block size-full object-contain" />
        </div>
      );
    }

    return <TeamLogoSlot src={resolvedLogo} alt={alt} size={size} accent={resolvedAccent} borderPulseOrder={borderPulseOrder} />;
  }

  if (team) {
    return <Crest team={team} size={size} accent={resolvedAccent} borderPulseOrder={borderPulseOrder} />;
  }

  const code = shortName ?? name ?? '?';
  return <Crest team={{ code, name: code }} size={size} accent={resolvedAccent} borderPulseOrder={borderPulseOrder} />;
});

/** VS lozenge used on hero / summary full-screen graphics. */
export const VSBadge = memo(function VSBadge({ size = 120 }) {
  const labelSize = size * 0.62;

  return (
    <div
      className={cn(
        'relative grid shrink-0 place-items-center',
        'before:absolute before:inset-0 before:rounded-full',
        'before:bg-[radial-gradient(circle_at_35%_30%,rgba(120,140,255,0.35),rgba(10,14,24,0)_70%)]',
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span
        className={cn(
          'relative font-extrabold tracking-[-0.02em] text-white',
          '[font-family:var(--font-display)]',
          '[-webkit-text-stroke:2px_rgba(120,140,255,0.4)]',
          '[text-shadow:0_6px_24px_rgba(0,0,0,0.6),0_0_calc(26px*var(--glow))_rgba(120,140,255,0.6)]',
        )}
        style={{ fontSize: labelSize }}
      >
        VS
      </span>
    </div>
  );
});

/** Rounded pill label for full-screen captions. */
export const Pill = memo(function Pill({ children, accent = colors.accentA, variant = 'caption', wrap = false }) {
  return (
    <div
      className={cn(
        'inline-flex max-w-[80%] items-center rounded-full border',
        'bg-[linear-gradient(180deg,rgba(30,38,62,0.9),rgba(14,19,32,0.92))]',
        '[border-color:color-mix(in_srgb,var(--pill-accent)_40%,transparent)]',
        '[box-shadow:0_0_calc(22px*var(--glow))_color-mix(in_srgb,var(--pill-accent)_20%,transparent),inset_0_1px_0_rgba(255,255,255,0.06)]',
        PILL_VARIANTS[variant] ?? PILL_VARIANTS.caption,
      )}
      style={{ '--pill-accent': accent }}
    >
      <span
        className={cn(
          'text-center font-extrabold tracking-[0.08em] text-white uppercase',
          '[font-family:var(--font-display)]',
          wrap ? 'whitespace-normal' : 'whitespace-nowrap',
        )}
      >
        {children}
      </span>
    </div>
  );
});
