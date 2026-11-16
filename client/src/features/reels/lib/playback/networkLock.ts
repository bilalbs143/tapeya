/**
 * Active reel owns the network until it has media; then next may attach.
 * Never clear the busy flag from a neighbor timeout — dual native HLS starves iOS.
 */

/** Prefetch / idle waiters only — active attach has its own watchdog. */
const IDLE_FALLBACK_MS = 4000;

type Job = {
  id: number;
  run: () => void;
};

let activeBusy = false;
let nextId = 0;
const queue: Job[] = [];
const idleWaiters: Array<() => void> = [];

function flush(): void {
  if (activeBusy) return;
  const batch = queue.splice(0);
  for (const job of batch) job.run();
  const waiters = idleWaiters.splice(0);
  for (const waiter of waiters) waiter();
}

function scheduleFlush(): void {
  queueMicrotask(flush);
}

/** Active slide is attaching — next waits. */
export function beginActiveReelAttach(): void {
  activeBusy = true;
}

/** Active attach finished (ready / failed / cleanup / watchdog) — release next. */
export function endActiveReelAttach(): void {
  if (!activeBusy) return;
  activeBusy = false;
  scheduleFlush();
}

/** @internal diagnostics / tests */
export function getActiveReelAttachBusy(): boolean {
  return activeBusy;
}

/** Defer work (e.g. HTTP prefetch) until active attach is idle. */
export function whenActiveReelAttachIdle(run: () => void): () => void {
  if (!activeBusy) {
    run();
    return () => {};
  }

  let settled = false;
  const finish = () => {
    if (settled) return;
    settled = true;
    run();
  };

  idleWaiters.push(finish);
  const fallback = setTimeout(() => {
    const idx = idleWaiters.indexOf(finish);
    if (idx >= 0) idleWaiters.splice(idx, 1);
    finish();
  }, IDLE_FALLBACK_MS);

  return () => {
    settled = true;
    clearTimeout(fallback);
    const idx = idleWaiters.indexOf(finish);
    if (idx >= 0) idleWaiters.splice(idx, 1);
  };
}

/**
 * Queue next attach until active is ready.
 * One microtask deferral so active’s sync `begin` in the same commit wins.
 */
export function scheduleNeighborReelAttach(run: () => void): () => void {
  const job: Job = { id: ++nextId, run };
  let cancelled = false;

  queueMicrotask(() => {
    if (cancelled) return;
    if (!activeBusy) {
      job.run();
      return;
    }
    queue.push(job);
  });

  return () => {
    cancelled = true;
    const idx = queue.findIndex((j) => j.id === job.id);
    if (idx >= 0) queue.splice(idx, 1);
  };
}

/** Flush a queued neighbor immediately (e.g. promote while still waiting). */
export function runNeighborAttachNow(run: () => void, cancelQueued: () => void): void {
  cancelQueued();
  run();
}

/** @internal vitest */
export function resetReelAttachPriorityForTests(): void {
  activeBusy = false;
  nextId = 0;
  queue.length = 0;
  idleWaiters.length = 0;
}
