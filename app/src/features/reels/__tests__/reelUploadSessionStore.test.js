import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const publishReel = vi.fn();
const invalidateTags = vi.fn(() => ({ type: 'invalidateTags' }));
const dispatch = vi.fn();

vi.mock('@/store/api/reelsApi', () => ({
  publishReel: (...args) => publishReel(...args),
}));

vi.mock('@/store/store', () => ({
  store: {
    dispatch: (...args) => dispatch(...args),
  },
}));

vi.mock('@/store/api/baseApi', () => ({
  baseApi: {
    util: {
      invalidateTags: (...args) => invalidateTags(...args),
    },
  },
}));

describe('reelUploadSessionStore', () => {
  beforeEach(() => {
    vi.resetModules();
    publishReel.mockReset();
    invalidateTags.mockReset();
    dispatch.mockReset();
    invalidateTags.mockReturnValue({ type: 'invalidateTags' });
  });

  afterEach(async () => {
    const { clearReelUploadSession } = await import('../reelUploadSessionStore');
    clearReelUploadSession();
    vi.useRealTimers();
  });

  it('forwards posterBlob to publishReel', async () => {
    publishReel.mockResolvedValue({ id: 9 });

    const { startReelUpload } = await import('../reelUploadSessionStore');
    const file = new File(['x'], 'a.mp4', { type: 'video/mp4' });
    const posterBlob = new Blob(['p'], { type: 'image/jpeg' });
    const mutations = { createReel: vi.fn() };

    expect(startReelUpload({ file, mutations, previewUrl: null, posterBlob })).toBe(true);
    await Promise.resolve();
    await Promise.resolve();

    expect(publishReel).toHaveBeenCalledWith(
      mutations,
      expect.objectContaining({
        file,
        posterBlob,
      }),
    );
  });

  it('refuses a second upload while one is in flight', async () => {
    let resolvePublish;
    publishReel.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePublish = resolve;
        }),
    );

    const { startReelUpload, getReelUploadSession } = await import('../reelUploadSessionStore');
    const file = new File(['x'], 'a.mp4', { type: 'video/mp4' });
    const mutations = { createReel: vi.fn() };

    expect(startReelUpload({ file, mutations, previewUrl: null })).toBe(true);
    expect(getReelUploadSession().status).toBe('uploading');
    expect(startReelUpload({ file, mutations, previewUrl: null })).toBe(false);

    resolvePublish({});
    await Promise.resolve();
  });

  it('ignores stale success after the session was cleared mid-upload', async () => {
    let resolvePublish;
    publishReel.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePublish = resolve;
        }),
    );

    const { startReelUpload, clearReelUploadSession, getReelUploadSession } = await import('../reelUploadSessionStore');
    const file = new File(['x'], 'a.mp4', { type: 'video/mp4' });

    startReelUpload({ file, mutations: { createReel: vi.fn() }, previewUrl: null });
    clearReelUploadSession();
    expect(getReelUploadSession().status).toBe('idle');

    resolvePublish({});
    await Promise.resolve();
    await Promise.resolve();

    expect(getReelUploadSession().status).toBe('idle');
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('marks success, invalidates reel tags, then auto-clears', async () => {
    const realSetTimeout = globalThis.setTimeout;
    const realClearTimeout = globalThis.clearTimeout;
    /** @type {Array<() => void>} */
    const autoClearCallbacks = [];
    vi.spyOn(globalThis, 'setTimeout').mockImplementation((fn, ms, ...args) => {
      if (ms === 1500) {
        autoClearCallbacks.push(fn);
        return 1;
      }
      return realSetTimeout(fn, ms, ...args);
    });
    vi.spyOn(globalThis, 'clearTimeout').mockImplementation((id) => realClearTimeout(id));

    publishReel.mockResolvedValue({ id: 1 });

    const { startReelUpload, getReelUploadSession } = await import('../reelUploadSessionStore');
    const file = new File(['x'], 'a.mp4', { type: 'video/mp4' });

    startReelUpload({ file, mutations: { createReel: vi.fn() }, previewUrl: null });
    await Promise.resolve();
    await Promise.resolve();

    expect(getReelUploadSession()).toMatchObject({ status: 'success', percent: 100, error: null });
    expect(invalidateTags).toHaveBeenCalledWith([
      { type: 'Reel', id: 'MINE' },
      { type: 'Reel', id: 'FEED' },
    ]);
    expect(dispatch).toHaveBeenCalled();
    expect(autoClearCallbacks).toHaveLength(1);

    autoClearCallbacks[0]();
    expect(getReelUploadSession().status).toBe('idle');
  });

  it('surfaces publish errors on the session', async () => {
    publishReel.mockRejectedValue({ data: { message: 'Disk full' } });

    const { startReelUpload, getReelUploadSession } = await import('../reelUploadSessionStore');
    const file = new File(['x'], 'a.mp4', { type: 'video/mp4' });

    startReelUpload({ file, mutations: { createReel: vi.fn() }, previewUrl: null });
    await Promise.resolve();
    await Promise.resolve();

    expect(getReelUploadSession()).toMatchObject({
      status: 'error',
      error: 'Disk full',
    });
  });
});
