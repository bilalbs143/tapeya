import { useSyncExternalStore } from 'react';

/**
 * Watch-live chrome for `/live/broadcast/:id`.
 * Self-serve mobile streams enter hero mode (transparent overlay navbar, bottom nav stays
 * visible) only while `status === 'live'`. Before/after playback and match-linked streams
 * keep the classic 16:9 + solid chrome layout.
 */
let heroMode = false;
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener());
}

export function setLiveViewerHeroMode(next) {
  const value = Boolean(next);
  if (value === heroMode) return;
  heroMode = value;
  emit();
}

export function getLiveViewerHeroMode() {
  return heroMode;
}

export function subscribeLiveViewerHeroMode(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useLiveViewerHeroMode() {
  return useSyncExternalStore(subscribeLiveViewerHeroMode, getLiveViewerHeroMode, () => false);
}
