/**
 * CDN base for static app assets (images, icons) on CloudFront.
 * Build asset URLs as `${CLOUDFRONT_APP_BASE}/images/...`.
 */
export const CLOUDFRONT_APP_BASE = 'https://d1nmw2vhka3zp0.cloudfront.net/app';

export const MATCH_CENTER_HEADER_MOBILE = `${CLOUDFRONT_APP_BASE}/images/background/match-center-header.png`;
export const MATCH_CENTER_HEADER_DESKTOP = `${CLOUDFRONT_APP_BASE}/images/background/match-center-header-desktop.png`;
export const FIXTURE_BG_IMAGE = `${CLOUDFRONT_APP_BASE}/images/background/fixture-bg.png`;

/** Max upload size for profile pictures (must match backend validation). */
export const MAX_PROFILE_PICTURE_BYTES = 5 * 1024 * 1024;

/** Max upload size for ID documents — image or PDF (must match backend validation). */
export const MAX_ID_DOCUMENT_BYTES = 10 * 1024 * 1024;
