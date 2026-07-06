/**
 * Shared thumbnail dimensions for backoffice uploads (live streams, matches, and future surfaces).
 * Aligned with app card frame `aspect-[360/185]`.
 */
export const THUMBNAIL_WIDTH_PX = 360;
export const THUMBNAIL_HEIGHT_PX = 185;
export const THUMBNAIL_ASPECT_RATIO = '360:185';

/** Short size label for file-upload `recommendedSize`. */
export const THUMBNAIL_RECOMMENDED_SIZE = `${THUMBNAIL_WIDTH_PX}×${THUMBNAIL_HEIGHT_PX} px (${THUMBNAIL_ASPECT_RATIO})`;

/** Build upload helper copy for a thumbnail field on a given surface. */
export function thumbnailUploadHint(surfaceLabel: string): string {
  return `Shown on ${surfaceLabel}. Recommended ${THUMBNAIL_WIDTH_PX}×${THUMBNAIL_HEIGHT_PX} px (aspect ratio ${THUMBNAIL_ASPECT_RATIO}, ~1.95:1). Images are center-cropped to fit.`;
}

/** Live / match stream thumbnail fields (hub + home carousel). */
export const LIVE_STREAM_THUMBNAIL_UPLOAD_HINT = thumbnailUploadHint('the Live hub and Home carousel');
