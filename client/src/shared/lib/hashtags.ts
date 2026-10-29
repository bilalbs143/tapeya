/** Normalize hashtag tokens for chip labels / submit merge. */
export function formatHashtagLabel(hashtags: string): string {
  return hashtags
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => (t.startsWith('#') ? t : `#${t}`))
    .join(' ');
}

/** Merge caption + hashtag tokens for create post / create reel submit. */
export function mergeCaptionWithHashtags(caption: string, hashtags: string): string {
  const base = caption.trim();
  const tags = formatHashtagLabel(hashtags);
  if (!tags) return base;
  if (!base) return tags;
  return `${base} ${tags}`;
}
