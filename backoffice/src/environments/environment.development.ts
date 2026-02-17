export const environment = {
  production: false,
  /**
   * Base URL for the Laravel API in local/dev.
   * Assuming the Laravel API runs on http://localhost:8000 with the /api prefix.
   */
  apiBaseUrl: 'http://127.0.0.1:8000/api',
} as const;
