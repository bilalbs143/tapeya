import { describe, expect, it } from 'vitest';

import type { PostSponsorship } from '../model/schemas';
import { buildAdEvent, newClientEventId } from './buildAdEvent';

const sponsorship: PostSponsorship = {
  campaignId: 1,
  creativeId: 2,
  disclosureLabel: 'Sponsored',
  title: 'Pepsi',
  cta: { label: 'Shop', url: 'https://example.com', type: 'url' },
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('newClientEventId', () => {
  it('returns a UUID', () => {
    expect(newClientEventId()).toMatch(UUID_RE);
  });
});

describe('buildAdEvent', () => {
  it('emits a UUID client_event_id', () => {
    const event = buildAdEvent(sponsorship, 'home_feed', 'impression');
    expect(event.client_event_id).toMatch(UUID_RE);
    expect(event.type).toBe('impression');
    expect(event.creative_id).toBe(2);
    expect(event.campaign_id).toBe(1);
    expect(event.surface).toBe('home_feed');
  });
});
