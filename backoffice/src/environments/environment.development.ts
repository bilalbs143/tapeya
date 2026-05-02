export const environment = {
  production: false,
  /**
   * Base URL for the Laravel API in local/dev.
   * Assuming the Laravel API runs on http://localhost:8000 with the /api prefix.
   */
  apiBaseUrl: 'http://127.0.0.1:8000/api',
  /** Base URL of the React user-facing app (used to generate overlay URLs). */
  appUrl: 'http://localhost:5173',
  /**
   * Laravel Reverb (must match api/.env REVERB_*). Set enabled false to skip Echo.
   */
  reverb: {
    enabled: true,
    /** Must equal `REVERB_APP_KEY` in `api/.env` */
    appKey: 'local-reverb-key',
    wsHost: '127.0.0.1',
    wsPort: 8080,
    wssPort: 8080,
    scheme: 'http' as 'http' | 'https',
  },
} as const;
