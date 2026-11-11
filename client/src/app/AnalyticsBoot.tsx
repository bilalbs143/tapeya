import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Web gtag page_view + native Firebase screen_view on route changes. */
export function AnalyticsBoot() {
  const location = useLocation();

  useEffect(() => {
    const path = `${location.pathname}${location.search}${location.hash}`;
    void import('@/shared/lib/analytics/screen').then(({ logScreenView }) => logScreenView(path));
  }, [location.pathname, location.search, location.hash]);

  return null;
}
