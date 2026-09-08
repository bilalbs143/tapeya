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
    uploadMediaFile.mockImplementation(async (_upload, opts) => {
      if (opts.field === 'thumbnail') return 'https://cdn.example/poster.jpg';
      return 'https://cdn.example/original.mp4';
    });
  });

  it('uploads poster as thumbnail before the original in single-file mode', async () => {
    const { publishReel } = await import('../reelsApi');

    const createReel = vi.fn(() => ({
      unwrap: async () => ({ id: 77 }),
    }));
    const uploadMedia = vi.fn();
    const file = new File([new Uint8Array([1, 2, 3])], 'clip.mp4', { type: 'video/mp4' });
    const posterBlob = new Blob([new Uint8Array([9])], { type: 'image/jpeg' });

    const created = await publishReel({ createReel, uploadMedia }, { file, caption: 'hi', posterBlob });

    expect(created.id).toBe(77);
    expect(uploadMediaFile).toHaveBeenCalledTimes(2);
    expect(uploadMediaFile.mock.calls[0][1]).toEqual(
      expect.objectContaining({
        type: 'reel',
        id: 77,
        field: 'thumbnail',
      }),
    );
    expect(uploadMediaFile.mock.calls[1][1]).toEqual(
      expect.objectContaining({
        type: 'reel',
        id: 77,
        field: 'original',
        file,
      }),
    );
  });

  it('does not fail publish when provisional poster upload fails', async () => {
    const { publishReel } = await import('../reelsApi');

    uploadMediaFile.mockImplementation(async (_upload, opts) => {
      if (opts.field === 'thumbnail') throw new Error('poster failed');
      return 'https://cdn.example/original.mp4';
    });

    const createReel = vi.fn(() => ({
      unwrap: async () => ({ id: 88 }),
    }));
    const file = new File([new Uint8Array([1])], 'clip.mp4', { type: 'video/mp4' });
    const posterBlob = new Blob([new Uint8Array([9])], { type: 'image/jpeg' });

    const created = await publishReel({ createReel, uploadMedia: vi.fn() }, { file, posterBlob });
    expect(created.id).toBe(88);
    expect(uploadMediaFile.mock.calls.some((c) => c[1].field === 'original')).toBe(true);
  });
});
