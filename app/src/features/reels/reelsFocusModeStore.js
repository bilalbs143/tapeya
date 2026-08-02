import { useSyncExternalStore } from 'react';

/**
 * Reels focus mode — hides the app bottom nav only.
 * Top navbar and reels feed chrome (back, tabs, upload) stay as usual.
 */
let focusMode = false;
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener());
}

export function setReelsFocusMode(next) {
  const value = Boolean(next);
  if (value === focusMode) return;
  focusMode = value;
  emit();
}

export function toggleReelsFocusMode() {
  setReelsFocusMode(!focusMode);
}

export function getReelsFocusMode() {
  return focusMode;
}

export function subscribeReelsFocusMode(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useReelsFocusMode() {
  return useSyncExternalStore(subscribeReelsFocusMode, getReelsFocusMode, () => false);
}
