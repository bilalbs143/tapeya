import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  forgetClientReelPoster,
  getClientReelPoster,
  getClientReelVideo,
  rememberClientReelPoster,
  rememberClientReelVideo,
  resolveReelPosterUrl,
} from '../clientReelPoster';

describe('clientReel local media', () => {
  afterEach(() => {
    forgetClientReelPoster(1);
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    rememberClientReelVideo(1, 'blob:cleanup');
    vi.restoreAllMocks();
  });

  it('uses local poster until a server poster exists', () => {
    rememberClientReelPoster(1, 'blob:poster');
    expect(resolveReelPosterUrl(1, null)).toBe('blob:poster');

    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    expect(resolveReelPosterUrl(1, 'https://cdn/poster.webp')).toBe('https://cdn/poster.webp');
    expect(getClientReelPoster(1)).toBeNull();
    expect(revoke).toHaveBeenCalledWith('blob:poster');
  });

  it('keeps local video for the tab even after server poster arrives', () => {
    rememberClientReelVideo(1, 'blob:video');
    resolveReelPosterUrl(1, 'https://cdn/poster.webp');
    expect(getClientReelVideo(1)).toBe('blob:video');
  });
});
