import { beforeEach, describe, expect, it, vi } from 'vitest';

const uploadMediaFile = vi.fn();
const uploadReelPartWithProgress = vi.fn();

vi.mock('../mediaApi', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    uploadMediaFile: (...args) => uploadMediaFile(...args),
  };
});

vi.mock('../uploadReelPartWithProgress', () => ({
  uploadReelPartWithProgress: (...args) => uploadReelPartWithProgress(...args),
}));

vi.mock('@/store/store', () => ({
  store: {
    getState: () => ({ auth: { accessToken: 'tok' } }),
    dispatch: vi.fn(),
  },
}));

describe('publishReel multipart resilience', () => {
  beforeEach(() => {
    uploadMediaFile.mockReset();
    uploadReelPartWithProgress.mockReset();
    vi.useRealTimers();
  });

  it('retries transient part failures then completes without aborting mid-retry', async () => {
    vi.useFakeTimers();
    const { publishReel } = await import('../reelsApi');

    const createReel = vi.fn(() => ({ unwrap: async () => ({ id: 42 }) }));
    const initMultipart = vi.fn(() => ({
      unwrap: async () => ({ upload_id: '11111111-1111-1111-1111-111111111111', part_size: 1024 }),
    }));
    let partAttempts = 0;
    uploadReelPartWithProgress.mockImplementation(async () => {
      partAttempts += 1;
      if (partAttempts < 3) {
        const err = new Error('Load failed');
        err.status = 'FETCH_ERROR';
        throw err;
      }
      return { part_number: 1, received: 1 };
    });
    const completeMultipart = vi.fn(() => ({ unwrap: async () => ({ id: 42, status: 'processing' }) }));
    const abortMultipart = vi.fn(() => ({ unwrap: async () => null }));
    const deleteReel = vi.fn(() => ({ unwrap: async () => null }));

    const file = new File([new Uint8Array(100)], 'clip.mp4', { type: 'video/mp4' });
    const promise = publishReel(
      { createReel, uploadMedia: vi.fn(), initMultipart, completeMultipart, abortMultipart, deleteReel },
      { file },
    );

    await vi.runAllTimersAsync();
    const created = await promise;

    expect(created.id).toBe(42);
    expect(partAttempts).toBe(3);
    expect(completeMultipart).toHaveBeenCalled();
    expect(abortMultipart).not.toHaveBeenCalled();
    expect(deleteReel).not.toHaveBeenCalled();
  });

  it('aborts multipart and deletes shell after terminal failure', async () => {
    const { publishReel } = await import('../reelsApi');

    const createReel = vi.fn(() => ({ unwrap: async () => ({ id: 9 }) }));
    const initMultipart = vi.fn(() => ({
      unwrap: async () => ({ upload_id: '22222222-2222-2222-2222-222222222222', part_size: 1024 }),
    }));
    uploadReelPartWithProgress.mockImplementation(async () => {
      const err = new Error('bad request');
      err.status = 422;
      err.data = { type: 'VALIDATION_ERROR', message: 'bad' };
      throw err;
    });
    const abortMultipart = vi.fn(() => ({ unwrap: async () => null }));
    const deleteReel = vi.fn(() => ({ unwrap: async () => null }));

    const file = new File([new Uint8Array(10)], 'clip.mp4', { type: 'video/mp4' });
    await expect(
      publishReel(
        {
          createReel,
          uploadMedia: vi.fn(),
          initMultipart,
          completeMultipart: vi.fn(),
          abortMultipart,
          deleteReel,
        },
        { file },
      ),
    ).rejects.toMatchObject({ status: 422 });

    expect(abortMultipart).toHaveBeenCalledWith({
      id: 9,
      uploadId: '22222222-2222-2222-2222-222222222222',
    });
    expect(deleteReel).toHaveBeenCalledWith(9);
  });

  it('reports continuous byte progress while a part uploads', async () => {
    const { publishReel } = await import('../reelsApi');
    const ticks = [];

    const createReel = vi.fn(() => ({ unwrap: async () => ({ id: 3 }) }));
    const initMultipart = vi.fn(() => ({
      unwrap: async () => ({ upload_id: '33333333-3333-3333-3333-333333333333', part_size: 100 }),
    }));
    uploadReelPartWithProgress.mockImplementation(async ({ onUploadProgress, file }) => {
      onUploadProgress?.(Math.floor(file.size / 2));
      onUploadProgress?.(file.size);
      return { ok: true };
    });
    const completeMultipart = vi.fn(() => ({ unwrap: async () => ({ id: 3 }) }));

    const file = new File([new Uint8Array(100)], 'clip.mp4', { type: 'video/mp4' });
    await publishReel(
      {
        createReel,
        uploadMedia: vi.fn(),
        initMultipart,
        completeMultipart,
        abortMultipart: vi.fn(),
        deleteReel: vi.fn(),
      },
      { file, onProgress: (p) => ticks.push(p) },
    );

    const uploading = ticks.filter((t) => t.stage === 'uploading').map((t) => t.percent);
    expect(uploading.length).toBeGreaterThan(2);
    expect(uploading[0]).toBe(10);
    expect(uploading.at(-1)).toBe(92);
    expect(uploading.some((p) => p > 10 && p < 92)).toBe(true);
  });

  it('treats UPLOAD_FAILED as transient', async () => {
    const { isTransientUploadError } = await import('../reelsApi');
    expect(isTransientUploadError({ status: 503, data: { type: 'UPLOAD_FAILED' } })).toBe(true);
    expect(isTransientUploadError({ status: 422, data: { type: 'VALIDATION_ERROR' } })).toBe(false);
    expect(isTransientUploadError({ status: 'FETCH_ERROR' })).toBe(true);
  });
});

describe('publishReel single-file fallback', () => {
  beforeEach(() => {
    uploadMediaFile.mockReset();
    uploadMediaFile.mockResolvedValue('https://cdn.example/original.mp4');
  });

  it('uploads original via media endpoint when multipart mutations are omitted', async () => {
    const { publishReel } = await import('../reelsApi');

    const createReel = vi.fn(() => ({ unwrap: async () => ({ id: 12 }) }));
    const uploadMedia = vi.fn();
    const file = new File([new Uint8Array([1])], 'clip.mp4', { type: 'video/mp4' });

    await publishReel({ createReel, uploadMedia }, { file });

    expect(uploadMediaFile).toHaveBeenCalledTimes(1);
    expect(uploadMediaFile.mock.calls[0][1].field).toBe('original');
  });
});
