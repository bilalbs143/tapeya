import { beforeEach, describe, expect, it } from 'vitest';

import { hasTrackedAdMetric, markAdMetric, resetAdMetricsSessionForTests } from './adMetricsSession';

describe('adMetricsSession', () => {
  beforeEach(() => {
    resetAdMetricsSessionForTests();
  });

  it('tracks each kind once per surface/creative', () => {
    expect(hasTrackedAdMetric('home_feed', 9, 'impression')).toBe(false);
    markAdMetric('home_feed', 9, 'impression');
    expect(hasTrackedAdMetric('home_feed', 9, 'impression')).toBe(true);
    expect(hasTrackedAdMetric('home_feed', 9, 'view')).toBe(false);
    expect(hasTrackedAdMetric('reels_feed', 9, 'impression')).toBe(false);
  });
});
