import type { Highlight } from '../model/schemas';
import { compactCount } from '../model/schemas';
import { highlightYoutubeEmbed } from './youtube';

export function highlightHasVideo(clip: Pick<Highlight, 'videoUrl'>): boolean {
  return Boolean(clip.videoUrl);
}

export function highlightYoutubeSrc(clip: Pick<Highlight, 'videoSource' | 'videoUrl'>): string | null {
  return clip.videoSource === 'youtube' ? highlightYoutubeEmbed(clip.videoUrl) : null;
}

export function highlightIsUpload(clip: Pick<Highlight, 'videoSource' | 'videoUrl'>): boolean {
  return clip.videoSource === 'upload' && Boolean(clip.videoUrl);
}

export function highlightShareActionLabel(shares: number): string {
  return shares > 0 ? `Share · ${compactCount(shares)}` : 'Share';
}
