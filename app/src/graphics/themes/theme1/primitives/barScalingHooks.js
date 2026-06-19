import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { geometry, ltBar } from '../config';

/**
 * Measures a fixed-design-width bar and returns the scale needed to fit it
 * inside the container.
 */
export function useScaledBarSurface(
  designWidth,
  edgeToEdge = true,
  barRadius = geometry.barRadius,
  previewGutter = ltBar.previewGutter,
) {
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

  const isNarrow = containerWidth > 0 && containerWidth < ltBar.mobileBreakpoint;
  const scale =
    edgeToEdge || isNarrow ? containerWidth / designWidth : Math.min((containerWidth - previewGutter) / designWidth, 1);

  return {
    containerRef,
    innerRef,
    scale,
    surfaceHeight: naturalHeight * scale,
    radius: edgeToEdge ? 0 : barRadius,
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

export function useFrameTransition(pre, post, delayMs = 800) {
  const [frame, setFrame] = useState(pre);

  useEffect(() => {
    setFrame(pre);
    const timer = setTimeout(() => setFrame(post), delayMs);
    return () => clearTimeout(timer);
  }, [pre, post, delayMs]);

  return frame;
}
