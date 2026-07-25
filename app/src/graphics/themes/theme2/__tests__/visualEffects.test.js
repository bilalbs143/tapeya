import { describe, expect, it } from 'vitest';

import { visualEffects } from '../config';
import {
  accentHaloShadow,
  isAmbientPulseEnabled,
  isDecorativeBoxGlowEnabled,
  isTextGlowEnabled,
  textGlowClass,
} from '../visualEffects';

describe('visualEffects (default config)', () => {
  it('disables text glow for broadcast readability', () => {
    expect(visualEffects.textGlow).toBe(false);
    expect(isTextGlowEnabled()).toBe(false);
    expect(textGlowClass('score')).toBe('');
  });

  it('disables glow-panel ambience (controller-3 has no GlowPanel)', () => {
    expect(visualEffects.ambientPulse).toBe(false);
    expect(isAmbientPulseEnabled()).toBe(false);
    expect(isDecorativeBoxGlowEnabled()).toBe(false);
    expect(accentHaloShadow('#c40038')).toBeUndefined();
  });

  it('disables chart / tour-code decorative glow for flat theme3 look', () => {
    expect(visualEffects.chartGlow).toBe(false);
    expect(visualEffects.tourCodeBadgeGlow).toBe(false);
  });
});
