import { z } from 'zod';

import { unwrapData, unwrapList } from '@/shared/api/unwrap';

const episodeSummaryWireSchema = z
  .object({
    id: z.number(),
    serial_id: z.number().nullable().optional(),
    drama_serial_id: z.number().nullable().optional(),
    episode_number: z.number().optional(),
    title: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    thumbnail: z.string().nullable().optional(),
    duration: z.string().nullable().optional(),
    views_count: z.number().optional(),
    likes_count: z.number().optional(),
    dislikes_count: z.number().optional(),
    comments_count: z.number().optional(),
    shares_count: z.number().optional(),
  })
  .passthrough();

const serialWireSchema = z
  .object({
    id: z.number(),
    title: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    poster: z.string().nullable().optional(),
    episodes_count: z.number().optional(),
    first_episode_id: z.number().nullable().optional(),
    episodes: z.array(episodeSummaryWireSchema).optional(),
    created_at: z.string().nullable().optional(),
  })
  .passthrough();

const episodeWireSchema = z
  .object({
    id: z.number(),
    serial_id: z.number().nullable().optional(),
    episode_number: z.number().optional(),
    title: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    thumbnail: z.string().nullable().optional(),
    video_source: z.string().nullable().optional(),
    video_url: z.string().nullable().optional(),
    duration: z.string().nullable().optional(),
    views_count: z.number().optional(),
    likes_count: z.number().optional(),
    dislikes_count: z.number().optional(),
    comments_count: z.number().optional(),
    shares_count: z.number().optional(),
    my_reaction: z.string().nullable().optional(),
    serial: z
      .object({
        id: z.number(),
        title: z.string().nullable().optional(),
        poster: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
    prev_episode_id: z.number().nullable().optional(),
    next_episode_id: z.number().nullable().optional(),
  })
  .passthrough();

export type DramaEpisodeSummary = {
  id: number;
  serialId: number | null;
  episodeNumber: number;
  title: string;
  description: string | null;
  thumbnail: string | null;
  duration: string | null;
  viewsCount: number;
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
  sharesCount: number;
};

export type DramaSerial = {
  id: number;
  title: string;
  description: string | null;
  poster: string | null;
  episodesCount: number;
  firstEpisodeId: number | null;
  episodes: DramaEpisodeSummary[];
};

export type DramaEpisode = DramaEpisodeSummary & {
  videoSource: 'youtube' | 'upload';
  videoUrl: string | null;
  myReaction: 'like' | 'dislike' | null;
  serial: { id: number; title: string; poster: string | null } | null;
  prevEpisodeId: number | null;
  nextEpisodeId: number | null;
};

function toEpisodeSummary(wire: z.infer<typeof episodeSummaryWireSchema>): DramaEpisodeSummary {
  return {
    id: wire.id,
    serialId: wire.serial_id ?? wire.drama_serial_id ?? null,
    episodeNumber: wire.episode_number ?? 0,
    title: wire.title?.trim() || `Episode ${wire.episode_number ?? ''}`,
    description: wire.description?.trim() || null,
    thumbnail: wire.thumbnail ?? null,
    duration: wire.duration ?? null,
    viewsCount: wire.views_count ?? 0,
    likesCount: wire.likes_count ?? 0,
    dislikesCount: wire.dislikes_count ?? 0,
    commentsCount: wire.comments_count ?? 0,
    sharesCount: wire.shares_count ?? 0,
  };
}

export function toSerial(wire: z.infer<typeof serialWireSchema>): DramaSerial {
  return {
    id: wire.id,
    title: wire.title?.trim() || 'Serial',
    description: wire.description?.trim() || null,
    poster: wire.poster ?? null,
    episodesCount: wire.episodes_count ?? wire.episodes?.length ?? 0,
    firstEpisodeId: wire.first_episode_id ?? null,
    episodes: (wire.episodes ?? []).map(toEpisodeSummary),
  };
}

export function toEpisode(wire: z.infer<typeof episodeWireSchema>): DramaEpisode {
  const summary = toEpisodeSummary(wire);
  const reaction = wire.my_reaction === 'like' || wire.my_reaction === 'dislike' ? wire.my_reaction : null;
  return {
    ...summary,
    videoSource: wire.video_source === 'upload' ? 'upload' : 'youtube',
    videoUrl: wire.video_url ?? null,
    myReaction: reaction,
    serial: wire.serial
      ? {
          id: wire.serial.id,
          title: wire.serial.title?.trim() || 'Serial',
          poster: wire.serial.poster ?? null,
        }
      : null,
    prevEpisodeId: wire.prev_episode_id ?? null,
    nextEpisodeId: wire.next_episode_id ?? null,
  };
}

export function parseSerialList(raw: unknown): DramaSerial[] {
  return unwrapList(serialWireSchema)(raw).map(toSerial);
}

export function parseSerial(raw: unknown): DramaSerial {
  return toSerial(unwrapData(serialWireSchema)(raw));
}

export function parseEpisode(raw: unknown): DramaEpisode {
  return toEpisode(unwrapData(episodeWireSchema)(raw));
}

export function compactCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  if (n < 1_000_000) return `${Math.round(n / 1000)}k`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}m`;
}

export type EpisodeReactionCounts = {
  likesCount: number;
  dislikesCount: number;
  sharesCount: number;
  myReaction: 'like' | 'dislike' | null;
};

const reactionCountsWireSchema = z.object({
  likes_count: z.number(),
  dislikes_count: z.number(),
  shares_count: z.number(),
  my_reaction: z.enum(['like', 'dislike']).nullable().optional(),
});

export function parseReactionCounts(raw: unknown): EpisodeReactionCounts {
  const data = unwrapData(reactionCountsWireSchema)(raw);
  return {
    likesCount: data.likes_count,
    dislikesCount: data.dislikes_count,
    sharesCount: data.shares_count,
    myReaction: data.my_reaction === 'like' || data.my_reaction === 'dislike' ? data.my_reaction : null,
  };
}

export function filterSerialsByTitle(items: DramaSerial[], query: string): DramaSerial[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((s) => s.title.toLowerCase().includes(q));
}
