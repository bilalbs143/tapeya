export const CREATE_REEL_STEPS = {
  EMPTY: 1,
  PREVIEW: 2,
  DETAILS: 3,
} as const;

export type CreateReelStep = (typeof CREATE_REEL_STEPS)[keyof typeof CREATE_REEL_STEPS];

export const CREATE_REEL_CAPTION_MAX = 2200;

/** Empty-step guidance — same tips as legacy upload empty (format / quality / length). */
export const CREATE_REEL_TIPS = [
  { id: 'aspect', label: 'Vertical 9:16 Looks Best', icon: 'aspect' },
  { id: 'quality', label: 'Keep It Clear and Steady', icon: 'quality' },
  { id: 'trim', label: 'Trim to the Best Moments', icon: 'trim' },
] as const;

export type CreateReelTipIcon = (typeof CREATE_REEL_TIPS)[number]['icon'];

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
