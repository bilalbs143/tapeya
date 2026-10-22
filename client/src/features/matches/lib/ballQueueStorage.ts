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

function readStore(): QueueStore {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as QueueStore;
  } catch {
    return {};
  }
}

function writeStore(store: QueueStore) {
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

function matchKey(matchId: number): string {
  return String(matchId);
}

export function listQueuedBalls(matchId: number): QueuedBall[] {
  return readStore()[matchKey(matchId)] ?? [];
}

export function enqueueBall(
  entry: Omit<QueuedBall, 'id' | 'createdAt'> & { id?: string | undefined; createdAt?: number | undefined }
): QueuedBall {
  const ball: QueuedBall = {
    id: entry.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    matchId: entry.matchId,
    inningsId: entry.inningsId,
    payload: entry.payload,
    createdAt: entry.createdAt ?? Date.now(),
  };
  const store = readStore();
  const key = matchKey(entry.matchId);
  store[key] = [...(store[key] ?? []), ball];
  writeStore(store);
  return ball;
}

function omitKey(store: QueueStore, key: string): QueueStore {
  return Object.fromEntries(Object.entries(store).filter(([k]) => k !== key));
}

export function removeQueuedBall(matchId: number, id: string): void {
  const store = readStore();
  const key = matchKey(matchId);
  const next = (store[key] ?? []).filter((b) => b.id !== id);
  if (next.length) writeStore({ ...store, [key]: next });
  else writeStore(omitKey(store, key));
}

export function clearQueuedBalls(matchId: number): void {
  writeStore(omitKey(readStore(), matchKey(matchId)));
}
export function subscribeBallQueue(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  window.addEventListener(BALL_QUEUE_EVENT, onStoreChange);
  window.addEventListener('storage', onStoreChange);
  return () => {
    window.removeEventListener(BALL_QUEUE_EVENT, onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
}
