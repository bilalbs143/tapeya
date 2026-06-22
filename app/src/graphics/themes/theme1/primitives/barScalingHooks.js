import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { geometry, ltBar, ltInfoBar } from '../config';
import { computeInfoBarLayout } from './computeInfoBarLayout';
import { computeScaledBarLayout, ZERO_OVERLAY_INSETS } from './computeScaledBarLayout';
import { useOverlayLayout } from './useOverlayLayout';

/**
 * Measures a fixed-design-width bar and returns the scale needed to fit it
 * inside the container. With overlay horizontal insets, uses native safe-area layout at scale 1.
 */
export function useScaledBarSurface(
  designWidth,
  edgeToEdge = true,
  barRadius = geometry.barRadius,
  previewGutter = ltBar.previewGutter,
) {
  const overlayLayout = useOverlayLayout();
  const containerRef = useRef(null);
  const innerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [naturalHeight, setNaturalHeight] = useState(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const sync = () => setContainerWidth((p) => (p === el.clientWidth ? p : el.clientWidth));
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    sync();
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const sync = () => setNaturalHeight((p) => (p === el.offsetHeight ? p : el.offsetHeight));
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    sync();
    return () => ro.disconnect();
  }, []);

  const referenceWidth = overlayLayout?.referenceWidth ?? containerWidth;
  const insets = overlayLayout?.insets ?? ZERO_OVERLAY_INSETS;

  const { scale, surfaceHeight, containerStyle, innerStyle, radius, renderWidth, insetNative } = computeScaledBarLayout({
    referenceWidth,
    containerWidth,
    designWidth,
    edgeToEdge,
    naturalHeight,
    insets,
    previewGutter,
    mobileBreakpoint: ltBar.mobileBreakpoint,
    barRadius,
  });

  return {
    containerRef,
    innerRef,
    scale,
    renderWidth,
    insetNative,
    surfaceHeight,
    radius,
    containerStyle,
    innerStyle,
  };
}

export function useContentFitBarSurface(edgeToEdge = true, barRadius = geometry.barRadius, previewGutter = ltBar.previewGutter) {
  const containerRef = useRef(null);
  const innerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [naturalWidth, setNaturalWidth] = useState(0);
  const [naturalHeight, setNaturalHeight] = useState(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const sync = () => setContainerWidth((p) => (p === el.clientWidth ? p : el.clientWidth));
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    sync();
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const sync = () => {
      setNaturalWidth((p) => (p === el.offsetWidth ? p : el.offsetWidth));
      setNaturalHeight((p) => (p === el.offsetHeight ? p : el.offsetHeight));
    };
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    sync();
    return () => ro.disconnect();
  }, []);

  const maxWidth = edgeToEdge ? containerWidth : Math.max(containerWidth - previewGutter, 0);
  const scale = naturalWidth > 0 && maxWidth > 0 ? Math.min(maxWidth / naturalWidth, 1) : 1;

  return {
    containerRef,
    innerRef,
    scale,
    surfaceWidth: naturalWidth * scale,
    surfaceHeight: naturalHeight * scale,
    radius: edgeToEdge ? 0 : barRadius,
  };
}

export { clampInfoBarWidth, computeInfoBarLayout } from './computeInfoBarLayout';
export { computeScaledBarLayout } from './computeScaledBarLayout';

/**
 * Layout hook for inset lower-third bars — fixed height, clamped width, centered in overlay safe area.
 *
 * @param {{
 *   minWidth?: number,
 *   maxWidth?: number,
 *   edgeToEdge?: boolean,
 *   barRadius?: number,
 *   previewGutter?: number,
 *   align?: 'center' | 'start',
 * }} options
 */
export function useInsetLTBarSurface({
  minWidth = ltInfoBar.minWidth,
  maxWidth = ltInfoBar.maxWidth,
  edgeToEdge = true,
  barRadius = geometry.barRadius,
  previewGutter = ltBar.previewGutter,
  align = ltInfoBar.align,
} = {}) {
  const overlayLayout = useOverlayLayout();
  const containerRef = useRef(null);
  const measureRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [naturalContentWidth, setNaturalContentWidth] = useState(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const sync = () => setContainerWidth((p) => (p === el.clientWidth ? p : el.clientWidth));
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    sync();
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const sync = () => {
      const el = measureRef.current;
      if (!el) return;
      const next = Math.ceil(Math.max(el.scrollWidth, el.offsetWidth));
      setNaturalContentWidth((p) => (p === next ? p : next));
    };
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    sync();
    return () => ro.disconnect();
  }, []);

  const referenceWidth = overlayLayout?.referenceWidth ?? containerWidth;
  const insets = overlayLayout?.insets ?? ZERO_OVERLAY_INSETS;

  const layout = computeInfoBarLayout({
    referenceWidth,
    containerWidth,
    naturalContentWidth,
    minWidth,
    maxWidth,
    barHeight: ltBar.height,
    edgeToEdge,
    insets,
    previewGutter,
    mobileBreakpoint: ltBar.mobileBreakpoint,
    barRadius,
    align,
  });

  return {
    containerRef,
    measureRef,
    ...layout,
  };
}

export function useFrameTransition(pre, post, delayMs = 800) {
  const [frame, setFrame] = useState(pre);

  useEffect(() => {
    setFrame(pre);
    const timer = setTimeout(() => setFrame(post), delayMs);
    return () => clearTimeout(timer);
  }, [pre, post, delayMs]);

  return frame;
}
