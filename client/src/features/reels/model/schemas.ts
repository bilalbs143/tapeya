import { z } from 'zod';

export const REEL_TABS = ['explore', 'following', 'mine', 'saved'] as const;
export type ReelTab = (typeof REEL_TABS)[number];

export const REEL_TAB_META: { id: ReelTab; label: string; requiresAuth: boolean }[] = [
  { id: 'explore', label: 'Explore', requiresAuth: false },
  { id: 'following', label: 'Following', requiresAuth: true },
  { id: 'mine', label: 'My Videos', requiresAuth: true },
  { id: 'saved', label: 'Saved', requiresAuth: true },
];

export const REEL_TAB_PATH: Record<ReelTab, string> = {
  explore: '/reels/feed',
  following: '/reels/feed/following',
  mine: '/reels/mine',
  saved: '/reels/saved',
};

/**
 * Wire shape aligned with `app/` `normalizeReel` / Reel feed payloads.
 */
export const reelWireSchema = z.object({
  id: z.number(),
  caption: z.string().nullable().optional(),
  status: z.string().optional(),
  duration_ms: z.number().nullable().optional(),
  cover_url: z.string().nullable().optional(),
  playback: z
    .object({
      type: z.string().optional(),
      url: z.string().nullable().optional(),
      poster_url: z.string().nullable().optional(),
      hls_url: z.string().nullable().optional(),
      is_processed: z.boolean().optional(),
    })
    .nullable()
    .optional(),
  counts: z
    .object({
      likes: z.number().optional(),
      comments: z.number().optional(),
      views: z.number().optional(),
      saves: z.number().optional(),
      shares: z.number().optional(),
    })
    .passthrough()
    .optional(),
  viewer: z
    .object({
      liked: z.boolean().optional(),
      saved: z.boolean().optional(),
      following_creator: z.boolean().optional(),
    })
    .optional(),
  creator: z
    .object({
      id: z.number().nullable().optional(),
      name: z.string().nullable().optional(),
      nickname: z.string().nullable().optional(),
      avatar_url: z.string().nullable().optional(),
      is_official: z.boolean().optional(),
    })
    .optional(),
  hashtags: z.array(z.string()).optional(),
  /** Optional match deep-link — absent on PostResource today. Parsed when present so the caption chip can light up without a schema break. */
  match: z
    .object({
      id: z.number(),
      label: z.string().nullable().optional(),
      home_short: z.string().nullable().optional(),
      away_short: z.string().nullable().optional(),
      home_score: z.string().nullable().optional(),
      away_score: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});
export type ReelWire = z.infer<typeof reelWireSchema>;

export type ReelAuthor = {
  id: number | null;
  name: string;
  nickname: string | null;
  handle: string;
  avatarUrl: string | null;
  following: boolean;
  isOfficial: boolean;
};

export type ReelMatch = {
  id: number;
  label: string | null;
  homeShort: string | null;
  awayShort: string | null;
  homeScore: string | null;
  awayScore: string | null;
};

export type ReelPlayback = {
  type: string | null;
  url: string | null;
  hlsUrl: string | null;
};

export type Reel = {
  id: number;
  caption: string;
  status: string;
  durationMs: number | null;
  posterUrl: string | null;
  /** Best-effort single URL for share/debug — prefer `playback` for the player. */
  videoUrl: string | null;
  playback: ReelPlayback;
  likes: number;
  comments: number;
  views: number;
  saves: number;
  shares: number;
  liked: boolean;
  saved: boolean;
  author: ReelAuthor;
  hashtags: string[];
  match: ReelMatch | null;
};

export function formatDurationMs(ms: number | null | undefined): string {
  if (ms == null || ms <= 0) return '0:24';
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function matchChipLabel(match: ReelMatch): string {
  if (match.label?.trim()) return match.label.trim();
  const home = match.homeShort?.trim() || 'Home';
  const away = match.awayShort?.trim() || 'Away';
  if (match.homeScore != null || match.awayScore != null) {
    return `${home} ${match.homeScore ?? '—'} · ${away} ${match.awayScore ?? '—'}`;
  }
  return `${home} vs ${away}`;
}

export function toDomain(wire: ReelWire): Reel {
  const creator = wire.creator ?? {};
  const playback = wire.playback ?? {};
  const counts = wire.counts ?? {};
  const viewer = wire.viewer ?? {};
  const nickname = creator.nickname ?? null;
  const name = creator.name ?? nickname ?? 'Player';
  const hlsUrl = playback.hls_url ?? null;
  const progressiveUrl = playback.url ?? null;
  const matchWire = wire.match ?? null;

  return {
    id: wire.id,
    caption: wire.caption ?? '',
    status: wire.status ?? 'ready',
    durationMs: wire.duration_ms ?? null,
    posterUrl: playback.poster_url ?? wire.cover_url ?? null,
    videoUrl: hlsUrl || progressiveUrl || null,
    playback: {
      type: playback.type ?? null,
      url: progressiveUrl,
      hlsUrl,
    },
    likes: counts.likes ?? 0,
    comments: counts.comments ?? 0,
    views: counts.views ?? 0,
    saves: counts.saves ?? 0,
    shares: counts.shares ?? 0,
    liked: Boolean(viewer.liked),
    saved: Boolean(viewer.saved),
    author: {
      id: creator.id ?? null,
      name,
      nickname,
      handle: nickname ? `@${nickname}` : name,
      avatarUrl: creator.avatar_url ?? null,
      following: Boolean(viewer.following_creator),
      isOfficial: Boolean(creator.is_official),
    },
    hashtags: Array.isArray(wire.hashtags) ? wire.hashtags : [],
    match: matchWire
      ? {
          id: matchWire.id,
          label: matchWire.label ?? null,
          homeShort: matchWire.home_short ?? null,
          awayShort: matchWire.away_short ?? null,
          homeScore: matchWire.home_score ?? null,
          awayScore: matchWire.away_score ?? null,
        }
      : null,
  };
}
