import { z } from 'zod';

import { unwrapData, unwrapList } from '@/shared/api/unwrap';

export const highlightWireSchema = z
  .object({
    id: z.number(),
    title: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    thumbnail: z.string().nullable().optional(),
    video_source: z.enum(['youtube', 'upload']).nullable().optional(),
    video_url: z.string().nullable().optional(),
    duration: z.union([z.string(), z.number()]).nullable().optional(),
    tournament_id: z.number().nullable().optional(),
    views_count: z.number().optional(),
    likes_count: z.number().optional(),
    dislikes_count: z.number().optional(),
    shares_count: z.number().optional(),
    my_reaction: z.enum(['like', 'dislike']).nullable().optional(),
    created_at: z.string().nullable().optional(),
  })
  .passthrough();

export type HighlightWire = z.infer<typeof highlightWireSchema>;

export type HighlightReaction = 'like' | 'dislike';
export type HighlightVideoSource = 'youtube' | 'upload';

export type Highlight = {
  id: number;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  videoSource: HighlightVideoSource;
  videoUrl: string | null;
  duration: string | null;
  viewsCount: number;
  likesCount: number;
  dislikesCount: number;
  sharesCount: number;
  myReaction: HighlightReaction | null;
  createdAt: string | null;
};

export type HighlightReactionCounts = {
  likesCount: number;
  dislikesCount: number;
  sharesCount: number;
  myReaction: HighlightReaction | null;
};

const reactionCountsWireSchema = z.object({
  likes_count: z.number(),
  dislikes_count: z.number(),
  shares_count: z.number(),
  my_reaction: z.enum(['like', 'dislike']).nullable().optional(),
});

export function formatHighlightDuration(raw: string | number | null | undefined): string | null {
  if (raw == null || raw === '') return null;
  const str = String(raw).trim();
  if (!str) return null;
  return /^\d+$/.test(str) ? `${str} min` : str;
}

export function formatHighlightDate(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

export function compactCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  if (n < 1_000_000) return `${Math.round(n / 1000)}k`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}m`;
}

export function toDomain(wire: HighlightWire): Highlight {
  const source = wire.video_source === 'upload' ? 'upload' : 'youtube';
  return {
    id: wire.id,
    title: wire.title?.trim() || 'Highlight',
    description: wire.description?.trim() || null,
    thumbnailUrl: wire.thumbnail ?? null,
    videoSource: source,
    videoUrl: wire.video_url ?? null,
    duration: formatHighlightDuration(wire.duration),
    viewsCount: wire.views_count ?? 0,
    likesCount: wire.likes_count ?? 0,
    dislikesCount: wire.dislikes_count ?? 0,
    sharesCount: wire.shares_count ?? 0,
    myReaction: wire.my_reaction ?? null,
    createdAt: wire.created_at ?? null,
  };
}

export function parseHighlightList(raw: unknown): Highlight[] {
  return unwrapList(highlightWireSchema)(raw).map(toDomain);
}

export function parseHighlight(raw: unknown): Highlight {
  return toDomain(unwrapData(highlightWireSchema)(raw));
}

export function parseReactionCounts(raw: unknown): HighlightReactionCounts {
  const body = typeof raw === 'object' && raw != null && 'data' in raw ? (raw as { data: unknown }).data : raw;
  const wire = reactionCountsWireSchema.parse(body);
  return {
    likesCount: wire.likes_count,
    dislikesCount: wire.dislikes_count,
    sharesCount: wire.shares_count,
    myReaction: wire.my_reaction ?? null,
  };
}

export function sortByRecent(items: Highlight[]): Highlight[] {
  return [...items].sort((a, b) => {
    const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bt - at;
  });
}

export function sortByViews(items: Highlight[]): Highlight[] {
  return [...items].sort((a, b) => b.viewsCount - a.viewsCount || b.id - a.id);
}

export function filterByTitle(items: Highlight[], query: string): Highlight[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((h) => h.title.toLowerCase().includes(q));
}

export function relatedHighlights(items: Highlight[], currentId: number, limit = 5): Highlight[] {
  return items.filter((h) => h.id !== currentId).slice(0, limit);
}
