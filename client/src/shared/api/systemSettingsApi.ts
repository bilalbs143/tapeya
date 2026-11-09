import { z } from 'zod';

import { baseApi } from '@/shared/api/baseApi';
import { unwrapData } from '@/shared/api/unwrap';
import { setCdnPublicBaseUrl } from '@/shared/lib/cdn';

const rowSchema = z.object({
  key: z.union([z.string(), z.number()]),
  value: z.unknown(),
});

export type SystemSettingRow = { key: string; value: string };

/** Public `GET /system-settings` (OTP allowlist, upload limits, store versions, CDN). */
export const systemSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- RTK Query no-arg query
    getPublicSystemSettings: builder.query<SystemSettingRow[], void>({
      query: () => '/system-settings',
      transformResponse: (raw) => {
        const rows = unwrapData(z.array(rowSchema))(raw).map((row) => ({
          key: String(row.key),
          value: String(row.value ?? ''),
        }));
        // Keep CDN next to the settings source — no AppProviders wrapper needed.
        const cdn = rows.find((row) => row.key === 'cdn_public_base_url')?.value;
        if (cdn) setCdnPublicBaseUrl(cdn);
        return rows;
      },
    }),
  }),
});

export const { useGetPublicSystemSettingsQuery } = systemSettingsApi;

export function settingsByKey(rows: SystemSettingRow[] | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const row of rows ?? []) out[row.key] = row.value;
  return out;
}
