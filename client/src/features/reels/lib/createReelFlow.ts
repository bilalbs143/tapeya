export const CREATE_REEL_STEPS = {
  EMPTY: 1,
  PREVIEW: 2,
  DETAILS: 3,
} as const;

export type CreateReelStep = (typeof CREATE_REEL_STEPS)[keyof typeof CREATE_REEL_STEPS];

export const CREATE_REEL_CAPTION_MAX = 2200;

export type CreateReelLocationState = {
  body?: string;
  caption?: string;
  fromCompose?: boolean;
};

export function settingInt(settings: { key: string; value: string }[], key: string): number {
  const row = settings.find((item) => item.key === key);
  const value = Number(row?.value);
  return Number.isFinite(value) ? value : 0;
}

/** Normalize hashtag tokens for caption / chip label. */
export function formatReelHashtagLabel(hashtags: string): string {
  return hashtags
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => (t.startsWith('#') ? t : `#${t}`))
    .join(' ');
}
