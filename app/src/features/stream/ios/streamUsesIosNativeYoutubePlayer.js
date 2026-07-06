import { resolveYoutubeEmbed, usesIosNativeStreamPlayer } from '@/lib/utils/liveStreamUtils';

/**
 * True only when this stream mounts {@link IosNativeStreamOverlay} (iOS + iframe YouTube via proxy).
 * HLS and other modes must not use landscape underlay / transparent chrome.
 *
 * @param {{ playback?: { mode?: string, embed_url?: string|null, embed_id?: string|null } }|null|undefined} stream
 */
export function streamUsesIosNativeYoutubePlayer(stream) {
  if (!stream?.playback || stream.playback.mode !== 'iframe') {
    return false;
  }

  if (!usesIosNativeStreamPlayer()) {
    return false;
  }

  const { iframeSrc, usesProxy } = resolveYoutubeEmbed(stream.playback.embed_url, stream.playback.embed_id);

  return usesProxy && Boolean(iframeSrc);
}
