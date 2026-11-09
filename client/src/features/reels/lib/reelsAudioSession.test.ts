import { afterEach, describe, expect, it } from 'vitest';

import { isReelsAudioUnlocked, relockReelsAudio, unlockReelsAudio } from './reelsAudioSession';

describe('reelsAudioSession', () => {
  afterEach(() => {
    relockReelsAudio();
  });

  it('starts locked and unlocks for the SPA session', () => {
    expect(isReelsAudioUnlocked()).toBe(false);
    unlockReelsAudio();
    expect(isReelsAudioUnlocked()).toBe(true);
    relockReelsAudio();
    expect(isReelsAudioUnlocked()).toBe(false);
  });
});
