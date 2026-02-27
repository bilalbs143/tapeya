import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls the window to the top on every navigation.
 * Renders nothing; must be used inside a React Router provider (e.g. BrowserRouter).
 *
 * This ensures each page loads from the top instead of inheriting the previous
 * page's scroll position, which is the expected UX for full-page navigations.
 */
export function ScrollRestoration() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTo(0, 0);
    document.body.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
