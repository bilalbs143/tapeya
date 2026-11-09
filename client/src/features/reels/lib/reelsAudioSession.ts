/** SPA-lifetime unlock — once unmuted playback succeeds, later reels stay unmuted this visit. */
let reelsAudioUnlocked = false;

export function isReelsAudioUnlocked(): boolean {
  return reelsAudioUnlocked;
}

export function unlockReelsAudio(): void {
  reelsAudioUnlocked = true;
}

/** Roll back when an unmute gesture still fails autoplay policy (also used by tests). */
export function relockReelsAudio(): void {
  reelsAudioUnlocked = false;
}
