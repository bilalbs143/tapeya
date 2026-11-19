import { z } from 'zod';

export const adSurfaceSchema = z.enum(['home_feed', 'reels_feed']);
export type AdSurface = z.infer<typeof adSurfaceSchema>;

export const adEventTypeSchema = z.enum(['impression', 'view', 'click', 'report', 'skip', 'complete', 'dismiss']);
export type AdEventType = z.infer<typeof adEventTypeSchema>;

export const adCtaTypeSchema = z.enum(['url', 'deep_link', 'whatsapp']);
export type AdCtaType = z.infer<typeof adCtaTypeSchema>;

export const sponsorshipWireSchema = z
  .object({
    is_sponsored: z.boolean(),
    campaign_id: z.number(),
    creative_id: z.number(),
    disclosure_label: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    cta: z
      .object({
        label: z.string().nullable().optional(),
        url: z.string().nullable().optional(),
        type: adCtaTypeSchema.optional(),
      })
      .nullable()
      .optional(),
    brand: z
      .object({
        name: z.string().nullable().optional(),
        logo_url: z.string().nullable().optional(),
        partner_id: z.number().nullable().optional(),
      })
      .nullable()
      .optional(),
  })
  .nullable()
  .optional();

export type SponsorshipWire = z.infer<typeof sponsorshipWireSchema>;

export type AdCta = {
  label: string;
  url: string;
  type: AdCtaType;
};

export type PostSponsorship = {
  campaignId: number;
  creativeId: number;
  disclosureLabel: string;
  /** Creative headline, else brand name. */
  title: string | null;
  cta: AdCta | null;
};

export type AdClientEvent = {
  client_event_id: string;
  type: AdEventType;
  creative_id: number;
  campaign_id: number;
  surface: AdSurface;
  platform: 'ios' | 'android' | 'web';
  occurred_at: string;
  watched_ms?: number | undefined;
  completion_rate?: number | undefined;
  meta?: Record<string, unknown> | undefined;
};

export function toSponsorship(wire: SponsorshipWire): PostSponsorship | null {
  if (!wire || !wire.is_sponsored) return null;
  if (!Number.isFinite(wire.campaign_id) || !Number.isFinite(wire.creative_id)) return null;

  const rawLabel = wire.cta?.label?.trim();
  const rawUrl = wire.cta?.url?.trim();
  const rawType = wire.cta?.type;
  const ctaType = rawType === 'whatsapp' || rawType === 'deep_link' || rawType === 'url' ? rawType : 'url';
  const cta: AdCta | null =
    rawUrl && rawLabel
      ? {
          label: rawLabel,
          url: rawUrl,
          type: ctaType,
        }
      : null;

  const title = wire.title?.trim() || wire.brand?.name?.trim() || null;

  return {
    campaignId: wire.campaign_id,
    creativeId: wire.creative_id,
    disclosureLabel: wire.disclosure_label?.trim() || 'Sponsored',
    title,
    cta,
  };
}

export const postDistributionSchema = z.enum(['organic', 'sponsored_only']);
export type PostDistribution = z.infer<typeof postDistributionSchema>;
