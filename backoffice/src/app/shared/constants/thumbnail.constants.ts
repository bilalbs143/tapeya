/**
 * Upload aspect hints aligned with the rewrite client (`MediaFrame` / display frames).
 * Aspect only — no exact pixel sizes; the client scales by width inside a fixed ratio.
 *
 * Keep labels in sync with `client/src/shared/ui/media/aspectRatios.ts` and live hub
 * `aspect-video` (16:9). Home hero currently renders as 2:1 (`HomeHeroCarousel`).
 */
export const MEDIA_ASPECT = {
  highlight: '16:9',
  tournamentCover: '16:9',
  shopProduct: '3:4',
  showPoster: '2:3',
  episodePoster: '16:9',
  heroBanner: '2:1',
  liveStreamThumbnail: '16:9',
  logo: '1:1',
} as const;

/** @deprecated Prefer `MEDIA_ASPECT.liveStreamThumbnail` — kept for older imports. */
export const THUMBNAIL_ASPECT_RATIO = MEDIA_ASPECT.liveStreamThumbnail;

/** Short aspect label for file-upload `recommendedSize`. */
export const THUMBNAIL_RECOMMENDED_SIZE = `${MEDIA_ASPECT.liveStreamThumbnail} aspect ratio`;

/** Build upload helper copy for a thumbnail field on a given surface. */
export function thumbnailUploadHint(surfaceLabel: string, aspect: string = MEDIA_ASPECT.liveStreamThumbnail): string {
  return `Shown on ${surfaceLabel}. Use ${aspect} aspect ratio. Images are center-cropped to fit.`;
}

/** Live / match stream thumbnail fields (hub + home carousel). */
export const LIVE_STREAM_THUMBNAIL_UPLOAD_HINT = thumbnailUploadHint(
  'the Live hub and Home carousel',
  MEDIA_ASPECT.liveStreamThumbnail
);

export const HERO_MOBILE_UPLOAD_HINT = 'Default for all screens. Use 2:1 aspect ratio (same image works on mobile and desktop).';

export const HERO_DESKTOP_UPLOAD_HINT = 'Optional override for large screens. Use 2:1 aspect ratio.';

export const TOURNAMENT_DISPLAY_IMAGE_UPLOAD_HINT = 'Shown on the tournament listing card. Use 16:9 aspect ratio.';

export const TOURNAMENT_COVER_IMAGE_UPLOAD_HINT = 'Full-width banner on the tournament detail page. Use 16:9 aspect ratio.';

export const HIGHLIGHT_THUMBNAIL_UPLOAD_HINT = 'Cover image shown on the highlights list and detail page. Use 16:9 aspect ratio.';

export const DRAMA_SERIAL_POSTER_UPLOAD_HINT = 'Series cover. Use 2:3 aspect ratio.';

export const DRAMA_EPISODE_THUMBNAIL_UPLOAD_HINT = 'Episode poster. Use 16:9 aspect ratio.';

/** Appended via file-upload `recommendedSize` (keeps format + max size line). */
export const SHOP_PRODUCT_IMAGES_ASPECT = `${MEDIA_ASPECT.shopProduct} aspect ratio`;
export const SHOP_BRAND_LOGO_ASPECT = `${MEDIA_ASPECT.logo} aspect ratio`;
export const SHOP_CATEGORY_IMAGE_ASPECT = `${MEDIA_ASPECT.logo} aspect ratio`;
export const TEAM_LOGO_ASPECT = `${MEDIA_ASPECT.logo} aspect ratio`;
export const CAMPAIGN_LOGO_ASPECT = `${MEDIA_ASPECT.logo} aspect ratio`;
