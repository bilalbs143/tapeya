/**
 * Apply public CDN base from system settings before the app module tree loads.
 */

import { baseUrl } from '@/lib/apiOrigin';
import { setCdnPublicBaseUrl } from '@/lib/constants/assets';
import { mapSystemSettingsByKey } from '@/lib/utils/settingsUtils';

export async function bootstrapCdnFromPublicSettings() {
  try {
    const response = await fetch(`${baseUrl}/system-settings`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return;
    const json = await response.json();
    const rows = json?.data ?? [];
    const map = mapSystemSettingsByKey(rows);
    setCdnPublicBaseUrl(map.cdn_public_base_url || '');
  } catch {
    // Keep DEFAULT_* fallbacks in assets.js
  }
}
