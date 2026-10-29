import { useSyncExternalStore } from 'react';

/** Mount count for `PageDock` — AppShell uses this to enable fixed-height shell. */

type Listener = () => void;

let mountCount = 0;
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener();
}

export function retainPageDock(): () => void {
  mountCount += 1;
  emit();
  return () => {
    mountCount = Math.max(0, mountCount - 1);
    emit();
  };
}

export function getPageDockActive(): boolean {
  return mountCount > 0;
}

export function subscribePageDock(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** True while at least one `PageDock` is mounted — shell uses fixed-height frame. */
export function usePageDockActive(): boolean {
  return useSyncExternalStore(subscribePageDock, getPageDockActive, () => false);
}
