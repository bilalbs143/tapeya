import { ltBar } from '../config';

/** @typedef {'stats' | 'info' | 'wide' | 'bottomOnly'} OverlayInsetVariant */

const INSET_TOKENS = {
  stats: {
    left: ltBar.overlayInsetXStats,
    right: ltBar.overlayInsetXStats,
    bottom: ltBar.overlayInsetBottom,
  },
  info: {
    left: ltBar.overlayInsetXInfo,
    right: ltBar.overlayInsetXInfo,
    bottom: ltBar.overlayInsetBottomSm,
  },
  wide: {
    left: ltBar.overlayInsetXWide,
    right: ltBar.overlayInsetXWide,
    bottom: ltBar.overlayInsetBottomSm,
  },
  bottomOnly: {
    left: 0,
    right: 0,
    bottom: ltBar.overlayInsetBottomSm,
  },
};

/** @param {OverlayInsetVariant} [variant] */
export function resolveOverlayInsets(variant = 'info') {
  return INSET_TOKENS[variant] ?? INSET_TOKENS.info;
}
