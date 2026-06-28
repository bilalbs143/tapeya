/**
 * Full-screen broadcast graphic primitives (1920×1080 design canvas).
 *
 * Used by break graphics, match bumpers, and other full-frame controllers.
 * Scales the fixed design canvas to *cover* the parent (edge-to-edge, no letterboxing).
 */
import { memo } from 'react';

import { cn } from '@/lib/utils';

import { colors, fsPill, fsStageFabric } from '../config';
import { crestPulseClass, crestRingClassName, isFsStageAmbientEnabled, textGlowClass } from '../visualEffects';
import { Crest } from './atoms';
import { crestCornerRadius, crestLogoPadding } from './crestMetrics';
import { fsFont } from './formatters';
import { FS_DESIGN_H, FS_DESIGN_W, useFitStage } from './useFitStage';

const PILL_LAYOUT = {
  label: 'px-[34px] py-3',
  caption: 'px-[50px] py-[18px]',
};

const FABRIC_KEYFRAMES = {
  A: 'fsFabricA',
  B: 'fsFabricB',
  C: 'fsFabricC',
};

/** Soft vertical band gradient — wide feather reduces need for heavy blur. */
function fabricBandBackground(color) {
  return `linear-gradient(to bottom, transparent 0%, ${color} 18%, ${color} 82%, transparent 100%)`;
}

/** Animated fabric — six diagonal shaded bands billow independently across the FS stage. */
export const FSDiagonal = memo(function FSDiagonal() {
  const glowPulse = isFsStageAmbientEnabled();

  return (
    <div className="fs-stage-fabric absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="fs-stage-fabric__wash" style={{ background: fsStageFabric.baseWash }} />

      {fsStageFabric.bands.map((band) => (
        <div
          key={band.id}
          className={cn('fs-fabric-band', band.top >= fsStageFabric.lowerBandTopPx && 'fs-fabric-band--lower')}
          style={{
            top: band.top,
            background: fabricBandBackground(band.color),
            // Full animation shorthand — delay must be in the same declaration.
            animation: `${FABRIC_KEYFRAMES[band.curve]} ${band.durationS}s var(--fs-fabric-easing, cubic-bezier(0.45, 0.05, 0.55, 0.95)) ${band.delayS}s infinite`,
          }}
        />
      ))}

      <div className="fs-stage-fabric__bottom-fill" style={{ background: fsStageFabric.bottomFill }} />

      <div
        className={cn('fs-stage-fabric__glow', glowPulse && 'fs-stage-fabric__glow--pulse')}
        style={{ background: fsStageFabric.bottomGlow }}
      />

      <div className="fs-stage-fabric__vignette" style={{ background: fsStageFabric.vignette }} />

      <div className="fs-stage-fabric__corner-fill" style={{ background: fsStageFabric.cornerFill }} />

      <div
        className="fs-stage-fabric__grain"
        style={{
          background: `repeating-linear-gradient(125deg, ${fsStageFabric.grainColor} 0 1px, transparent 1px 120px)`,
        }}
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
          <div className="relative h-full w-full overflow-hidden" style={{ background: fsStageFabric.stageBase }}>
            <FSDiagonal />
            {children}
          </div>
        </div>
      )}
    </div>
  );
});

/** Club crest slot — rounded square with neon ring and team logo image. */
export const TeamLogoSlot = memo(function TeamLogoSlot({
  src,
  alt = 'Team logo',
  size = 300,
  accent,
  accentAlt,
  borderPulseOrder,
}) {
  const ring = accent || colors.accentA;
  const ringAlt = accentAlt || colors.accentB;
  const pulseClass = crestPulseClass(borderPulseOrder);
  const cornerRadius = crestCornerRadius(size);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className={cn(crestRingClassName(), pulseClass)}
        style={{
          '--team-ring': ring,
          '--crest-ring': ring,
          '--crest-ring-alt': ringAlt,
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
  accentAlt,
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

    return (
      <TeamLogoSlot
        src={resolvedLogo}
        alt={alt}
        size={size}
        accent={resolvedAccent}
        accentAlt={accentAlt}
        borderPulseOrder={borderPulseOrder}
      />
    );
  }

  if (team) {
    return <Crest team={team} size={size} accent={resolvedAccent} accentAlt={accentAlt} borderPulseOrder={borderPulseOrder} />;
  }

  const code = shortName ?? name ?? '?';
  return (
    <Crest
      team={{ code, name: code }}
      size={size}
      accent={resolvedAccent}
      accentAlt={accentAlt}
      borderPulseOrder={borderPulseOrder}
    />
  );
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
          '[text-shadow:0_6px_24px_rgba(0,0,0,0.6)]',
          textGlowClass('vsNeon'),
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
  const layoutClass = PILL_LAYOUT[variant] ?? PILL_LAYOUT.caption;
  const fontSize = fsPill[variant] ?? fsPill.caption;

  return (
    <div
      className={cn(
        'inline-flex max-w-[80%] items-center rounded-full border',
        'bg-[linear-gradient(180deg,rgba(30,38,62,0.9),rgba(14,19,32,0.92))]',
        '[border-color:color-mix(in_srgb,var(--pill-accent)_40%,transparent)]',
        '[box-shadow:0_0_calc(22px*var(--glow))_color-mix(in_srgb,var(--pill-accent)_20%,transparent),inset_0_1px_0_rgba(255,255,255,0.06)]',
        layoutClass,
      )}
      style={{ '--pill-accent': accent }}
    >
      <span
        className={cn(
          'text-center font-extrabold tracking-[0.08em] text-white uppercase',
          '[font-family:var(--font-display)]',
          wrap ? 'whitespace-normal' : 'whitespace-nowrap',
        )}
        style={fsFont(fontSize)}
      >
        {children}
      </span>
    </div>
  );
});
