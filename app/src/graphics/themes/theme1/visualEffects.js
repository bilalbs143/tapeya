/**
 * Broadcast visual-effect toggles — single place to tune decorative glow vs readability.
 *
 * `textGlow: false` removes neon halos on scores, names, and hero numbers (recommended on air).
 * Other flags restore panel ambience, crest halos, chips, charts, and stage depth.
 */
import { cn } from '@/lib/utils';

import { visualEffects } from './config';
import { accentMix } from './primitives/accent';

/** @returns {number} 0–1 global decorative intensity (--glow CSS var) */
export function glowMultiplier() {
  const value = Number(visualEffects.intensity);
  if (!Number.isFinite(value)) return 1;
  return Math.max(0, Math.min(1, value));
}

export function isTextGlowEnabled() {
  return visualEffects.textGlow === true && glowMultiplier() > 0;
}

export function isAmbientPulseEnabled() {
  return visualEffects.ambientPulse !== false && glowMultiplier() > 0;
}

export function isCrestHaloEnabled() {
  return visualEffects.crest?.halo !== false && glowMultiplier() > 0;
}

export function isCrestPulseEnabled() {
  return visualEffects.crest?.pulse !== false && isCrestHaloEnabled();
}

export function isFsStageAmbientEnabled() {
  return visualEffects.fsStageAmbient !== false && glowMultiplier() > 0;
}

export function isFlashBackgroundEnabled() {
  return visualEffects.flashBackground !== false && glowMultiplier() > 0;
}

export function isFlashTextGlowEnabled() {
  return visualEffects.flashTextGlow === true && glowMultiplier() > 0;
}

export function isChartGlowEnabled() {
  return visualEffects.chartGlow !== false && glowMultiplier() > 0;
}

export function isDecorativeBoxGlowEnabled() {
  return visualEffects.decorativeBoxGlow !== false && glowMultiplier() > 0;
}

export function isTourCodeBadgeGlowEnabled() {
  return visualEffects.tourCodeBadgeGlow !== false && glowMultiplier() > 0;
}

/** Tailwind arbitrary text-shadow classes — empty when textGlow is off. */
const TEXT_GLOW = {
  score: '[text-shadow:0_0_calc(18px*var(--glow))_var(--score-shadow)]',
  scoreSm: '[text-shadow:0_0_calc(10px*var(--glow))_var(--score-shadow)]',
  scoreLt: '[text-shadow:0_0_calc(14px*var(--glow))_var(--score-shadow)]',
  hero: '[text-shadow:0_0_calc(20px*var(--glow))_rgba(120,140,255,0.5)]',
  heroMd: '[text-shadow:0_0_calc(18px*var(--glow))_rgba(120,140,255,0.6)]',
  heroLg: '[text-shadow:0_0_calc(40px*var(--glow))_rgba(120,140,255,0.65)]',
  subtle: '[text-shadow:0_0_calc(14px*var(--glow))_rgba(255,255,255,0.28)]',
  subtleMd: '[text-shadow:0_0_calc(10px*var(--glow))_rgba(255,255,255,0.35)]',
  subtleSm: '[text-shadow:0_0_calc(8px*var(--glow))_rgba(255,255,255,0.3)]',
  subtleXs: '[text-shadow:0_0_calc(8px*var(--glow))_rgba(255,255,255,0.2)]',
  badge: '[text-shadow:0_0_calc(16px*var(--glow))_rgba(120,140,255,0.65)]',
  accent: '[text-shadow:0_0_calc(18px*var(--glow))_rgba(91,124,255,0.55)]',
  vsNeon: '[text-shadow:0_0_calc(26px*var(--glow))_rgba(120,140,255,0.6)]',
};

/** @param {keyof TEXT_GLOW} [variant='score'] */
export function textGlowClass(variant = 'score') {
  if (!isTextGlowEnabled()) return '';
  return TEXT_GLOW[variant] ?? '';
}

/** @param {1|2|undefined|null} borderPulseOrder */
export function crestPulseClass(borderPulseOrder) {
  if (!isCrestPulseEnabled()) return undefined;
  if (borderPulseOrder === 1) return 'crest-ring-pulse-first';
  if (borderPulseOrder === 2) return 'crest-ring-pulse-second';
  return undefined;
}

/** Shared crest / team-logo ring wrapper classes. */
export function crestRingClassName() {
  return cn(
    'pointer-events-none absolute -inset-[3px] blur-[0.5px]',
    'bg-[var(--team-ring)]',
    isCrestHaloEnabled() ? 'opacity-[calc(0.5+0.5*var(--glow))]' : 'opacity-55',
  );
}

/**
 * Box shadow for {@link crestRingClassName} when halo is enabled.
 *
 * Takes the resolved ring color directly (the same value the caller already writes to
 * the `--team-ring` custom property) rather than reading `'var(--team-ring)'` back —
 * that CSS variable is only ever set inline on this specific crest instance, so a JS-side
 * resolution (needed to avoid `color-mix()` for Chrome 86/vMix) can never see it: there's
 * no fixed DOM ancestor to probe that would have it in scope.
 *
 * @param {string} [accent]
 */
export function crestRingBoxShadow(accent) {
  if (!isCrestHaloEnabled()) return undefined;
  return `0 0 calc(22px * var(--glow)) ${accentMix(accent, 33)}`;
}

/** @param {string} [extra=''] */
export function panelDepthShadow(extra = '') {
  const base = '0 18px 50px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)';
  if (!isDecorativeBoxGlowEnabled()) return extra ? `${base}, ${extra}` : base;
  const halo = '0 0 calc(22px * var(--glow)) rgba(90, 110, 255, 0.22)';
  return extra ? `${base}, ${halo}, ${extra}` : `${base}, ${halo}`;
}

/** @param {string} accent @param {string} [size='18px'] @param {number} [mixPercent=20] */
export function accentHaloShadow(accent, size = '18px', mixPercent = 20) {
  if (!isDecorativeBoxGlowEnabled()) return undefined;
  return `0 0 calc(${size} * var(--glow)) ${accentMix(accent, mixPercent)}`;
}

/** @param {string} rgbaCss @param {string} [size='20px'] */
export function rgbaHaloShadow(rgbaCss, size = '20px') {
  if (!isDecorativeBoxGlowEnabled()) return undefined;
  return `0 0 calc(${size} * var(--glow)) ${rgbaCss}`;
}

/** @param {string} color @param {string} [size='20px'] @param {string} [alphaHex='33'] */
export function colorHaloShadow(color, size = '20px', alphaHex = '33') {
  if (!isDecorativeBoxGlowEnabled()) return undefined;
  return `0 0 calc(${size} * var(--glow)) ${color}${alphaHex}`;
}

/** @param {string} filterCss e.g. drop-shadow(...) */
export function chartGlowFilter(filterCss) {
  return isChartGlowEnabled() ? filterCss : undefined;
}
