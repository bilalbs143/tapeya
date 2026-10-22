import { resolveYoutubeEmbed } from '@/features/live';

/** Highlight playback URL (controls on; HTTPS proxy on native). */

export function highlightYoutubeEmbed(videoUrl: string | null): string | null {
  if (!videoUrl?.trim()) return null;
  return resolveYoutubeEmbed(videoUrl, null, { showControls: true });
}
