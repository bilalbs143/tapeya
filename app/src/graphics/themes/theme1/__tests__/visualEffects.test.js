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

  it('keeps decorative ambience enabled by default', () => {
    expect(visualEffects.ambientPulse).toBe(true);
    expect(isAmbientPulseEnabled()).toBe(true);
    expect(isDecorativeBoxGlowEnabled()).toBe(true);
    expect(accentHaloShadow('#5b7cff')).toContain('var(--glow)');
  });
});
