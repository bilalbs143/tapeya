export const environment = {
  production: true,
  /**
   * Base URL for the Laravel API in production.
   * Adjust this to your real backend URL (without trailing slash).
   * For example: 'https://api.tapeya.com/api'.
   */
  apiBaseUrl: 'http://127.0.0.1:8000/api',
  /** Enable after configuring Reverb on the API and TLS (wss) as needed. */
  reverb: {
    enabled: true,
    /** Must equal `REVERB_APP_KEY` in `api/.env` */
    appKey: 'local-reverb-key',
    wsHost: '127.0.0.1',
    wsPort: 8080,
    wssPort: 8080,
    scheme: 'http' as const,
  },
} as const;
