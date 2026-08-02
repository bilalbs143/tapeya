/**
 * Full-screen broadcast graphic primitives (1920×1080 design canvas).
 *
 * Used by break graphics, match bumpers, and other full-frame controllers.
 * Scales the fixed design canvas to *cover* the parent (edge-to-edge, no letterboxing).
 */
import { memo } from 'react';

import { cn } from '@/lib/utils';

import { colors, fsChrome, fsPill, fsStageFabric } from '../config';
import {
  crestPulseClass,
  crestRingBoxShadow,
  crestRingClassName,
  isFsStageAmbientEnabled,
  textGlowClass,
} from '../visualEffects';
import { accentMix } from './accent';
import { crestCodeFontSize, crestCornerRadius, crestLogoPadding } from './crestMetrics';
import { DISPLAY_FONT, fsFont } from './formatters';
import { resolveFsCrestPlateFill } from './resolveFsCrestPlateFill';
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

/**
 * Fold band fill — crest = lit ridge + underside shadow; valley = recessed trough.
 * Gives a soft 3D fold read without mix-blend / heavy blur.
 */
function fabricBandBackground(color, role = 'crest') {
  if (role === 'valley') {
    return `linear-gradient(to bottom, transparent 0%, rgba(18,4,10,0.42) 18%, ${color} 40%, ${color} 70%, rgba(12,2,6,0.28) 86%, transparent 100%)`;
  }
  return `linear-gradient(to bottom, transparent 0%, rgba(220,120,150,0.14) 12%, ${color} 28%, ${color} 66%, rgba(40,8,18,0.36) 84%, transparent 100%)`;
}

/**
 * Theme2 fabric — mid-red diagonal bands with 3D fold shading + soft sheen.
 * Chrome 86 safe: no mix-blend / inset; transform-only band motion (+ perspective).
 */
