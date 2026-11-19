import { getPlatform } from '@/shared/platform/platform';

import type { AdClientEvent, AdEventType, AdSurface, PostSponsorship } from '../model/schemas';

/** Server validates `client_event_id` as UUID — never emit opaque strings. */
export function newClientEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const n = (Math.random() * 16) | 0;
    const v = ch === 'x' ? n : (n & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function buildAdEvent(
  sponsorship: PostSponsorship,
  surface: AdSurface,
  type: AdEventType,
  extras?: {
    watchedMs?: number | undefined;
    completionRate?: number | undefined;
    meta?: Record<string, unknown> | undefined;
  }
): AdClientEvent {
  return {
    client_event_id: newClientEventId(),
    type,
    creative_id: sponsorship.creativeId,
    campaign_id: sponsorship.campaignId,
    surface,
    platform: getPlatform(),
    occurred_at: new Date().toISOString(),
    ...(extras?.watchedMs != null ? { watched_ms: Math.max(0, Math.round(extras.watchedMs)) } : {}),
    ...(extras?.completionRate != null ? { completion_rate: Math.min(1, Math.max(0, extras.completionRate)) } : {}),
    ...(extras?.meta ? { meta: extras.meta } : {}),
  };
}
