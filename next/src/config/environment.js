// Environment configuration
const environment = {
  development: {
    API_BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      'https://api.mponusa188.com/api/v1',
    PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY || '2cf18b53197fc0f8f10c',
    PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap1',
  },
  production: {
    API_BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      'https://api.mponusa188.com/api/v1',
    PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY || '2cf18b53197fc0f8f10c',
    PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap1',
  },
  staging: {
    API_BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      'https://api.mponusa188.com/api/v1',
    PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY || '2cf18b53197fc0f8f10c',
    PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap1',
  },
};

// Get current environment
const getCurrentEnvironment = () => {
  if (typeof window !== 'undefined') {
    // Client-side: check for environment variable or default to development
    return process.env.NEXT_PUBLIC_ENV || 'development';
  }
  // Server-side: check for environment variable or default to development
  return process.env.NODE_ENV || 'development';
};

// Export current environment config
export const config =
  environment[getCurrentEnvironment()] || environment.development;

// Export individual values for convenience
export const API_BASE_URL = config.API_BASE_URL;
export const PUSHER_KEY = config.PUSHER_KEY;
export const PUSHER_CLUSTER = config.PUSHER_CLUSTER;

// Export all environments for testing or other purposes
export const environments = environment;
