import { useSyncExternalStore } from 'react';

type Listener = () => void;

let contentKey = 0;
const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) listener();
}

export function getContentRefreshKey(): number {
  return contentKey;
}

/** Bump so `AppShell` remounts `<Outlet key={…} />` — page content only, chrome stays. */
export function bumpContentRefreshKey(): number {
  contentKey += 1;
  emit();
  return contentKey;
}

export function subscribeContentRefresh(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useContentRefreshKey(): number {
  return useSyncExternalStore(subscribeContentRefresh, getContentRefreshKey, () => 0);
}
