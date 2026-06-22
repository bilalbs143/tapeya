// @vitest-environment jsdom

import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ltBar, ltInfoBar } from '../../config';
import { InsetLTBarSurface } from '../insetLTBarSurface';
import { OverlayLayoutProvider } from '../overlayLayoutContext';

/** @type {ResizeObserverCallback | null} */
let resizeObserverCallback = null;

/** @param {Element} element */
function stubMeasuredSize(element, width = ltBar.designWidth) {
  if (!(element instanceof HTMLElement)) return;

  Object.defineProperty(element, 'clientWidth', { configurable: true, value: width });

  if (!element.offsetHeight) {
    Object.defineProperty(element, 'offsetHeight', { configurable: true, value: ltBar.height });
  }

  if (!element.scrollWidth) {
    Object.defineProperty(element, 'scrollWidth', { configurable: true, value: element.offsetWidth || width });
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
        if (!(element instanceof HTMLElement)) return;
        const isMeasureLayer = element.getAttribute('aria-hidden') === 'true';
        stubMeasuredSize(element, isMeasureLayer ? 200 : ltBar.designWidth);
        if (isMeasureLayer) {
          Object.defineProperty(element, 'scrollWidth', { configurable: true, value: 200 });
        }
        resizeObserverCallback?.([], this);
      }

      disconnect() {}
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('InsetLTBarSurface', () => {
  it('centers inset bar in padded safe area at 1920', async () => {
    const { container } = render(
      <OverlayLayoutProvider variant="lt">
        <InsetLTBarSurface edgeToEdge>
          {({ measuring }) => (
            <div data-testid="bar-content" className="flex shrink-0 px-8 whitespace-nowrap">
              {measuring ? 'measure' : 'on-air'}
            </div>
          )}
        </InsetLTBarSurface>
      </OverlayLayoutProvider>,
    );

    const surface = container.querySelector('.relative.max-w-full.overflow-hidden');
    const measureLayer = container.querySelector('[aria-hidden="true"]');

    expect(surface).toBeTruthy();
    expect(measureLayer).toBeTruthy();

    await waitFor(() => {
      expect(surface?.style.paddingLeft).toBe(`${ltBar.overlayInsetXLT}px`);
      expect(surface?.style.paddingRight).toBe(`${ltBar.overlayInsetXLT}px`);
      expect(surface?.style.display).toBe('flex');
      expect(surface?.style.justifyContent).toBe('center');
    });
  });

  it('uses ltInfoBar min width when content measure is unavailable', async () => {
    const { container } = render(
      <OverlayLayoutProvider variant="lt">
        <InsetLTBarSurface edgeToEdge>{() => <div style={{ height: ltBar.height }}>Short</div>}</InsetLTBarSurface>
      </OverlayLayoutProvider>,
    );

    const slot = container.querySelector('.relative.max-w-full.overflow-hidden > .shrink-0');

    await waitFor(() => {
      expect(slot?.style.width).toBe(`${ltInfoBar.minWidth}px`);
    });
  });
});
