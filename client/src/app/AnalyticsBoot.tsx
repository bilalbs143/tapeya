import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * - Web gtag / Meta Pixel boot
 * - Native Firebase screen_view + Meta App Events ready
 */
export function AnalyticsBoot() {
  const location = useLocation();

  useEffect(() => {
    void import('@/shared/lib/analytics/facebook').then(({ initFacebookAnalytics }) => initFacebookAnalytics());
  }, []);

  useEffect(() => {
    const path = `${location.pathname}${location.search}${location.hash}`;
    void import('@/shared/lib/analytics/screen').then(({ logScreenView }) => logScreenView(path));
  }, [location.pathname, location.search, location.hash]);

  return null;
}
