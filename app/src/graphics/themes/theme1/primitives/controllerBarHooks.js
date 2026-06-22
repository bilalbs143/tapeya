import { useCallback, useLayoutEffect, useRef, useState } from 'react';

/**
 * Tracks container clientWidth with a callback ref so the first measure runs
 * synchronously when the node mounts (before useLayoutEffect), avoiding a
 * zero-width first frame that collapses scaled lower-thirds.
 */
export function useContainerWidth() {
  const [w, setW] = useState(0);
  const roRef = useRef(null);

  const ref = useCallback((node) => {
    if (roRef.current) {
      roRef.current.disconnect();
      roRef.current = null;
    }
    if (!node) return;

    const apply = () => {
      const cw = node.clientWidth;
      setW((prev) => (prev === cw ? prev : cw));
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(node);
    roRef.current = ro;
  }, []);

  useLayoutEffect(() => () => roRef.current?.disconnect(), []);

  return [ref, w];
}
