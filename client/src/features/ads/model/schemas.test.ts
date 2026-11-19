import { describe, expect, it } from 'vitest';

import { toSponsorship } from './schemas';

describe('toSponsorship', () => {
  it('maps a full sponsorship envelope', () => {
    const sponsorship = toSponsorship({
      is_sponsored: true,
      campaign_id: 9,
      creative_id: 42,
      disclosure_label: 'Paid Partnership',
      cta: { label: 'Shop Now', url: 'https://example.com/pepsi', type: 'url' },
      brand: { name: 'Pepsi', logo_url: null, partner_id: 1 },
    });

    expect(sponsorship).toEqual({
      campaignId: 9,
      creativeId: 42,
      disclosureLabel: 'Paid Partnership',
      title: 'Pepsi',
      cta: { label: 'Shop Now', url: 'https://example.com/pepsi', type: 'url' },
    });
  });

  it('prefers sponsorship title over brand name', () => {
    const sponsorship = toSponsorship({
      is_sponsored: true,
      campaign_id: 1,
      creative_id: 2,
      title: 'Pepsi — Refresh Your Game Day',
      brand: { name: 'Pepsi', logo_url: null, partner_id: 1 },
    });

    expect(sponsorship?.title).toBe('Pepsi — Refresh Your Game Day');
  });

  it('returns null when not sponsored', () => {
    expect(toSponsorship(null)).toBeNull();
    expect(
      toSponsorship({
        is_sponsored: false,
        campaign_id: 1,
        creative_id: 2,
      })
    ).toBeNull();
  });

  it('defaults disclosure label and drops incomplete CTA', () => {
    const sponsorship = toSponsorship({
      is_sponsored: true,
      campaign_id: 1,
      creative_id: 2,
      cta: { label: '', url: 'https://example.com', type: 'url' },
    });

    expect(sponsorship?.disclosureLabel).toBe('Sponsored');
    expect(sponsorship?.cta).toBeNull();
  });

  it('preserves whatsapp cta type and custom label', () => {
    const sponsorship = toSponsorship({
      is_sponsored: true,
      campaign_id: 1,
      creative_id: 2,
      cta: { label: 'Message Us', url: '+923216516130', type: 'whatsapp' },
      brand: { name: 'Pepsi', logo_url: null, partner_id: 1 },
    });

    expect(sponsorship?.cta).toEqual({
      label: 'Message Us',
      url: '+923216516130',
      type: 'whatsapp',
    });
  });
});
