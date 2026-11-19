import type { AdSurface, PostSponsorship } from '../model/schemas';
import { enqueueAdEvent } from './adEventQueue';
import { hasTrackedAdMetric, markAdMetric } from './adMetricsSession';
import { buildAdEvent } from './buildAdEvent';
import { openAdCta } from './openAdCta';

/** Fire click event (once per creative/session) then open the CTA. */
export function trackSponsoredClick(
  sponsorship: PostSponsorship,
  surface: AdSurface,
  navigate: (path: string) => void
): void {
  const cta = sponsorship.cta;
  if (!cta) return;

  if (!hasTrackedAdMetric(surface, sponsorship.creativeId, 'click')) {
    markAdMetric(surface, sponsorship.creativeId, 'click');
    enqueueAdEvent(buildAdEvent(sponsorship, surface, 'click', { meta: { target: 'cta' } }));
  }

  openAdCta(cta, navigate);
}
