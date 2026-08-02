// @vitest-environment jsdom

import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ltBar } from '../../config';
import { ScaledBarSurface } from '../barScaling';
import { OverlayLayoutProvider } from '../overlayLayoutContext';

/** @type {ResizeObserverCallback | null} */
let resizeObserverCallback = null;

/** @param {Element} element */
function stubMeasuredSize(element) {
  if (!(element instanceof HTMLElement)) return;

  if (!element.clientWidth) {
    Object.defineProperty(element, 'clientWidth', { configurable: true, value: ltBar.designWidth });
  }

  if (!element.offsetHeight) {
    const content = element.querySelector('[data-testid="bar-content"]');
    Object.defineProperty(element, 'offsetHeight', {
      configurable: true,
      value: content instanceof HTMLElement ? content.offsetHeight || ltBar.height : ltBar.height,
    });
  }
}

beforeEach(() => {
  resizeObserverCallback = null;

  vi.stubGlobal(
    'ResizeObserver',
    class {
      /** @param {ResizeObserverCallback} callback */
      constructor(callback) {
        resizeObserverCallback = callback;
      }

      /** @param {Element} element */
      observe(element) {
        stubMeasuredSize(element);
        resizeObserverCallback?.([], this);
      }

      disconnect() {}
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ScaledBarSurface overlay inset integration', () => {
  it('applies native inset margins at scale 1 when inside OverlayLayoutProvider', async () => {
    const { container } = render(
      <OverlayLayoutProvider variant="lt">
        <ScaledBarSurface designWidth={ltBar.designWidth} edgeToEdge barRadius={0}>
          <div data-testid="bar-content" style={{ height: ltBar.height }}>
            Match summary
          </div>
        </ScaledBarSurface>
      </OverlayLayoutProvider>,
    );

    const surface = container.querySelector('.max-w-full.overflow-hidden');
    const inner = container.querySelector('[data-testid="bar-content"]')?.parentElement;

    expect(surface).toBeTruthy();
    expect(inner).toBeTruthy();

    await waitFor(() => {
      expect(surface?.style.marginLeft).toBe(`${ltBar.overlayInsetXLT}px`);
      expect(surface?.style.marginRight).toBe(`${ltBar.overlayInsetXLT}px`);
      expect(surface?.style.marginBottom).toBe(`${ltBar.overlayInsetBottomLT}px`);
    });

    expect(inner?.classList.contains('w-full')).toBe(true);
    expect(inner?.style.transform ?? '').not.toMatch(/scale\(/);
  });

  it('uses transform scale when overlay inset context is absent', async () => {
    const { container } = render(
      <div style={{ width: ltBar.designWidth }}>
        <ScaledBarSurface designWidth={ltBar.designWidth} edgeToEdge barRadius={0}>
          <div data-testid="bar-content" style={{ height: ltBar.height }}>
            Full bleed
          </div>
        </ScaledBarSurface>
      </div>,
    );

    const surface = container.querySelector('.max-w-full.overflow-hidden');
    const inner = container.querySelector('[data-testid="bar-content"]')?.parentElement;

    await waitFor(() => {
      expect(inner?.style.transform).toBe('scale(1)');
    });

    expect(surface?.style.marginLeft).toBe('');
    expect(inner?.classList.contains('origin-top-left')).toBe(true);
    expect(inner?.classList.contains('w-full')).toBe(false);
  });
});
