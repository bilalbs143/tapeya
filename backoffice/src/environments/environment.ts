const apiBaseUrl = 'https://dev-api.tapeya.com/api';
const apiOrigin = new URL(apiBaseUrl);
const useTls = apiOrigin.protocol === 'https:';

export const environment = {
  production: true,
  apiBaseUrl,
  /** Consumer app origin (interest forms, etc.). Signed graphics URLs come from the API graphics frontend URL setting. */
  appUrl: 'https://dev.tapeya.com',
  reverb: {
    enabled: true,
    /**
     * Must equal `REVERB_APP_KEY` in `api/.env` for THIS environment's API.
     * If that key is ever rotated away from the shared dev default, update it here too —
     * this is a static Angular build-time value, not read from a runtime env var, so a
     * rotation requires a code change + rebuild of this file specifically.
     */
    appKey: 'local-reverb-key',
    wsHost: apiOrigin.hostname,
    wsPort: useTls ? 443 : 80,
    wssPort: useTls ? 443 : 80,
    scheme: useTls ? ('https' as const) : ('http' as const),
  },
} as const;
