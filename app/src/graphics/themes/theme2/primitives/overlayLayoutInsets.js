import { ltBar } from '../config';

/**
 * Overlay inset variant for BroadcastShell / OverlayLayoutProvider.
 *
 * @typedef {'lt' | 'bottomOnly'} OverlayInsetVariant
 */

/** @type {import('./computeScaledBarLayout.js').OverlayInsets} */
const LT_INSETS = {
  left: ltBar.overlayInsetXLT,
  right: ltBar.overlayInsetXLT,
  bottom: ltBar.overlayInsetBottomLT,
};

const INSET_TOKENS = {
  lt: LT_INSETS,
  bottomOnly: {
    left: 0,
    right: 0,
    bottom: ltBar.overlayInsetBottomLT,
  },
};

/** @param {OverlayInsetVariant} [variant] */
export function resolveOverlayInsets(variant = 'lt') {
  const insets = INSET_TOKENS[variant];
  if (!insets) {
    throw new Error(`Unknown overlay inset variant "${variant}". Expected "lt" or "bottomOnly".`);
  }
  return insets;
}
