import { beforeEach, describe, expect, it, vi } from 'vitest';

const uploadMediaFile = vi.fn();

vi.mock('../mediaApi', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    uploadMediaFile: (...args) => uploadMediaFile(...args),
  };
});

describe('publishReel provisional poster', () => {
  beforeEach(() => {
    uploadMediaFile.mockReset();
    uploadMediaFile.mockResolvedValue('https://cdn.example/poster.webp');
  });

  it('uploads thumbnail in parallel after create and does not fail publish when thumb fails', async () => {
    const { publishReel } = await import('../reelsApi');

    uploadMediaFile.mockImplementation(async (_fn, opts) => {
      if (opts.field === 'thumbnail') {
        throw new Error('thumb failed');
      }
      return 'https://cdn.example/original.mp4';
    });

    const createReel = vi.fn(() => ({
      unwrap: async () => ({ id: 77 }),
    }));
    const uploadMedia = vi.fn();
    const file = new File([new Uint8Array([1, 2, 3])], 'clip.mp4', { type: 'video/mp4' });
    const posterBlob = new Blob([new Uint8Array([9])], { type: 'image/jpeg' });

    const created = await publishReel({ createReel, uploadMedia }, { file, caption: 'hi', posterBlob });

    expect(created.id).toBe(77);
    expect(uploadMediaFile).toHaveBeenCalledWith(
      uploadMedia,
      expect.objectContaining({
        type: 'reel',
        id: 77,
        field: 'thumbnail',
      }),
    );
    expect(uploadMediaFile).toHaveBeenCalledWith(
      uploadMedia,
      expect.objectContaining({
        type: 'reel',
        id: 77,
        field: 'original',
        file,
      }),
    );
  });

  it('skips thumbnail upload when posterBlob is missing', async () => {
    const { publishReel } = await import('../reelsApi');

    const createReel = vi.fn(() => ({
      unwrap: async () => ({ id: 12 }),
    }));
    const uploadMedia = vi.fn();
    const file = new File([new Uint8Array([1])], 'clip.mp4', { type: 'video/mp4' });

    await publishReel({ createReel, uploadMedia }, { file });

    expect(uploadMediaFile).toHaveBeenCalledTimes(1);
    expect(uploadMediaFile.mock.calls[0][1].field).toBe('original');
  });
});
