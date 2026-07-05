export const environment = {
  production: false,
  /**
   * Base URL for the Laravel API in local/dev.
   * Assuming the Laravel API runs on http://localhost:8000 with the /api prefix.
   */
  apiBaseUrl: 'http://127.0.0.1:8000/api',
  /** Consumer app origin (interest forms, etc.). Signed graphics URLs come from the API graphics frontend URL setting. */
  appUrl: 'http://localhost:5173',
  /**
   * Laravel Reverb (must match api/.env REVERB_*). Set enabled false to skip Echo.
   */
  reverb: {
    enabled: true,
    /**
     * Must equal `REVERB_APP_KEY` in `api/.env` for THIS environment's API.
     * If that key is ever rotated away from the shared dev default, update it here too —
     * this is a static Angular build-time value, not read from a runtime env var, so a
     * rotation requires a code change + rebuild of this file specifically.
     */
    appKey: 'local-reverb-key',
    wsHost: '127.0.0.1',
    wsPort: 8080,
    wssPort: 8080,
    scheme: 'http' as 'http' | 'https',
  },
} as const;
