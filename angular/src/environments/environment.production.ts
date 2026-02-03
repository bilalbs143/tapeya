const REMOTE_URL = location.hostname;
const BASE_URL = 'http://127.0.0.1:8000/api/v1/';

export const environment = {
  PRODUCTION: true,
  APP_URL: REMOTE_URL,
  API_URL: BASE_URL,
  SNACKBAR_MESSAGE_DURATION: 5000,
  PUSHER_APP_KEY: `2cf18b53197fc0f8f10c`,
  PUSHER_CLUSTER: `ap1`,
  PUSHER_AUTH_ENDPOINT: `${BASE_URL}broadcasting/auth`,

  // Performance optimizations
  ENABLE_LOGGING: false,
  ENABLE_DEBUG: false,
  ENABLE_PERFORMANCE_MONITORING: true,
  CACHE_TTL: 300000, // 5 minutes
  API_TIMEOUT: 30000, // 30 seconds

  // Feature flags for production
  ENABLE_ANALYTICS: true,
  ENABLE_ERROR_REPORTING: true,
  ENABLE_PERFORMANCE_METRICS: true,
};
