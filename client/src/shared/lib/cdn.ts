import { env } from '@/shared/config/env';

/** CDN URLs for raster assets only — not bundled UI icons. §12.1 */
export function cdnUrl(path: string): string {
  const base = env.VITE_CDN_BASE.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
