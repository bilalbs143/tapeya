import { isLiveImmersivePath, isOperatorScoringPath, isReelsImmersivePath } from '@/shared/config/paths';

/** Rubber-band ceiling (px). */
export const PTR_MAX_PULL = 96;

/** Release past this pull (px) triggers soft content refresh. */
export const PTR_THRESHOLD = 64;

/** Spinner slot while refreshing / committed pull. */
export const PTR_REFRESH_OFFSET = 48;

/**
 * Diminishing-returns pull distance (Facebook-like).
 * `rawDy / (1 + rawDy / max)` — asymptotes toward `max`.
 */
export function resistPull(rawDy: number, max: number = PTR_MAX_PULL): number {
  if (rawDy <= 0) return 0;
  return rawDy / (1 + rawDy / max);
}

export function isPullArmed(pull: number, threshold: number = PTR_THRESHOLD): boolean {
  return pull >= threshold;
}

export function pullProgress(pull: number, threshold: number = PTR_THRESHOLD): number {
  if (threshold <= 0) return 0;
  return Math.min(1, Math.max(0, pull / threshold));
}

/** Immersive surfaces own their own gestures — no shell/PageDock PTR. */
export function isPullToRefreshPath(pathname: string): boolean {
  return !isOperatorScoringPath(pathname) && !isLiveImmersivePath(pathname) && !isReelsImmersivePath(pathname);
}

/** Touch / coarse pointer only — never arm mouse-desktop PTR. */
export function canUsePullToRefresh(): boolean {
  if (typeof window === 'undefined') return false;
  if ('ontouchstart' in window) return true;
  return typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
}

/**
 * Ignore pulls that begin inside a nested vertical scroller (not the attached root).
 * Horizontal rails (`overflow-x`) are allowed so a downward pull still arms PTR.
 */
export function shouldIgnorePullTarget(target: EventTarget | null, root: HTMLElement): boolean {
  let el = target instanceof Element ? target : null;
  while (el && el !== root) {
    if (el instanceof HTMLElement) {
      const style = window.getComputedStyle(el);
      const oy = style.overflowY;
      const canScrollY =
        (oy === 'auto' || oy === 'scroll' || oy === 'overlay') && el.scrollHeight > el.clientHeight + 1;
      if (canScrollY) return true;
    }
    el = el.parentElement;
  }
  return false;
}