export const FSDiagonal = memo(function FSDiagonal() {
  const glowPulse = isFsStageAmbientEnabled();

  return (
    <div className="fs-stage-fabric absolute top-0 right-0 bottom-0 left-0 overflow-hidden" aria-hidden="true">
      {/* Field fill lives inside the fabric stack (not a separate static FSStage plate). */}
      <div className="fs-stage-fabric__base" style={{ background: fsStageFabric.stageBase }} />
      <div className="fs-stage-fabric__wash" style={{ background: fsStageFabric.baseWash }} />
      <div className="fs-stage-fabric__depth" style={{ background: fsStageFabric.depthShade }} />

      <div className="fs-stage-fabric__volume">
        {fsStageFabric.bands.map((band) => (
          <div
            key={band.id}
            className={cn(
              'fs-fabric-band',
              band.role === 'valley' && 'fs-fabric-band--valley',
              band.role === 'crest' && 'fs-fabric-band--crest',
              band.top >= fsStageFabric.lowerBandTopPx && 'fs-fabric-band--lower',
            )}
            style={{
              top: band.top,
              background: fabricBandBackground(band.color, band.role),
              animation: `${FABRIC_KEYFRAMES[band.curve]} ${band.durationS}s var(--fs-fabric-easing, cubic-bezier(0.37, 0.04, 0.22, 1)) ${band.delayS}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="fs-stage-fabric__sheen" style={{ background: fsStageFabric.sheen }} />

      <div className="fs-stage-fabric__bottom-fill" style={{ background: fsStageFabric.bottomFill }} />

      <div
        className={cn('fs-stage-fabric__glow', glowPulse && 'fs-stage-fabric__glow--pulse')}
        style={{ background: fsStageFabric.bottomGlow }}
      />

      <div className="fs-stage-fabric__vignette" style={{ background: fsStageFabric.vignette }} />

      {/* Living fold for the bottom-right dead zone left by diagonal rotation. */}
      <div className="fs-stage-fabric__corner-fill" style={{ background: fsStageFabric.cornerFill }} />
      <div className="fs-stage-fabric__corner-crest" style={{ background: fsStageFabric.cornerCrest }} />

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
    <div ref={ref} className={cn('absolute top-0 right-0 bottom-0 left-0 overflow-hidden', className)}>
      {ready && (
        <div
          className="absolute top-1/2 left-1/2 origin-center"
          style={{
            width: designW,
            height: designH,
            transform: `translate(-50%, -50%) scale(${scale})`,
          }}
        >
          <div className="relative h-full w-full overflow-hidden">
            <FSDiagonal />
            {children}
          </div>
        </div>
      )}
    </div>
  );
});

/** Club crest slot — rounded square plate + logo (fill from team accent or wine). */
export const TeamLogoSlot = memo(function TeamLogoSlot({ src, alt = 'Team logo', size = 300, fill, accent, borderPulseOrder }) {
  const plate = fill || accent || colors.panelPlayer;
  const ring = accent || fill || colors.accentA;
  const pulseClass = crestPulseClass(borderPulseOrder);
  const cornerRadius = crestCornerRadius(size);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className={cn(crestRingClassName(), pulseClass)}
        style={{
          '--team-ring': ring,
          '--crest-ring': ring,
          borderRadius: cornerRadius + 3,
          boxShadow: crestRingBoxShadow(ring),
        }}
      />
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="absolute top-0 right-0 bottom-0 left-0 box-border block size-full object-contain"
        style={{
          borderRadius: cornerRadius,
          padding: crestLogoPadding(size),
          background: plate,
        }}
      />
    </div>
  );
});

/** Logo image when available; otherwise short-code crest fallback. Same plate style everywhere. */
export const TeamLogoOrCrest = memo(function TeamLogoOrCrest({
  logoUrl,
  name,
  shortName,
  team = null,
  accent,
  size = 300,
  variant = 'team',
  borderPulseOrder,
  plain = false,
  className,
  ...rest
}) {
  const resolvedLogo = logoUrl ?? team?.logoUrl ?? team?.logo ?? null;
  const alt = name ?? team?.displayName ?? team?.fullName ?? team?.name ?? shortName ?? 'Team logo';
  const resolvedAccent = accent ?? team?.color;
  const fill = resolveFsCrestPlateFill({ variant, accent: resolvedAccent, team });
  const cornerRadius = crestCornerRadius(size);
  const code = String(shortName ?? team?.code ?? team?.name ?? name ?? '?').toUpperCase();
  const labelSize = crestCodeFontSize(size, code);

  if (resolvedLogo && plain) {
    return (
      <div className={cn('relative shrink-0', className)} style={{ width: size, height: size }} {...rest}>
        <img src={resolvedLogo} alt={alt} draggable={false} className="block size-full object-contain" />
      </div>
    );
  }

  if (resolvedLogo) {
    return (
      <div className={className} {...rest}>
        <TeamLogoSlot
          src={resolvedLogo}
          alt={alt}
          size={size}
          fill={fill}
          accent={resolvedAccent || fill}
          borderPulseOrder={borderPulseOrder}
        />
      </div>
    );
  }

  const pulseClass = crestPulseClass(borderPulseOrder);
  const ring = resolvedAccent || fill || colors.accentA;

  return (
    <div className={cn('relative shrink-0', className)} style={{ width: size, height: size }} {...rest}>
      <div
        className={cn(crestRingClassName(), pulseClass)}
        style={{
          '--team-ring': ring,
          '--crest-ring': ring,
          borderRadius: cornerRadius + 3,
          boxShadow: crestRingBoxShadow(ring),
        }}
      />
      <div
        className={cn(
          'absolute top-0 right-0 bottom-0 left-0 grid place-items-center px-[8%]',
          DISPLAY_FONT,
          'font-extrabold tracking-[0.06em] text-white uppercase',
        )}
        style={{ borderRadius: cornerRadius, background: fill, fontSize: labelSize }}
      >
        {code}
      </div>
    </div>
  );
});

/** VS lozenge used on hero / summary full-screen graphics. */
export const VSBadge = memo(function VSBadge({ size = 120 }) {
  const labelSize = size * 0.62;

  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }} aria-hidden="true">
      <div
        className="pointer-events-none absolute top-0 right-0 bottom-0 left-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 35% 30%, ${fsChrome.vsRadial}, rgba(26,6,16,0) 70%)`,
        }}
        aria-hidden
      />
      <span
        className={cn(
          'relative font-extrabold tracking-[-0.02em] text-white',
          DISPLAY_FONT,
          '[text-shadow:0_6px_24px_rgba(0,0,0,0.6)]',
          textGlowClass('vsNeon'),
        )}
        style={{
          fontSize: labelSize,
          WebkitTextStroke: `2px ${fsChrome.vsStroke}`,
        }}
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
      className={cn('inline-flex max-w-[80%] items-center rounded-full border', layoutClass)}
      style={{
        '--pill-accent': accent,
        background: fsChrome.pillFill,
        borderColor: accentMix(accent, 40),
        boxShadow: `0 0 calc(22px * var(--glow)) ${accentMix(accent, 20)}, inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      <span
        className={cn(
          'text-center font-extrabold tracking-[0.08em] text-white uppercase',
          DISPLAY_FONT,
          wrap ? 'whitespace-normal' : 'whitespace-nowrap',
        )}
        style={fsFont(fontSize)}
      >
        {children}
      </span>
    </div>
  );
});
