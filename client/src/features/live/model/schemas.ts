import { z } from 'zod';

export const liveStreamStatusSchema = z.enum(['idle', 'starting', 'live', 'ended', 'error']);
export type LiveStreamStatus = z.infer<typeof liveStreamStatusSchema>;

/** API may send bool or 0/1 — keep official hosts visible on live list / watch. */
const officialFlagSchema = z.preprocess((value) => {
  if (value === true || value === 1 || value === '1') return true;
  if (value === false || value === 0 || value === '0') return false;
  return undefined;
}, z.boolean().optional());

const broadcasterWireSchema = z.object({
  id: z.number(),
  name: z.string().nullable().optional(),
  nickname: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  is_official: officialFlagSchema,
});

const playbackWireSchema = z
  .object({
    mode: z.enum(['iframe', 'hls']),
    embed_id: z.string().nullable().optional(),
    embed_url: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
  })
  .passthrough();

export const liveStreamWireSchema = z
  .object({
    id: z.number(),
    match_id: z.number().nullable().optional(),
    tournament_id: z.number().nullable().optional(),
    is_self_serve: z.boolean().optional(),
    orientation: z.string().optional(),
    title: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    streaming_url: z.string().nullable().optional(),
    thumbnail_url: z.string().nullable().optional(),
    broadcaster: broadcasterWireSchema.nullable().optional(),
    stream: z
      .object({
        status: liveStreamStatusSchema.or(z.string()),
        provider: z.string().nullable().optional(),
        embed_id: z.string().nullable().optional(),
        playback: playbackWireSchema.nullable().optional(),
        started_at: z.string().nullable().optional(),
        ended_at: z.string().nullable().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export type LiveStreamWire = z.infer<typeof liveStreamWireSchema>;

export type LivePlayback = {
  mode: 'iframe' | 'hls';
  embedId: string | null;
  embedUrl: string | null;
  url: string | null;
};

export type LiveBroadcaster = {
  id: number;
  name: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  isOfficial: boolean;
};

/** Display host — broadcaster name or Tapeya platform fallback. */
export type LiveHost = {
  /** Broadcaster id when not the Tapeya platform host — used for profile links. */
  id: number | null;
  name: string;
  nickname: string | null;
  avatarUrl: string | null;
  isOfficial: boolean;
  isPlatform: boolean;
};

export type LiveStream = {
  id: number;
  matchId: number | null;
  tournamentId: number | null;
  isSelfServe: boolean;
  orientation: string;
  title: string;
  description: string;
  streamingUrl: string | null;
  thumbnailUrl: string | null;
  broadcaster: LiveBroadcaster | null;
  host: LiveHost;
  status: LiveStreamStatus | string;
  provider: string | null;
  embedId: string | null;
  playback: LivePlayback | null;
  startedAt: string | null;
  endedAt: string | null;
  /** Card subtitle — description · hosted by @handle */
  subtitle: string;
  /** @deprecated Prefer `host.name` — kept for ScreenBar / older callers. */
  hostLabel: string;
};

export const PLATFORM_HOST_NAME = 'Tapeya';
export const PLATFORM_HOST_AVATAR = 'https://cdn.tapeya.com/app/images/logos/tapya-t.svg';

function hostCredit(broadcaster: LiveBroadcaster | null): string | null {
  if (!broadcaster) return null;
  const handle = broadcaster.nickname?.trim() || broadcaster.name?.trim();
  return handle ? `Hosted by @${handle}` : null;
}

function cardSubtitle(title: string, description: string, broadcaster: LiveBroadcaster | null, status: string): string {
  const credit = hostCredit(broadcaster);
  if (description && credit) return `${description} · ${credit}`;
  if (description) return description;
  if (credit) return credit;
  if (status === 'live') return `${title} · Live Now`;
  return '';
}

function toBroadcaster(wire: z.infer<typeof broadcasterWireSchema> | null | undefined): LiveBroadcaster | null {
  if (!wire) return null;
  return {
    id: wire.id,
    name: wire.name ?? null,
    nickname: wire.nickname ?? null,
    avatarUrl: wire.avatar_url ?? null,
    isOfficial: Boolean(wire.is_official),
  };
}

/** Creator shown on hub cards + Watch — never nickname; unnamed broadcaster → Tapeya platform. */
export function toLiveHost(broadcaster: LiveBroadcaster | null): LiveHost {
  const name = broadcaster?.name?.trim();
  if (!broadcaster || !name) {
    return {
      id: null,
      name: PLATFORM_HOST_NAME,
      nickname: null,
      avatarUrl: PLATFORM_HOST_AVATAR,
      isOfficial: true,
      isPlatform: true,
    };
  }
  return {
    id: broadcaster.id,
    name,
    nickname: broadcaster.nickname?.trim() || null,
    avatarUrl: broadcaster.avatarUrl?.trim() || null,
    isOfficial: broadcaster.isOfficial,
    isPlatform: false,
  };
}

function toPlayback(wire: z.infer<typeof playbackWireSchema> | null | undefined): LivePlayback | null {
  if (!wire?.mode) return null;
  return {
    mode: wire.mode,
    embedId: wire.embed_id?.trim() || null,
    embedUrl: wire.embed_url?.trim() || null,
    url: wire.url?.trim() || null,
  };
}

export function toLiveStream(wire: LiveStreamWire): LiveStream {
  const broadcaster = toBroadcaster(wire.broadcaster ?? null);
  const host = toLiveHost(broadcaster);
  const title = wire.title?.trim() || 'Live Stream';
  const description = wire.description?.trim() || '';
  const status = wire.stream?.status ?? 'idle';

  return {
    id: wire.id,
    matchId: wire.match_id ?? null,
    tournamentId: wire.tournament_id ?? null,
    isSelfServe: Boolean(wire.is_self_serve ?? wire.broadcaster),
    orientation: typeof wire.orientation === 'string' && wire.orientation ? wire.orientation : 'portrait',
    title,
    description,
    streamingUrl: wire.streaming_url?.trim() || null,
    thumbnailUrl: wire.thumbnail_url?.trim() || null,
    broadcaster,
    host,
    status,
    provider: wire.stream?.provider ?? null,
    embedId: wire.stream?.embed_id?.trim() || null,
    playback: toPlayback(wire.stream?.playback ?? null),
    startedAt: wire.stream?.started_at ?? null,
    endedAt: wire.stream?.ended_at ?? null,
    subtitle: cardSubtitle(title, description, broadcaster, String(status)),
    hostLabel: host.name,
  };
}

export const liveCommentWireSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
  text: z.string(),
  sent_at: z.string().optional(),
  avatar_url: z.string().nullable().optional(),
});

export type LiveComment = {
  id: string;
  /** Nickname (display handle). */
  name: string;
  text: string;
  sentAt: string | null;
  avatarUrl: string | null;
};

export function toLiveComment(wire: z.infer<typeof liveCommentWireSchema>): LiveComment {
  return {
    id: String(wire.id),
    name: wire.name,
    text: wire.text,
    sentAt: wire.sent_at ?? null,
    avatarUrl: wire.avatar_url?.trim() || null,
  };
}

export const createBroadcastResultWireSchema = z.object({
  stream_id: z.number(),
  rtmp_url: z.string().optional(),
  stream_key: z.string().optional(),
  orientation: z.string().optional(),
});

export type CreateBroadcastResult = {
  streamId: number;
  rtmpUrl: string | null;
  streamKey: string | null;
  orientation: string;
};

export function toCreateBroadcastResult(wire: z.infer<typeof createBroadcastResultWireSchema>): CreateBroadcastResult {
  return {
    streamId: wire.stream_id,
    rtmpUrl: wire.rtmp_url ?? null,
    streamKey: wire.stream_key ?? null,
    orientation: wire.orientation ?? 'portrait',
  };
}

export const ownerBroadcastWireSchema = z.object({
  stream_id: z.number(),
  rtmp_url: z.string().nullable().optional(),
  stream_key: z.string().nullable().optional(),
  status: liveStreamStatusSchema.or(z.string()),
  orientation: z.string().optional(),
});

export type OwnerBroadcast = {
  streamId: number;
  rtmpUrl: string | null;
  streamKey: string | null;
  status: string;
  orientation: string;
};

export function toOwnerBroadcast(wire: z.infer<typeof ownerBroadcastWireSchema>): OwnerBroadcast {
  return {
    streamId: wire.stream_id,
    rtmpUrl: wire.rtmp_url ?? null,
    streamKey: wire.stream_key ?? null,
    status: String(wire.status),
    orientation: wire.orientation ?? 'portrait',
  };
}

export const acceptTermsResultWireSchema = z.object({
  broadcast_terms_accepted_at: z.string().nullable().optional(),
});
