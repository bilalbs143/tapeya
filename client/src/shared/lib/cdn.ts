/**
 * Public CDN origin for static raster assets (`/app/...`).
 * Matches legacy `app/src/lib/constants/assets.js`:
 * hardcoded fallback, then system setting `cdn_public_base_url` at runtime.
 * Uploaded user media already comes as absolute URLs from the API.
 */

/** Fallback when settings have not loaded / are unreachable. */
export const DEFAULT_CDN_PUBLIC_BASE = 'https://cdn.tapeya.com';

let cdnPublicBase = DEFAULT_CDN_PUBLIC_BASE;

export function normalizeCdnPublicBase(url: string | null | undefined): string {
  if (url == null || typeof url !== 'string') return '';
  let trimmed = url.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
}

/** Apply CDN origin from system settings (or clear → fallback). */
export function setCdnPublicBaseUrl(cdnPublicBaseUrl: string | null | undefined): string {
  const normalized = normalizeCdnPublicBase(cdnPublicBaseUrl);
  cdnPublicBase = normalized || DEFAULT_CDN_PUBLIC_BASE;
  return cdnPublicBase;
}

export function getCdnPublicBase(): string {
  return cdnPublicBase;
}

/** CDN URLs for raster assets only — not bundled UI icons. §12.1 */
export function cdnUrl(path: string): string {
  const base = cdnPublicBase.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
