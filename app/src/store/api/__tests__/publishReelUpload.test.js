import { beforeEach, describe, expect, it, vi } from 'vitest';

const uploadMediaFile = vi.fn();

vi.mock('../mediaApi', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    uploadMediaFile: (...args) => uploadMediaFile(...args),
  };
});

describe('publishReel multipart resilience', () => {
  beforeEach(() => {
    uploadMediaFile.mockReset();
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
    const uploadPart = vi.fn(() => ({
      unwrap: async () => {
        partAttempts += 1;
        if (partAttempts < 3) {
          const err = new Error('Load failed');
          err.status = 'FETCH_ERROR';
          throw err;
        }
        return { part_number: 1, received: 1 };
      },
    }));
    const completeMultipart = vi.fn(() => ({ unwrap: async () => ({ id: 42, status: 'processing' }) }));
    const abortMultipart = vi.fn(() => ({ unwrap: async () => null }));
    const deleteReel = vi.fn(() => ({ unwrap: async () => null }));

    const file = new File([new Uint8Array(100)], 'clip.mp4', { type: 'video/mp4' });
    const promise = publishReel(
      { createReel, uploadMedia: vi.fn(), initMultipart, uploadPart, completeMultipart, abortMultipart, deleteReel },
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
    const uploadPart = vi.fn(() => ({
      unwrap: async () => {
        const err = new Error('bad request');
        err.status = 422;
        err.data = { type: 'VALIDATION_ERROR', message: 'bad' };
        throw err;
      },
    }));
    const abortMultipart = vi.fn(() => ({ unwrap: async () => null }));
    const deleteReel = vi.fn(() => ({ unwrap: async () => null }));

    const file = new File([new Uint8Array(10)], 'clip.mp4', { type: 'video/mp4' });
    await expect(
      publishReel(
        {
          createReel,
          uploadMedia: vi.fn(),
          initMultipart,
          uploadPart,
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
