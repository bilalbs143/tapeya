import { z } from 'zod';

import type { PostBackgroundId } from '../lib/composeBackgrounds';
import { isPostBackgroundId } from '../lib/composeBackgrounds';

/** Wire `type` → UI `kind`. */
export const postTypeWireSchema = z.enum(['text', 'image', 'video', 'repost']);
export type PostTypeWire = z.infer<typeof postTypeWireSchema>;

export type PostKind = 'text' | 'photos' | 'video' | 'repost';

const creatorWireSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  nickname: z.string().nullable(),
  avatar_url: z.string().nullable(),
  is_official: z.boolean().optional(),
});

const viewerWireSchema = z.object({
  liked: z.boolean(),
  saved: z.boolean(),
  following_creator: z.boolean().optional(),
});

const countsWireSchema = z.object({
  likes: z.number(),
  comments: z.number(),
  views: z.number().optional(),
  saves: z.number().optional(),
  shares: z.number(),
  reposts: z.number(),
});

const mediaWireSchema = z.object({
  id: z.number(),
  kind: z.string(),
  url: z.string().nullable(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  sort_order: z.number().optional(),
});

const playbackWireSchema = z
  .object({
    type: z.string().optional(),
    url: z.string().nullable().optional(),
    poster_url: z.string().nullable().optional(),
    hls_url: z.string().nullable().optional(),
    is_processed: z.boolean().optional(),
  })
  .nullable()
  .optional();

/** Flat post wire (repost_of nested as unknown and narrowed in toDomain). */
export const postWireSchema = z.object({
  id: z.number(),
  type: postTypeWireSchema,
  caption: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  body: z.string().nullable().optional(),
  background_id: z.string().nullable().optional(),
  status: z.string().optional(),
  visibility: z.string().optional(),
  duration_ms: z.number().nullable().optional(),
  cover_url: z.string().nullable().optional(),
  media: z.array(mediaWireSchema).optional(),
  playback: playbackWireSchema,
  repost_of: z.unknown().nullable().optional(),
  counts: countsWireSchema,
  viewer: viewerWireSchema,
  creator: creatorWireSchema.optional(),
  hashtags: z.array(z.string()).optional(),
  published_at: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
});

export type PostWire = z.infer<typeof postWireSchema>;

export type PostAuthor = {
  id: number;
  name: string;
  handle: string;
  nickname: string | null;
  avatarUrl: string | null;
  following: boolean;
  isOfficial: boolean;
};

/** Feed photo — keep wire width/height so the card can render natural aspect (no forced square crop). */
export type PostPhoto = {
  url: string;
  width: number | null;
  height: number | null;
};

export type Post = {
  id: number;
  kind: PostKind;
  author: PostAuthor;
  age: string;
  body: string | null;
  /** API `background_id` (pitch, night, gold, …). `null` = plain text (no box). */
  background: PostBackgroundId | null;
  photos: PostPhoto[];
  poster: string | null;
  duration: string | null;
  counts: {
    likes: number;
    comments: number;
    views: number;
    shares: number;
    reposts: number;
  };
  liked: boolean;
  saved: boolean;
  reposter: { name: string } | null;
  original: {
    id: number;
    author: PostAuthor;
    age: string;
    body: string | null;
  } | null;
};

export type FeedTab = 'explore' | 'following' | 'mine' | 'saved';

export const FEED_TAB_PATH: Record<FeedTab, string> = {
  explore: '/feed',
  following: '/feed/following',
  mine: '/feed/mine',
  saved: '/feed/saved',
};

export function formatRelativeAge(iso: string | null | undefined): string {
  if (!iso) return '';
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return '';
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;
  return new Date(then).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatDurationMs(ms: number | null | undefined): string | null {
  if (ms == null || ms <= 0) return null;
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function mapBackground(id: string | null | undefined): Post['background'] {
  return isPostBackgroundId(id) ? id : null;
}

function mapKind(type: PostTypeWire): PostKind {
  if (type === 'image') return 'photos';
  return type;
}

function mapAuthor(creator: z.infer<typeof creatorWireSchema>, following = false): PostAuthor {
  const nickname = creator.nickname?.trim() || null;
  const name = creator.name?.trim() || nickname || 'Player';
  const handle = nickname || `user${creator.id}`;
  return {
    id: creator.id,
    name,
    handle,
    nickname,
    avatarUrl: creator.avatar_url,
    following,
    isOfficial: Boolean(creator.is_official),
  };
}

function parseNestedPost(raw: unknown): PostWire | null {
  if (!raw || typeof raw !== 'object') return null;
  if ('unavailable' in raw && (raw as { unavailable?: boolean }).unavailable) return null;
  const parsed = postWireSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export function toDomain(wire: PostWire): Post {
  const creator = wire.creator ?? {
    id: 0,
    name: 'Unknown',
    nickname: null,
    avatar_url: null,
  };
  const author = mapAuthor(creator, Boolean(wire.viewer.following_creator));
  const body = wire.body ?? wire.caption ?? null;
  // Prefer media[] URLs (full file). cover_url alone is a fallback when media isn't loaded.
  let photos: PostPhoto[] = [];
  if (wire.type === 'image') {
    photos = (wire.media ?? []).flatMap((m) =>
      m.url
        ? [
            {
              url: m.url,
              width: m.width ?? null,
              height: m.height ?? null,
            },
          ]
        : []
    );
    const cover = wire.cover_url?.trim();
    if (photos.length === 0 && cover) {
      photos = [{ url: cover, width: null, height: null }];
    }
  }

  let original: Post['original'] = null;
  let reposter: Post['reposter'] = null;
  if (wire.type === 'repost') {
    const nested = parseNestedPost(wire.repost_of);
    if (nested) {
      const nestedCreator = nested.creator ?? {
        id: 0,
        name: 'Unknown',
        nickname: null,
        avatar_url: null,
      };
      original = {
        id: nested.id,
        author: mapAuthor(nestedCreator),
        age: formatRelativeAge(nested.published_at ?? nested.created_at),
        body: nested.body ?? nested.caption ?? null,
      };
      reposter = { name: author.name };
    }
  }

  return {
    id: wire.id,
    kind: mapKind(wire.type),
    author,
    age: formatRelativeAge(wire.published_at ?? wire.created_at),
    body,
    background: mapBackground(wire.background_id),
    photos,
    poster: wire.playback?.poster_url ?? wire.cover_url ?? null,
    duration: formatDurationMs(wire.duration_ms),
    counts: {
      likes: wire.counts.likes,
      comments: wire.counts.comments,
      views: wire.counts.views ?? 0,
      shares: wire.counts.shares,
      reposts: wire.counts.reposts,
    },
    liked: wire.viewer.liked,
    saved: wire.viewer.saved,
    reposter,
    original,
  };
}

export const reelBandItemWireSchema = z.object({
  id: z.number(),
  cover_url: z.string().nullable().optional(),
  playback: z.object({ poster_url: z.string().nullable().optional() }).nullable().optional(),
  creator: creatorWireSchema.optional(),
  counts: z.object({ views: z.number().optional() }).passthrough().optional(),
});

export type ReelBandItem = {
  id: number;
  poster: string | null;
  name: string;
  nickname: string | null;
};

export function toReelBandItem(wire: z.infer<typeof reelBandItemWireSchema>): ReelBandItem {
  const name = wire.creator?.name?.trim() || 'Reel';
  const nickname = wire.creator?.nickname?.trim() || null;
  return {
    id: wire.id,
    poster: wire.playback?.poster_url ?? wire.cover_url ?? null,
    name,
    nickname,
  };
}
