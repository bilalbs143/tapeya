/**
 * Re-tap Home / Reels (already on that screen) → scroll to top + refresh.
 * `/reels/12`, `/reels/u/…`, `/reels/upload` still navigate to `/reels`.
 */

import { useEffect } from 'react';

export const TAB_RESELECT_EVENT = 'tapeya:tab-reselect';

/**
 * @param {string} pathname
 * @param {string} tabPath
 * @returns {boolean}
 */
export function isReselectableTabPath(pathname, tabPath) {
  return (tabPath === '/home' || tabPath === '/reels') && pathname === tabPath;
}

/**
 * @param {'home'|'reels'} tab
 */
export function requestTabReselect(tab) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(TAB_RESELECT_EVENT, { detail: { tab } }));
}

/**
 * @param {Pick<Event, 'preventDefault'>} event
 * @param {string} pathname
 * @param {string} tabPath
 * @returns {boolean} true when the click was consumed
 */
export function handlePrimaryTabClick(event, pathname, tabPath) {
  if (!isReselectableTabPath(pathname, tabPath)) return false;
  event.preventDefault();
  requestTabReselect(tabPath === '/home' ? 'home' : 'reels');
  return true;
}

/**
 * @param {'home'|'reels'} tab
 * @param {() => void} onReselect
 */
export function useTabReselect(tab, onReselect) {
  useEffect(() => {
    const onEvent = (event) => {
      if (event.detail?.tab === tab) onReselect();
    };
    window.addEventListener(TAB_RESELECT_EVENT, onEvent);
    return () => window.removeEventListener(TAB_RESELECT_EVENT, onEvent);
  }, [onReselect, tab]);
}
