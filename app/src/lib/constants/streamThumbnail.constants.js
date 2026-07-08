/**
 * Live stream thumbnail dimensions — aligned with backoffice `thumbnail.constants.ts`
 * and hub card frame `LIVE_STREAM_THUMBNAIL_ASPECT_CLASS`.
 *
 * Aspect classes must be full literal strings (not template-built) so Tailwind v4's
 * content scanner picks them up. Absolute-positioned thumb images collapse to 0 height
 * without the generated aspect-ratio rule.
 */
export const THUMBNAIL_WIDTH_PX = 360;
export const THUMBNAIL_HEIGHT_PX = 185;
export const THUMBNAIL_ASPECT_RATIO = '360:185';

/** Short size label for file-upload hints. */
export const THUMBNAIL_RECOMMENDED_SIZE = `${THUMBNAIL_WIDTH_PX}×${THUMBNAIL_HEIGHT_PX} px (${THUMBNAIL_ASPECT_RATIO})`;

/** Go Live form — optional self-serve thumbnail upload. */
export const GO_LIVE_THUMBNAIL_UPLOAD_HINT = `Optional — ${THUMBNAIL_RECOMMENDED_SIZE}`;

/** Tailwind aspect class for Live hub cards (matches admin upload crop). */
export const LIVE_STREAM_THUMBNAIL_ASPECT_CLASS = 'aspect-[360/185]';

/** Home carousel — slightly taller and narrower than hub cards. */
export const LIVE_STREAM_SLIDER_WIDTH_PX = 300;
export const LIVE_STREAM_SLIDER_HEIGHT_PX = 200;
export const LIVE_STREAM_SLIDER_ASPECT_CLASS = 'aspect-[300/200]';
