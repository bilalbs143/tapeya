/** Shared list/note/graphics helpers for matches RTK Query modules. */

import { z } from 'zod';

import type { Paginated } from '@/shared/api/types';
import { unwrapPaginated } from '@/shared/api/unwrap';

import type { GraphicSession, GraphicTheme } from '../lib/broadcastGraphics';
import { type Match, quickMatchWireSchema, toDomain } from '../model/schemas';

export function mapMatchList(raw: unknown): Paginated<Match> {
  const page = unwrapPaginated(quickMatchWireSchema)(raw);
  return { items: page.items.map(toDomain), meta: page.meta };
}

export const matchNoteWireSchema = z.object({
  id: z.number(),
  body: z.string(),
  author_name: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
});

export type MatchNoteRow = {
  id: number;
  body: string;
  authorName: string | null;
  createdAt: string | null;
};

export const graphicThemeWireSchema = z
  .object({
    id: z.number(),
    slug: z.string(),
    name: z.string(),
    config_schema: z
      .object({
        properties: z
          .array(
            z.object({
              key: z.string(),
              label: z.string(),
              type: z.string(),
              default: z.unknown().optional(),
            })
          )
          .optional(),
      })
      .nullable()
      .optional(),
    default_config: z.record(z.string(), z.unknown()).nullable().optional(),
    is_active: z.boolean().optional(),
  })
  .passthrough();

export const graphicSessionWireSchema = z
  .object({
    id: z.number(),
    match_id: z.number(),
    graphic_theme_id: z.number(),
    config: z.record(z.string(), z.unknown()).nullable().optional(),
    signed_overlay_url: z.string().nullable().optional(),
    signed_overlay_expires_at: z.string().nullable().optional(),
  })
  .passthrough();

export function toGraphicTheme(wire: z.infer<typeof graphicThemeWireSchema>): GraphicTheme {
  return {
    id: wire.id,
    slug: wire.slug,
    name: wire.name,
    configSchema: (wire.config_schema ?? null) as GraphicTheme['configSchema'],
    defaultConfig: wire.default_config ?? null,
    isActive: wire.is_active !== false,
  };
}

export function toGraphicSession(wire: z.infer<typeof graphicSessionWireSchema>): GraphicSession {
  return {
    id: wire.id,
    matchId: wire.match_id,
    graphicThemeId: wire.graphic_theme_id,
    config: wire.config ?? null,
    signedOverlayUrl: wire.signed_overlay_url ?? null,
    signedOverlayExpiresAt: wire.signed_overlay_expires_at ?? null,
  };
}
