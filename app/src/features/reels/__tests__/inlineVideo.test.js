// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';

import { applyInlineVideoAttributes } from '../inlineVideo';

describe('applyInlineVideoAttributes', () => {
  it('forces inline playback attributes used by iOS WKWebView and Android WebView', () => {
    const video = document.createElement('video');
    video.controls = true;
    applyInlineVideoAttributes(video);

    expect(video.playsInline).toBe(true);
    expect(video.controls).toBe(false);
    expect(video.getAttribute('playsinline')).toBe('');
    expect(video.getAttribute('webkit-playsinline')).toBe('');
    expect(video.getAttribute('disablepictureinpicture')).toBe('');
    if ('disablePictureInPicture' in video) {
      expect(video.disablePictureInPicture).toBe(true);
    }
  });

  it('no-ops on a missing element', () => {
    expect(() => applyInlineVideoAttributes(null)).not.toThrow();
  });
});
