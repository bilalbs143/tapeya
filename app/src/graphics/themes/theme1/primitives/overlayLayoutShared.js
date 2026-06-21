import { createContext } from 'react';

/** @type {import('react').Context<{ referenceWidth: number, insets: import('./computeScaledBarLayout.js').OverlayInsets } | null>} */
export const OverlayLayoutContext = createContext(null);
