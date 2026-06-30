import { useEffect } from 'react';

import { initFacebookAnalytics } from '@/lib/analytics/facebook';

/**
 * Loads Meta Pixel (web) or confirms native SDK readiness.
 * Mount only in consumer app shells — never on /overlay/* (OBS/vMix).
 */
export function FacebookAnalyticsBoot() {
  useEffect(() => {
    void initFacebookAnalytics();
  }, []);

  return null;
}
