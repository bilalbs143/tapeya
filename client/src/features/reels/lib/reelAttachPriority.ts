/**
 * Active reel owns the network until it has media.
 * Then next attaches immediately; farther warm slides stagger.
 */

import { reelLog } from './reelPlaybackLog';

const WARM_STAGGER_MS = 400;
/** Safety only — if active never becomes ready, do not block neighbors forever. */
const WAIT_FALLBACK_MS = 4000;

export type NeighborAttachRole = 'next' | 'warm';

type Job = {
  id: number;
  role: NeighborAttachRole;
  run: () => void;
  fallbackTimer: ReturnType<typeof setTimeout> | null;
  runTimer: ReturnType<typeof setTimeout> | null;
};

let activeBusy = false;
let warmSlot = 0;
let nextId = 0;
const queue: Job[] = [];
const idleWaiters: Array<() => void> = [];

function clearTimers(job: Job): void {
  if (job.fallbackTimer) clearTimeout(job.fallbackTimer);
  if (job.runTimer) clearTimeout(job.runTimer);
  job.fallbackTimer = null;
  job.runTimer = null;
}

function delayForRole(role: NeighborAttachRole): number {
  if (role === 'next') return 0;
  const slot = warmSlot;
  warmSlot += 1;
  return WARM_STAGGER_MS * (slot + 1);
}

function startJob(job: Job): void {
  clearTimers(job);
  const delay = delayForRole(job.role);
  if (delay <= 0) {
    job.run();
    return;
  }
  job.runTimer = setTimeout(() => {
    job.runTimer = null;
    job.run();
  }, delay);
}

function flush(): void {
  if (activeBusy) return;
  warmSlot = 0;
  const batch = queue.splice(0).sort((a, b) => {
    if (a.role === b.role) return 0;
    return a.role === 'next' ? -1 : 1;
  });
  for (const job of batch) startJob(job);
  const waiters = idleWaiters.splice(0);
  for (const waiter of waiters) waiter();
}

function scheduleFlush(): void {
  queueMicrotask(flush);
}

/** Active slide is attaching — neighbors wait. */
export function beginActiveReelAttach(): void {
  activeBusy = true;
  reelLog('attach.hold', {});
}

/** Active attach finished (ready / failed / cleanup) — release neighbors. */
export function endActiveReelAttach(): void {
  if (!activeBusy) return;
  activeBusy = false;
  reelLog('attach.release', {});
  scheduleFlush();
}

/** Defer work (e.g. upcoming HTTP prefetch) until active attach is idle. */
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
  }, WAIT_FALLBACK_MS);

  return () => {
    settled = true;
    clearTimeout(fallback);
    const idx = idleWaiters.indexOf(finish);
    if (idx >= 0) idleWaiters.splice(idx, 1);
  };
}

/**
 * Queue next/warm until active is ready.
 * One microtask deferral so active’s sync `begin` in the same commit wins
 * over neighbors that mounted earlier in the tree.
 */
export function scheduleNeighborReelAttach(role: NeighborAttachRole, run: () => void): () => void {
  const job: Job = {
    id: ++nextId,
    role,
    run,
    fallbackTimer: null,
    runTimer: null,
  };

  let cancelled = false;

  queueMicrotask(() => {
    if (cancelled) return;

    if (!activeBusy) {
      reelLog('attach.neighbor', { role, wait: false });
      startJob(job);
      return;
    }

    reelLog('attach.neighbor', { role, wait: true });
    queue.push(job);
    job.fallbackTimer = setTimeout(() => {
      job.fallbackTimer = null;
      const idx = queue.indexOf(job);
      if (idx >= 0) queue.splice(idx, 1);
      if (activeBusy) {
        activeBusy = false;
        reelLog('attach.neighbor', { role, wait: 'timeout' });
      }
      startJob(job);
      scheduleFlush();
    }, WAIT_FALLBACK_MS);
  });

  return () => {
    cancelled = true;
    const idx = queue.findIndex((j) => j.id === job.id);
    if (idx >= 0) queue.splice(idx, 1);
    clearTimers(job);
  };
}

/** @internal vitest */
export function resetReelAttachPriorityForTests(): void {
  activeBusy = false;
  warmSlot = 0;
  nextId = 0;
  for (const job of queue.splice(0)) clearTimers(job);
  idleWaiters.length = 0;
}

/** @internal vitest */
export function isActiveReelAttachBusyForTests(): boolean {
  return activeBusy;
}
