import { describe, expect, it } from 'vitest';

import { computeScaledBarLayout, resolveInsetRenderWidth, ZERO_OVERLAY_INSETS } from '../computeScaledBarLayout';

const DESIGN_WIDTH = 1920;
const NATURAL_HEIGHT = 139;

describe('computeScaledBarLayout', () => {
  it('uses transform scale from reference width when no horizontal insets', () => {
    const layout = computeScaledBarLayout({
      referenceWidth: 1920,
      containerWidth: 1920,
      designWidth: DESIGN_WIDTH,
      edgeToEdge: true,
      naturalHeight: NATURAL_HEIGHT,
      insets: ZERO_OVERLAY_INSETS,
    });

    expect(layout.insetNative).toBe(false);
    expect(layout.scale).toBe(1);
    expect(layout.renderWidth).toBe(DESIGN_WIDTH);
    expect(layout.surfaceHeight).toBe(NATURAL_HEIGHT);
  });

  it('uses native safe-area layout at scale 1 when horizontal insets are active', () => {
    const insets = { left: 380, right: 380, bottom: 40 };
    const layout = computeScaledBarLayout({
      referenceWidth: 1920,
      containerWidth: 1160,
      designWidth: DESIGN_WIDTH,
      edgeToEdge: true,
      naturalHeight: NATURAL_HEIGHT,
      insets,
    });

    expect(layout.insetNative).toBe(true);
    expect(layout.scale).toBe(1);
    expect(layout.renderWidth).toBe(1160);
    expect(layout.surfaceHeight).toBe(NATURAL_HEIGHT);
    expect(layout.containerStyle.marginLeft).toBe(380);
    expect(layout.containerStyle.marginRight).toBe(380);
    expect(layout.containerStyle.marginBottom).toBe(40);
  });

  it('resolveInsetRenderWidth matches overlay minus insets', () => {
    expect(resolveInsetRenderWidth(1920, { left: 340, right: 340, bottom: 0 })).toBe(1240);
  });

  it('uses reference width when only bottom inset is set', () => {
    const layout = computeScaledBarLayout({
      referenceWidth: 1920,
      containerWidth: 1920,
      designWidth: DESIGN_WIDTH,
      edgeToEdge: true,
      naturalHeight: NATURAL_HEIGHT,
      insets: { left: 0, right: 0, bottom: 45 },
    });

    expect(layout.insetNative).toBe(false);
    expect(layout.scale).toBe(1);
    expect(layout.containerStyle.marginBottom).toBe(45);
  });

  it('applies preview gutter when not edge-to-edge', () => {
    const layout = computeScaledBarLayout({
      referenceWidth: 1920,
      containerWidth: 1920,
      designWidth: DESIGN_WIDTH,
      edgeToEdge: false,
      naturalHeight: NATURAL_HEIGHT,
      insets: ZERO_OVERLAY_INSETS,
      previewGutter: 48,
      barRadius: 8,
    });

    expect(layout.scale).toBe((1920 - 48) / DESIGN_WIDTH);
    expect(layout.radius).toBe(8);
  });
});
