import type { LiveStream } from '../model/schemas';
import { youtubeStreamThumbnail } from './playback';
import { formatVanityViewerCount } from './useVanityViewerCount';

/** Admin / pasted watch URLs stay 16:9 — portrait camera hero is only Go Live without streaming_url. */
export function watchIsUrlStream(stream: Pick<LiveStream, 'streamingUrl'> | null | undefined): boolean {
  return Boolean(stream?.streamingUrl?.trim());
}

export function watchPortraitSelfServeLive(stream: LiveStream | null | undefined): boolean {
  if (!stream) return false;
  return Boolean(
    stream.isSelfServe && stream.status === 'live' && stream.orientation === 'portrait' && !watchIsUrlStream(stream)
  );
}

/** Portrait self-serve camera — stay upright; no Rotate / device landscape. */
export function watchAllowRotate(portraitSelfServeLive: boolean): boolean {
  return !portraitSelfServeLive;
}

export function watchChatLive(status: string | null | undefined): boolean {
  return status === 'live' || status === 'starting';
}

/** Unset `live_chat_enabled` → enabled; only `'0'` disables. */
export function watchLiveChatGloballyEnabled(liveChatEnabledSetting: string | undefined): boolean {
  return liveChatEnabledSetting !== '0';
}

export function watchPosterUrl(stream: LiveStream): string | null {
  return stream.thumbnailUrl || youtubeStreamThumbnail(stream.playback?.embedId ?? stream.embedId);
}

/** Hide `0` until presence is ported — vanity ranges are always ≥1 when active. */
export function watchViewerLabel(presenceEnabled: boolean, viewerCount: number | null | undefined): string | null {
  if (!presenceEnabled || viewerCount == null || viewerCount <= 0) return null;
  return formatVanityViewerCount(viewerCount);
}
