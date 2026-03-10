import { useLayoutEffect } from 'react';

import { useLocation } from 'react-router-dom';

// Disable the browser's built-in scroll restoration so it doesn't
// overwrite our manual scroll-to-top after back/forward navigation.
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

/**
 * Resets scroll to the top on every route change.
 * Must live inside a React Router provider (e.g. BrowserRouter).
 *
 * - Disables the browser's native scroll restoration so back/forward
 *   navigation doesn't re-apply a saved scroll offset after our effect runs.
 * - useLayoutEffect fires before the browser paints so there is no visible
 *   flash of the wrong scroll position.
 */
export function ScrollRestoration() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    scrollToTop();
  }, [pathname]);

  return null;
}
