import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  __resetOrientationSessionForTests,
  __setOrientationApplyForTests,
  orientationSession,
} from './orientationSession';

describe('orientationSession', () => {
  const apply = vi.fn(async () => true);

  beforeEach(() => {
    __resetOrientationSessionForTests();
    apply.mockClear();
    apply.mockResolvedValue(true);
    __setOrientationApplyForTests(apply);
  });

  afterEach(() => {
    __setOrientationApplyForTests(null);
    __resetOrientationSessionForTests();
  });

  it('ensurePortraitBase installs a portrait base and applies it', async () => {
    await orientationSession.ensurePortraitBase();
    expect(orientationSession.peek()).toBe('portrait');
    expect(apply).toHaveBeenCalledWith('portrait');
    expect(orientationSession.debugStack()[0]?.id).toBe('__portrait_base__');
  });

  it('push landscape on top of portrait base', async () => {
    await orientationSession.ensurePortraitBase();
    await orientationSession.push('immersive', 'landscape');
    expect(orientationSession.peek()).toBe('landscape');
    expect(apply).toHaveBeenLastCalledWith('landscape');
  });

  it('pop restores previous orientation', async () => {
    await orientationSession.ensurePortraitBase();
    await orientationSession.push('immersive', 'landscape');
    await orientationSession.pop('immersive');
    expect(orientationSession.peek()).toBe('portrait');
    expect(apply).toHaveBeenLastCalledWith('portrait');
  });

  it('replace updates an existing claim without duplicating', async () => {
    await orientationSession.ensurePortraitBase();
    await orientationSession.push('golive', 'portrait');
    await orientationSession.replace('golive', 'landscape');
    expect(orientationSession.debugStack().filter((e) => e.id === 'golive')).toHaveLength(1);
    expect(orientationSession.peek()).toBe('landscape');
  });

  it('re-pushing the same id moves it to the top', async () => {
    await orientationSession.ensurePortraitBase();
    await orientationSession.push('a', 'landscape');
    await orientationSession.push('b', 'portrait');
    await orientationSession.push('a', 'landscape');
    expect(orientationSession.peek()).toBe('landscape');
    expect(orientationSession.debugStack().map((e) => e.id)).toEqual(['__portrait_base__', 'b', 'a']);
  });

  it('pop of unknown id still reapplies top', async () => {
    await orientationSession.ensurePortraitBase();
    apply.mockClear();
    await orientationSession.pop('missing');
    expect(apply).toHaveBeenCalledWith('portrait');
  });

  it('empty stack after popping base reapplies portrait', async () => {
    await orientationSession.push('only', 'landscape');
    await orientationSession.pop('only');
    expect(orientationSession.peek()).toBe('portrait');
    expect(apply).toHaveBeenLastCalledWith('portrait');
  });

  it('push any unlocks for tilt-to-rotate media surfaces', async () => {
    await orientationSession.ensurePortraitBase();
    await orientationSession.push('media', 'any');
    expect(orientationSession.peek()).toBe('any');
    expect(apply).toHaveBeenLastCalledWith('any');
    await orientationSession.pop('media');
    expect(orientationSession.peek()).toBe('portrait');
  });

  it('serializes apply so a stale unlock cannot win after pop', async () => {
    await orientationSession.ensurePortraitBase();

    let releaseFirst!: () => void;
    const firstGate = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    let calls = 0;
    apply.mockImplementation(async () => {
      calls += 1;
      if (calls === 1) await firstGate;
      return true;
    });
    apply.mockClear();

    const pushP = orientationSession.push('media', 'any');
    const popP = orientationSession.pop('media');
    releaseFirst();
    await Promise.all([pushP, popP]);

    expect(orientationSession.peek()).toBe('portrait');
    expect(apply).toHaveBeenLastCalledWith('portrait');
  });
});
