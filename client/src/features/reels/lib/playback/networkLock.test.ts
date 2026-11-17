import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  beginActiveReelAttach,
  endActiveReelAttach,
  getActiveReelAttachBusy,
  resetReelAttachPriorityForTests,
  scheduleNeighborReelAttach,
  whenActiveReelAttachIdle,
} from './networkLock';

describe('playback networkLock', () => {
  beforeEach(() => {
    resetReelAttachPriorityForTests();
    vi.useFakeTimers();
  });

  afterEach(() => {
    resetReelAttachPriorityForTests();
    vi.useRealTimers();
  });

  it('holds next until active releases', async () => {
    const next = vi.fn();
    beginActiveReelAttach();
    scheduleNeighborReelAttach(next);
    await Promise.resolve();

    expect(next).not.toHaveBeenCalled();
    expect(getActiveReelAttachBusy()).toBe(true);

    endActiveReelAttach();
    await Promise.resolve();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('does not flush next when StrictMode remounts active before microtask', async () => {
    const next = vi.fn();
    beginActiveReelAttach();
    scheduleNeighborReelAttach(next);
    await Promise.resolve();

    endActiveReelAttach();
    beginActiveReelAttach();
    await Promise.resolve();

    expect(next).not.toHaveBeenCalled();
    expect(getActiveReelAttachBusy()).toBe(true);

    endActiveReelAttach();
    await Promise.resolve();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('keeps waiting if active never releases (does not steal the lock)', async () => {
    const next = vi.fn();
    beginActiveReelAttach();
    scheduleNeighborReelAttach(next);
    await Promise.resolve();

    await vi.advanceTimersByTimeAsync(8000);
    expect(next).not.toHaveBeenCalled();
    expect(getActiveReelAttachBusy()).toBe(true);

    endActiveReelAttach();
    await Promise.resolve();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('whenActiveReelAttachIdle waits for release then runs', async () => {
    const idle = vi.fn();
    beginActiveReelAttach();
    whenActiveReelAttachIdle(idle);

    expect(idle).not.toHaveBeenCalled();
    endActiveReelAttach();
    await Promise.resolve();
    expect(idle).toHaveBeenCalledTimes(1);
  });

  it('defers neighbor decision one microtask so active can begin first', async () => {
    const next = vi.fn();
    scheduleNeighborReelAttach(next);
    beginActiveReelAttach();
    await Promise.resolve();

    expect(next).not.toHaveBeenCalled();

    endActiveReelAttach();
    await Promise.resolve();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
