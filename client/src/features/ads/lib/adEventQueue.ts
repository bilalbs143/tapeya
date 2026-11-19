import { store } from '@/shared/store/store';

import { adEventsApi } from '../api/adEventsApi';
import type { AdClientEvent } from '../model/schemas';

const FLUSH_SIZE = 5;
const FLUSH_MS = 2000;
const MAX_ATTEMPTS = 3;

let queue: AdClientEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
const inFlightIds = new Set<string>();
const attempts = new Map<string, number>();
let lifecycleBound = false;

function clearTimer() {
  if (timer != null) {
    clearTimeout(timer);
    timer = null;
  }
}

function bindLifecycleFlush() {
  if (lifecycleBound || typeof window === 'undefined') return;
  lifecycleBound = true;
  const flush = () => {
    void flushQueue();
  };
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
}

async function flushQueue(): Promise<void> {
  clearTimer();
  if (queue.length === 0) return;

  const batch = queue.splice(0, FLUSH_SIZE);
  const fresh = batch.filter((event) => {
    if (inFlightIds.has(event.client_event_id)) return false;
    inFlightIds.add(event.client_event_id);
    return true;
  });

  if (fresh.length === 0) {
    if (queue.length > 0) scheduleFlush();
    return;
  }

  try {
    await store.dispatch(adEventsApi.endpoints.sendAdEvents.initiate({ events: fresh })).unwrap();
    for (const event of fresh) attempts.delete(event.client_event_id);
  } catch {
    // Drop after MAX_ATTEMPTS — permanent 4xx must not spin forever.
    const retryable = fresh.filter((event) => {
      const next = (attempts.get(event.client_event_id) ?? 0) + 1;
      attempts.set(event.client_event_id, next);
      return next < MAX_ATTEMPTS;
    });
    queue = [...retryable, ...queue];
  } finally {
    for (const event of fresh) inFlightIds.delete(event.client_event_id);
    if (queue.length > 0) scheduleFlush();
  }
}

function scheduleFlush() {
  if (timer != null) return;
  timer = setTimeout(() => {
    void flushQueue();
  }, FLUSH_MS);
}

/** Queue a client ad event; flushes in small batches. */
export function enqueueAdEvent(event: AdClientEvent): void {
  bindLifecycleFlush();
  queue.push(event);
  if (queue.length >= FLUSH_SIZE) {
    void flushQueue();
    return;
  }
  scheduleFlush();
}

/** Test helper — drain pending timers/queue. */
export function resetAdEventQueueForTests(): void {
  clearTimer();
  queue = [];
  inFlightIds.clear();
  attempts.clear();
}
