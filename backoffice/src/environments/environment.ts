const apiBaseUrl = 'https://api.tapeya.com/api';
const apiOrigin = new URL(apiBaseUrl);
const useTls = apiOrigin.protocol === 'https:';

export const environment = {
  production: true,
  apiBaseUrl,
  reverb: {
    enabled: true,
    /** Must equal `REVERB_APP_KEY` in `api/.env` */
    appKey: 'local-reverb-key',
    wsHost: apiOrigin.hostname,
    wsPort: useTls ? 443 : 80,
    wssPort: useTls ? 443 : 80,
    scheme: useTls ? ('https' as const) : ('http' as const),
  },
} as const;
