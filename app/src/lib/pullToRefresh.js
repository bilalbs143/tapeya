/** Visual pull (px) required to trigger refresh. */
export const PTR_THRESHOLD = 64;

/** Cap after damping so the screen doesn’t rubber-band forever. */
export const PTR_MAX_PULL = PTR_THRESHOLD + 40;

/** Finger travel is damped so the spinner doesn’t jump. */
export const PTR_RESISTANCE = 0.42;

export const PTR_SETTLE = '200ms ease-out';

/** Ignore tiny jitter; lock out horizontal carousels at the top of Home. */
export const PTR_AXIS_LOCK_PX = 8;

export function isVerticalPullGesture(dx, dy) {
  return dy > PTR_AXIS_LOCK_PX && dy > Math.abs(dx);
}

export function isAtScrollTop(scrollTop) {
  return !Number.isFinite(scrollTop) || scrollTop <= 1;
}

export function dampPull(dy) {
  if (!Number.isFinite(dy) || dy <= 0) return 0;
  return dy * PTR_RESISTANCE;
}

export function shouldTriggerRefresh(dampedPull) {
  return dampedPull >= PTR_THRESHOLD;
}

/** How far the screen should shift: follow the finger, then hold while refreshing. */
export function ptrContentOffset(pull = 0, refreshing = false) {
  if (refreshing) return PTR_THRESHOLD;
  return Math.max(0, pull);
}

export function readScrollTop(scrollEl) {
  if (scrollEl) return scrollEl.scrollTop;
  if (typeof window === 'undefined') return 0;
  return window.scrollY || document.documentElement.scrollTop || 0;
}

export function hasOpenModalOverlay(root = typeof document !== 'undefined' ? document : null) {
  if (!root?.querySelector) return false;
  return Boolean(root.querySelector('[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]'));
}
