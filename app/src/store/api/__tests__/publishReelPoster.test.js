import { describe, expect, it, vi } from 'vitest';

const uploadMediaFile = vi.fn();

vi.mock('../mediaApi', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    uploadMediaFile: (...args) => uploadMediaFile(...args),
  };
});

describe('publishReel', () => {
  it('uploads only the original — no client poster', async () => {
    uploadMediaFile.mockReset();
    uploadMediaFile.mockResolvedValue('https://cdn.example/original.mp4');

    const { publishReel } = await import('../reelsApi');

    const createReel = vi.fn(() => ({
      unwrap: async () => ({ id: 77 }),
    }));
    const file = new File([new Uint8Array([1, 2, 3])], 'clip.mp4', { type: 'video/mp4' });

    const created = await publishReel({ createReel, uploadMedia: vi.fn() }, { file, caption: 'hi' });

    expect(created.id).toBe(77);
    expect(uploadMediaFile).toHaveBeenCalledTimes(1);
    expect(uploadMediaFile.mock.calls[0][1]).toEqual(
      expect.objectContaining({
        type: 'reel',
        id: 77,
        field: 'original',
        file,
      }),
    );
  });
});
