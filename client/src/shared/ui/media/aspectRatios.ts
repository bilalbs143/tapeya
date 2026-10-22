/** JS-readable MediaKind ratios — keep in sync with `@theme` `--aspect-*` and `MediaFrame` classes. */
export const MEDIA_ASPECT = {
  highlight: 16 / 9,
  tournamentCover: 16 / 9,
  shopProduct: 1,
  reelPoster: 9 / 16,
  showPoster: 2 / 3,
  postImage: 4 / 3,
  heroBanner: 21 / 9,
  avatar: 1,
} as const;

export type MediaKind = keyof typeof MEDIA_ASPECT;
