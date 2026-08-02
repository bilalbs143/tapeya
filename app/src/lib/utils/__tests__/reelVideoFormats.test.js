import { describe, expect, it } from 'vitest';

import {
  formatReelMaxUploadLabel,
  isAllowedReelVideoFile,
  REEL_VIDEO_ACCEPT,
  reelVideoExtension,
  validateReelVideoForUpload,
} from '../reelVideoFormats';

describe('reelVideoFormats', () => {
  it('exposes mobile-friendly accept string', () => {
    expect(REEL_VIDEO_ACCEPT).toContain('video/*');
    expect(REEL_VIDEO_ACCEPT).toContain('.mov');
    expect(REEL_VIDEO_ACCEPT).toContain('.mp4');
    expect(REEL_VIDEO_ACCEPT).toContain('.3gp');
    expect(REEL_VIDEO_ACCEPT).toContain('video/quicktime');
  });

  it('parses extensions', () => {
    expect(reelVideoExtension('IMG_1234.MOV')).toBe('mov');
    expect(reelVideoExtension('clip.mp4')).toBe('mp4');
    expect(reelVideoExtension('noext')).toBe('');
  });

  it('allows android mp4 and ios mov', () => {
    expect(isAllowedReelVideoFile({ name: 'VID.mp4', type: 'video/mp4' })).toBe(true);
    expect(isAllowedReelVideoFile({ name: 'IMG_0001.MOV', type: 'video/quicktime' })).toBe(true);
    expect(isAllowedReelVideoFile({ name: 'clip.m4v', type: 'video/x-m4v' })).toBe(true);
    expect(isAllowedReelVideoFile({ name: 'old.3gp', type: 'video/3gpp' })).toBe(true);
  });

  it('allows empty mime with phone extensions (iOS / Capacitor quirk)', () => {
    expect(isAllowedReelVideoFile({ name: 'IMG_0001.mov', type: '' })).toBe(true);
    expect(isAllowedReelVideoFile({ name: 'video.mp4', type: 'application/octet-stream' })).toBe(true);
  });

  it('allows camera capture with video mime and no filename', () => {
    expect(isAllowedReelVideoFile({ name: '', type: 'video/mp4' })).toBe(true);
  });

  it('rejects non-video files', () => {
    expect(isAllowedReelVideoFile({ name: 'photo.jpg', type: 'image/jpeg' })).toBe(false);
    expect(isAllowedReelVideoFile({ name: 'doc.pdf', type: '' })).toBe(false);
    expect(isAllowedReelVideoFile({ name: 'movie.avi', type: 'video/x-msvideo' })).toBe(false);
  });

  it('formats upload size labels', () => {
    expect(formatReelMaxUploadLabel(0)).toBeNull();
    expect(formatReelMaxUploadLabel(2)).toBe('2 MB');
    expect(formatReelMaxUploadLabel(1.5)).toBe('1.5 MB');
  });

  it('rejects oversized files before duration probe', async () => {
    const file = new File([new Uint8Array(3 * 1024 * 1024)], 'clip.mp4', { type: 'video/mp4' });
    Object.defineProperty(file, 'size', { value: 3 * 1024 * 1024 });
    const result = await validateReelVideoForUpload(file, { maxUploadMb: 2 });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/too large/i);
  });
});
