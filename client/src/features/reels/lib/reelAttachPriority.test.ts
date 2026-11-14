import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  beginActiveReelAttach,
  endActiveReelAttach,
  isActiveReelAttachBusyForTests,
  resetReelAttachPriorityForTests,
  scheduleNeighborReelAttach,
  whenActiveReelAttachIdle,
} from './reelAttachPriority';

describe('reelAttachPriority', () => {
  beforeEach(() => {
    resetReelAttachPriorityForTests();
    vi.useFakeTimers();
  });

  afterEach(() => {
    resetReelAttachPriorityForTests();
    vi.useRealTimers();
  });

  it('holds neighbors until active releases', async () => {
    const next = vi.fn();
    const warm = vi.fn();

    beginActiveReelAttach();
    scheduleNeighborReelAttach('next', next);
    scheduleNeighborReelAttach('warm', warm);
    await Promise.resolve();

    expect(next).not.toHaveBeenCalled();
    expect(warm).not.toHaveBeenCalled();
    expect(isActiveReelAttachBusyForTests()).toBe(true);

    endActiveReelAttach();
    await Promise.resolve();
    expect(next).toHaveBeenCalledTimes(1);
    expect(warm).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(400);
    expect(warm).toHaveBeenCalledTimes(1);
  });

  it('runs next before staggered warm after release', async () => {
    const order: string[] = [];
    beginActiveReelAttach();
    scheduleNeighborReelAttach('warm', () => order.push('warm-a'));
    scheduleNeighborReelAttach('next', () => order.push('next'));
    scheduleNeighborReelAttach('warm', () => order.push('warm-b'));
    await Promise.resolve();

    endActiveReelAttach();
    await Promise.resolve();
    expect(order).toEqual(['next']);

    await vi.advanceTimersByTimeAsync(400);
    expect(order).toEqual(['next', 'warm-a']);

    await vi.advanceTimersByTimeAsync(400);
    expect(order).toEqual(['next', 'warm-a', 'warm-b']);
  });

  it('does not flush neighbors when StrictMode remounts active before microtask', async () => {
    const next = vi.fn();
    beginActiveReelAttach();
    scheduleNeighborReelAttach('next', next);
    await Promise.resolve();

    endActiveReelAttach();
    beginActiveReelAttach();
    await Promise.resolve();

    expect(next).not.toHaveBeenCalled();
    expect(isActiveReelAttachBusyForTests()).toBe(true);

    endActiveReelAttach();
    await Promise.resolve();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('falls back if active never releases', async () => {
    const next = vi.fn();
    beginActiveReelAttach();
    scheduleNeighborReelAttach('next', next);
    await Promise.resolve();

    await vi.advanceTimersByTimeAsync(4000);
    expect(next).toHaveBeenCalledTimes(1);
    expect(isActiveReelAttachBusyForTests()).toBe(false);
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
    scheduleNeighborReelAttach('next', next);
    beginActiveReelAttach();
    await Promise.resolve();

    expect(next).not.toHaveBeenCalled();

    endActiveReelAttach();
    await Promise.resolve();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
