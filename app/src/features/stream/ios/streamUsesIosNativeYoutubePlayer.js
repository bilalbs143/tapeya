import { resolveYoutubeEmbed, usesIosNativeStreamPlayer } from '@/lib/utils/liveStreamUtils';

/**
 * True when this stream mounts {@link IosNativeStreamOverlay} (iOS + iframe YouTube via proxy).
 * Gates underlay document transparency and native chrome wiring.
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
