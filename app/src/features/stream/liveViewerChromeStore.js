import { useSyncExternalStore } from 'react';

/**
 * Watch-live chrome for `/live/broadcast/:id`.
 * Self-serve mobile streams opt into immersive (no app navbar / bottom nav).
 * Match-linked streams keep the classic 16:9 + chrome layout.
 */
let immersiveSelfServe = false;
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener());
}

export function setLiveViewerImmersiveSelfServe(next) {
  const value = Boolean(next);
  if (value === immersiveSelfServe) return;
  immersiveSelfServe = value;
  emit();
}

export function getLiveViewerImmersiveSelfServe() {
  return immersiveSelfServe;
}

export function subscribeLiveViewerImmersiveSelfServe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useLiveViewerImmersiveSelfServe() {
  return useSyncExternalStore(subscribeLiveViewerImmersiveSelfServe, getLiveViewerImmersiveSelfServe, () => false);
}
