// @vitest-environment jsdom

import { act, render, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ReelCoverImage } from '../ReelCoverImage';

describe('ReelCoverImage', () => {
  it('keeps the previous src until the next image loads', async () => {
    const loaders = new Map();
    const OriginalImage = globalThis.Image;

    class MockImage {
      constructor() {
        this._src = '';
        this.onload = null;
        this.onerror = null;
        this.decoding = 'async';
        this.complete = false;
      }

      set src(value) {
        this._src = value;
        loaders.set(value, this);
      }

      get src() {
        return this._src;
      }
    }

    globalThis.Image = MockImage;

    try {
      const { rerender } = render(<ReelCoverImage src="https://cdn.test/a.jpg" />);
      expect(document.querySelector('img')?.getAttribute('src')).toBe('https://cdn.test/a.jpg');

      rerender(<ReelCoverImage src="https://cdn.test/b.jpg" />);
      expect(document.querySelector('img')?.getAttribute('src')).toBe('https://cdn.test/a.jpg');

      await act(async () => {
        loaders.get('https://cdn.test/b.jpg')?.onload?.();
      });

      await waitFor(() => {
        expect(document.querySelector('img')?.getAttribute('src')).toBe('https://cdn.test/b.jpg');
      });
    } finally {
      globalThis.Image = OriginalImage;
    }
  });

  it('falls back when src is missing', () => {
    const { container } = render(<ReelCoverImage src={null} fallback={<span>Empty</span>} />);
    expect(container.textContent).toContain('Empty');
  });
});
