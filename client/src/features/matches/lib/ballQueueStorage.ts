import type { StoreBallPayload } from './storeBallPayload';

const STORAGE_KEY = 'tapeya.scorer.ballQueue.v1';
export const BALL_QUEUE_EVENT = 'tapeya-ball-queue';

export type QueuedBall = {
  id: string;
  matchId: number;
  inningsId: number;
  payload: StoreBallPayload;
  createdAt: number;
};

type QueueStore = Record<string, QueuedBall[]>;

/** Stable empty — `useSyncExternalStore` compares snapshots with Object.is. */
export const EMPTY_BALL_QUEUE: QueuedBall[] = [];

/** Memory is the source of truth; localStorage is persistence only (same idea as toastStore). */
let store: QueueStore = {};
let hydrated = false;

function matchKey(matchId: number): string {
  return String(matchId);
}

function hydrateFromDisk(): void {
  if (hydrated || typeof localStorage === 'undefined') {
    hydrated = true;
    return;
  }
  hydrated = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      store = {};
      return;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      store = {};
      return;
    }
    store = parsed as QueueStore;
  } catch {
    store = {};
  }
}

function persist(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* quota / private mode — queue is best-effort */
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(BALL_QUEUE_EVENT));
  }
}

function commit(next: QueueStore): void {
  store = next;
  persist();
}

/** Re-read disk (other tab / tests). */
export function invalidateBallQueueCache(): void {
  hydrated = false;
  store = {};
  hydrateFromDisk();
}

export function listQueuedBalls(matchId: number): QueuedBall[] {
  hydrateFromDisk();
  return store[matchKey(matchId)] ?? EMPTY_BALL_QUEUE;
}

export function enqueueBall(
  entry: Omit<QueuedBall, 'id' | 'createdAt'> & { id?: string | undefined; createdAt?: number | undefined }
): QueuedBall {
  hydrateFromDisk();
  const ball: QueuedBall = {
    id: entry.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    matchId: entry.matchId,
    inningsId: entry.inningsId,
    payload: entry.payload,
    createdAt: entry.createdAt ?? Date.now(),
  };
  const key = matchKey(entry.matchId);
  commit({ ...store, [key]: [...(store[key] ?? EMPTY_BALL_QUEUE), ball] });
  return ball;
}

function omitKey(next: QueueStore, key: string): QueueStore {
  return Object.fromEntries(Object.entries(next).filter(([k]) => k !== key));
}

export function removeQueuedBall(matchId: number, id: string): void {
  hydrateFromDisk();
  const key = matchKey(matchId);
  const remaining = (store[key] ?? EMPTY_BALL_QUEUE).filter((b) => b.id !== id);
  commit(remaining.length ? { ...store, [key]: remaining } : omitKey(store, key));
}

export function clearQueuedBalls(matchId: number): void {
  hydrateFromDisk();
  commit(omitKey(store, matchKey(matchId)));
}

export function subscribeBallQueue(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;

  function onExternalChange() {
    invalidateBallQueueCache();
    onStoreChange();
  }

  window.addEventListener(BALL_QUEUE_EVENT, onStoreChange);
  window.addEventListener('storage', onExternalChange);
  return () => {
    window.removeEventListener(BALL_QUEUE_EVENT, onStoreChange);
    window.removeEventListener('storage', onExternalChange);
  };
}
