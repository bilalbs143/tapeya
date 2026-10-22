import { lockOrientation, type OrientationLock } from '@/shared/native/orientation';

/** Stack claim — `any` unlocks for tilt-to-rotate on media screens. */
export type SessionOrientation = OrientationLock;

type StackEntry = {
  id: string;
  orientation: SessionOrientation;
};

const PORTRAIT_BASE_ID = '__portrait_base__';

type ApplyFn = (orientation: SessionOrientation) => Promise<boolean>;

let stack: StackEntry[] = [];
let applyFn: ApplyFn = (orientation) => lockOrientation(orientation);

/** Serialize lock/unlock so a stale push cannot finish after a newer pop. */
let applyChain: Promise<unknown> = Promise.resolve();
let applyEpoch = 0;

function enqueueApply(): Promise<boolean> {
  const epoch = ++applyEpoch;
  const run = async () => {
    const top = stack[stack.length - 1];
    const orientation = top?.orientation ?? 'portrait';
    const ok = await applyFn(orientation);
    // Drop result if a newer apply was queued while we awaited.
    if (epoch !== applyEpoch) return false;
    return ok;
  };
  const next = applyChain.then(run, run);
  applyChain = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

/** Test-only: swap the lock implementation (mock Capacitor). */
export function __setOrientationApplyForTests(fn: ApplyFn | null): void {
  applyFn = fn ?? ((orientation) => lockOrientation(orientation));
}

/** Test-only: clear the stack between cases. */
export function __resetOrientationSessionForTests(): void {
  stack = [];
  applyEpoch = 0;
  applyChain = Promise.resolve();
}

/** Ref-counted orientation stack — top wins; serialized applies avoid navigate races. */
export const orientationSession = {
  peek(): SessionOrientation {
    return stack[stack.length - 1]?.orientation ?? 'portrait';
  },

  debugStack(): readonly StackEntry[] {
    return stack.map((e) => ({ ...e }));
  },

  async ensurePortraitBase(): Promise<boolean> {
    const withoutBase = stack.filter((e) => e.id !== PORTRAIT_BASE_ID);
    stack = [{ id: PORTRAIT_BASE_ID, orientation: 'portrait' }, ...withoutBase];
    return enqueueApply();
  },

  async push(id: string, orientation: SessionOrientation): Promise<boolean> {
    stack = stack.filter((e) => e.id !== id);
    stack.push({ id, orientation });
    return enqueueApply();
  },

  async replace(id: string, orientation: SessionOrientation): Promise<boolean> {
    const idx = stack.findIndex((e) => e.id === id);
    if (idx >= 0) {
      stack[idx] = { id, orientation };
    } else {
      stack.push({ id, orientation });
    }
    return enqueueApply();
  },

  async pop(id: string): Promise<boolean> {
    stack = stack.filter((e) => e.id !== id);
    return enqueueApply();
  },

  async reapply(): Promise<boolean> {
    return enqueueApply();
  },
};
