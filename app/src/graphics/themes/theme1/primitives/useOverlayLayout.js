import { useContext } from 'react';

import { OverlayLayoutContext } from './overlayLayoutShared';

/** @returns {{ referenceWidth: number, insets: import('./computeScaledBarLayout.js').OverlayInsets } | null} */
export function useOverlayLayout() {
  return useContext(OverlayLayoutContext);
}
