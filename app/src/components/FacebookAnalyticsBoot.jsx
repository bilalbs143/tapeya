import { useEffect } from 'react';

import { isOverlayRoute } from '@/lib/isOverlayRoute';

/**
 * Loads Meta Pixel (web) or confirms native SDK readiness.
 * Mount only in consumer app shells — never on /overlay/* (OBS/vMix).
 */
export function FacebookAnalyticsBoot() {
  useEffect(() => {
    if (isOverlayRoute()) return;

    void import('@/lib/analytics/facebook').then(({ initFacebookAnalytics }) => initFacebookAnalytics());
  }, []);

  return null;
}
