import { useLayoutEffect, useRef, useState } from 'react';

export const FS_DESIGN_W = 1920;
export const FS_DESIGN_H = 1080;

/**
 * Measures a parent and returns the scale factor to fill a design canvas edge-to-edge.
 *
 * @param {number} [designW=1920]
 * @param {number} [designH=1080]
 * @param {'cover' | 'contain'} [fit='cover']
 */
export function useFitStage(designW = FS_DESIGN_W, designH = FS_DESIGN_H, fit = 'cover') {
  const ref = useRef(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const apply = () => {
      setBox((prev) =>
        prev.w === el.clientWidth && prev.h === el.clientHeight ? prev : { w: el.clientWidth, h: el.clientHeight },
      );
    };

    const ro = new ResizeObserver(apply);
    ro.observe(el);
    apply();
    return () => ro.disconnect();
  }, []);

  const scale =
    box.w && box.h
      ? fit === 'contain'
        ? Math.min(box.w / designW, box.h / designH)
        : Math.max(box.w / designW, box.h / designH)
      : 0;

  return { ref, scale, ready: scale > 0 };
}
