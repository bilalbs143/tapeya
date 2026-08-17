import { useEffect } from 'react';

import { useLocation } from 'react-router-dom';

import { isOverlayRoute } from '@/lib/isOverlayRoute';

/**
 * Loads GA4 gtag (web) and sends SPA page_view on route changes.
 * Mount only in consumer app shells — never on /overlay/* (OBS/vMix).
 */
export function GoogleAnalyticsBoot() {
  const location = useLocation();

  useEffect(() => {
    if (isOverlayRoute()) return;

    void import('@/lib/analytics/google').then(({ initGoogleAnalytics }) => initGoogleAnalytics());
  }, []);

  useEffect(() => {
    if (isOverlayRoute(location.pathname)) return;

    const path = `${location.pathname}${location.search}${location.hash}`;
    void import('@/lib/analytics/google').then(({ logPageView }) => logPageView(path));
  }, [location.pathname, location.search, location.hash]);

  return null;
}
