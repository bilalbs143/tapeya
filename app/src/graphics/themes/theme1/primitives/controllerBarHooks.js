import { useLayoutEffect, useRef, useState } from 'react';

export function useContainerWidth() {
  const ref = useRef(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => setW((prev) => (prev === el.clientWidth ? prev : el.clientWidth));
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    apply();
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}
