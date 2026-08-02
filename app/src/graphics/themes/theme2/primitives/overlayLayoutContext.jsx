import { useLayoutEffect, useRef, useState } from 'react';

import { resolveOverlayInsets } from './overlayLayoutInsets';
import { OverlayLayoutContext } from './overlayLayoutShared';

/** @typedef {import('./overlayLayoutInsets.js').OverlayInsetVariant} OverlayInsetVariant */

/**
 * Measures full overlay root width and exposes broadcast-safe inset margins.
 *
 * @param {{ variant?: OverlayInsetVariant, children: import('react').ReactNode }} props
 */
export function OverlayLayoutProvider({ variant, children }) {
  const rootRef = useRef(null);
  const [referenceWidth, setReferenceWidth] = useState(0);
  const insets = resolveOverlayInsets(variant);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const sync = () => setReferenceWidth((prev) => (prev === el.clientWidth ? prev : el.clientWidth));
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    sync();
    return () => ro.disconnect();
  }, []);

  return (
    <OverlayLayoutContext.Provider value={{ referenceWidth, insets }}>
      <div ref={rootRef} className="bc-controller-overlay-root bc-controller-overlay-root--bar min-h-0 flex-1">
        {children}
      </div>
    </OverlayLayoutContext.Provider>
  );
}
