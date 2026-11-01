import { useSyncExternalStore } from 'react';

/**
 * PageDock mount registry.
 * - `active` → AppShell uses a fixed-height frame
 * - `keyboardPad` → AppShell owns the sole `--keyboard-inset` lift (default on).
 *   Landscape media docks vote `false` so the shell does not lift.
 */

type Listener = () => void;

let mountCount = 0;
/** Docks that want the shell to apply keyboard inset (padKeyboard !== false). */
let keyboardPadVotes = 0;
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener();
}

export function retainPageDock(options?: { padKeyboard?: boolean | undefined }): () => void {
  const wantsKeyboardPad = options?.padKeyboard !== false;
  mountCount += 1;
  if (wantsKeyboardPad) keyboardPadVotes += 1;
  emit();
  return () => {
    mountCount = Math.max(0, mountCount - 1);
    if (wantsKeyboardPad) keyboardPadVotes = Math.max(0, keyboardPadVotes - 1);
    emit();
  };
}

export function getPageDockActive(): boolean {
  return mountCount > 0;
}

/**
 * Whether AppShell should lift by `--keyboard-inset`.
 * Suppressed only while a dock is mounted with `padKeyboard={false}` (landscape media).
 * No dock (home feed, etc.) → pad on — shell is the single keyboard owner.
 */
export function getShellKeyboardPadEnabled(): boolean {
  if (mountCount === 0) return true;
  return keyboardPadVotes > 0;
}

export function subscribePageDock(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** True while at least one `PageDock` is mounted — shell uses fixed-height frame. */
export function usePageDockActive(): boolean {
  return useSyncExternalStore(subscribePageDock, getPageDockActive, () => false);
}

/** True when AppShell should apply the keyboard inset spacer. */
export function useShellKeyboardPadEnabled(): boolean {
  return useSyncExternalStore(subscribePageDock, getShellKeyboardPadEnabled, () => true);
}
