import { describe, expect, it } from 'vitest';

import { ltBar, ltInfoBar } from '../../config';
import { clampInfoBarWidth, computeInfoBarLayout } from '../computeInfoBarLayout';
import { resolveInsetRenderWidth, ZERO_OVERLAY_INSETS } from '../computeScaledBarLayout';

describe('clampInfoBarWidth', () => {
  it('returns natural width when between min and max', () => {
    expect(clampInfoBarWidth(1000, 960, 1200)).toBe(1000);
  });

  it('floors at min width when content is narrower', () => {
    expect(clampInfoBarWidth(400, 960, 1200)).toBe(960);
  });

  it('caps at max width when content is wider', () => {
    expect(clampInfoBarWidth(1500, 960, 1200)).toBe(1200);
  });
});

describe('computeInfoBarLayout', () => {
  const BAR_HEIGHT = ltBar.height;

  it('uses fixed surface height from ltBar token', () => {
    const layout = computeInfoBarLayout({
      referenceWidth: 1920,
      naturalContentWidth: 800,
      minWidth: ltInfoBar.minWidth,
      barHeight: BAR_HEIGHT,
      edgeToEdge: true,
      insets: ZERO_OVERLAY_INSETS,
    });

    expect(layout.surfaceHeight).toBe(BAR_HEIGHT);
    expect(layout.containerStyle.height).toBe(BAR_HEIGHT);
  });

  it('defaults minWidth and maxWidth from ltInfoBar when omitted', () => {
    const layout = computeInfoBarLayout({
      referenceWidth: 1920,
      naturalContentWidth: 800,
      barHeight: BAR_HEIGHT,
    });

    expect(layout.barWidth).toBe(ltInfoBar.minWidth);
  });

  it('floors bar width at minWidth for short content', () => {
    const layout = computeInfoBarLayout({
      referenceWidth: 1920,
      naturalContentWidth: 500,
      minWidth: 960,
      barHeight: BAR_HEIGHT,
      edgeToEdge: true,
      insets: ZERO_OVERLAY_INSETS,
    });

    expect(layout.barWidth).toBe(960);
    expect(layout.atMaxWidth).toBe(false);
  });

  it('expands bar width to measured content when above min', () => {
    const layout = computeInfoBarLayout({
      referenceWidth: 1920,
      naturalContentWidth: 1050,
      minWidth: 960,
      barHeight: BAR_HEIGHT,
      edgeToEdge: true,
      insets: ZERO_OVERLAY_INSETS,
    });

    expect(layout.barWidth).toBe(1050);
    expect(layout.atMaxWidth).toBe(false);
  });

  it('caps bar width at safe-area max and sets atMaxWidth in inset mode', () => {
    const insets = { left: 360, right: 360, bottom: 40 };
    const safeWidth = resolveInsetRenderWidth(1920, insets);

    const layout = computeInfoBarLayout({
      referenceWidth: 1920,
      naturalContentWidth: 2000,
      minWidth: 960,
      barHeight: BAR_HEIGHT,
      edgeToEdge: true,
      insets,
    });

    expect(safeWidth).toBe(1200);
    expect(layout.barWidth).toBe(1200);
    expect(layout.atMaxWidth).toBe(true);
    expect(layout.insetNative).toBe(true);
    expect(layout.scale).toBe(1);
    expect(layout.containerStyle.width).toBe('100%');
    expect(layout.containerStyle.paddingLeft).toBe(360);
    expect(layout.containerStyle.paddingRight).toBe(360);
    expect(layout.containerStyle.marginBottom).toBe(40);
    expect(layout.containerStyle.display).toBe('flex');
    expect(layout.containerStyle.justifyContent).toBe('center');
    expect(layout.slotWidth).toBe(1200);
  });

  it('uses ltInfoBar min/max at 1920 with 210px insets (Option A)', () => {
    const insets = { left: 210, right: 210, bottom: ltBar.overlayInsetBottomLT };
    const safeWidth = resolveInsetRenderWidth(1920, insets);

    expect(safeWidth).toBe(1500);

    const short = computeInfoBarLayout({
      referenceWidth: 1920,
      naturalContentWidth: 800,
      minWidth: ltInfoBar.minWidth,
      maxWidth: ltInfoBar.maxWidth,
      barHeight: BAR_HEIGHT,
      edgeToEdge: true,
      insets,
    });

    expect(short.barWidth).toBe(1360);
    expect(short.atMaxWidth).toBe(false);
    expect(short.containerStyle.paddingLeft).toBe(210);
    expect(short.containerStyle.paddingRight).toBe(210);
    expect(short.containerStyle.justifyContent).toBe('center');
    expect(short.slotWidth).toBe(1360);

    const mid = computeInfoBarLayout({
      referenceWidth: 1920,
      naturalContentWidth: 1420,
      minWidth: ltInfoBar.minWidth,
      maxWidth: ltInfoBar.maxWidth,
      barHeight: BAR_HEIGHT,
      edgeToEdge: true,
      insets,
    });

    expect(mid.barWidth).toBe(1420);
    expect(mid.atMaxWidth).toBe(false);
    expect(mid.slotWidth).toBe(1420);

    const wide = computeInfoBarLayout({
      referenceWidth: 1920,
      naturalContentWidth: 2000,
      minWidth: ltInfoBar.minWidth,
      maxWidth: ltInfoBar.maxWidth,
      barHeight: BAR_HEIGHT,
      edgeToEdge: true,
      insets,
    });

    expect(wide.barWidth).toBe(1500);
    expect(wide.atMaxWidth).toBe(true);
    expect(wide.slotWidth).toBe(1500);
  });

  it('centers content-sized bar in inset safe area via padded flex track', () => {
    const insets = { left: 360, right: 360, bottom: 40 };

    const layout = computeInfoBarLayout({
      referenceWidth: 1920,
      naturalContentWidth: 960,
      minWidth: 960,
      barHeight: BAR_HEIGHT,
      edgeToEdge: true,
      insets,
    });

    expect(layout.barWidth).toBe(960);
    expect(layout.containerStyle.width).toBe('100%');
    expect(layout.containerStyle.paddingLeft).toBe(360);
    expect(layout.containerStyle.paddingRight).toBe(360);
    expect(layout.containerStyle.display).toBe('flex');
    expect(layout.containerStyle.justifyContent).toBe('center');
    expect(layout.slotWidth).toBe(960);
  });

  it('centers bar in safe area by default', () => {
    const layout = computeInfoBarLayout({
      referenceWidth: 1920,
      naturalContentWidth: 960,
      minWidth: 960,
      barHeight: BAR_HEIGHT,
      align: 'center',
    });

    expect(layout.containerStyle.justifyContent).toBe('center');
  });

  it('supports start alignment', () => {
    const layout = computeInfoBarLayout({
      referenceWidth: 1920,
      naturalContentWidth: 960,
      minWidth: 960,
      barHeight: BAR_HEIGHT,
      align: 'start',
    });

    expect(layout.containerStyle.justifyContent).toBe('flex-start');
  });

  it('applies preview scale when container is narrower than reference width', () => {
    const layout = computeInfoBarLayout({
      referenceWidth: 960,
      containerWidth: 600,
      naturalContentWidth: 960,
      minWidth: 960,
      barHeight: BAR_HEIGHT,
      edgeToEdge: false,
      previewGutter: 32,
      insets: ZERO_OVERLAY_INSETS,
    });

    expect(layout.insetNative).toBe(false);
    expect(layout.barWidth).toBe(928);
    expect(layout.scale).toBeCloseTo(568 / 928);
    expect(layout.slotWidth).toBeCloseTo(928 * layout.scale);
  });
});
