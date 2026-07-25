import { useLayoutEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { measureFitFontSize } from './fitTextSize';

/**
 * Single-line label that scales font size down to fit a fixed width (never wraps).
 *
 * @param {{
 *   children: string,
 *   maxWidth: number,
 *   maxFontSize?: number,
 *   minFontSize?: number,
 *   className?: string,
 * }} props
 */
export function FitText({ children, maxWidth, maxFontSize = 46, minFontSize = 22, className }) {
  const textRef = useRef(null);
  const [fontSize, setFontSize] = useState(maxFontSize);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el || !children) return;

    const fit = () => {
      const next = measureFitFontSize(el, { maxWidth, maxFontSize, minFontSize });
      setFontSize((prev) => (prev === next ? prev : next));
    };

    fit();

    const ro = new ResizeObserver(fit);
    ro.observe(el);

    let cancelled = false;
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) fit();
      });
    }

    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [children, maxWidth, maxFontSize, minFontSize]);

  if (!children) return null;

  return (
    <div className="overflow-hidden text-center" style={{ width: maxWidth }}>
      <span ref={textRef} className={cn('inline-block whitespace-nowrap', className)} style={{ fontSize }}>
        {children}
      </span>
    </div>
  );
}
