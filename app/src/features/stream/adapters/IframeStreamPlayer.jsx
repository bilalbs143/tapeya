import { buildYoutubeEmbedUrl } from '@/lib/utils/youtubeEmbedUtils';

export function IframeStreamPlayer({ playback, className = '', fill = false }) {
  const boxClass = fill ? 'relative h-full w-full bg-black' : 'relative w-full aspect-video bg-black';
  const src = buildYoutubeEmbedUrl(playback.embed_url, playback.embed_id);

  if (!src) {
    return null;
  }

  return (
    <div className={`${boxClass} ${className}`}>
      <iframe
        className="absolute inset-0 h-full w-full border-0"
        src={src}
        title="Live Match"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
