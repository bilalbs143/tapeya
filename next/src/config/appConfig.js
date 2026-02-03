/**
 * Centralized App Configuration
 * This file contains all app metadata that is used across different platforms
 * Update this file to change app name, icon, and other metadata globally
 */

export const appConfig = {
  // Basic App Information
  appName: 'User13',
  appShortName: 'User13',
  appDescription:
    'Experience the ultimate online casino gaming with live dealers and exclusive bonuses! Purple & Orange Gaming Theme',

  // App Identifiers
  appId: 'com.artchip.app',
  packageName: 'com.artchip.app',
  customUrlScheme: 'com.artchip.app',

  // Version Information
  versionName: '1.4',
  versionCode: 5,

  // Visual Configuration
  icon: {
    // Local asset path (relative to project root)
    source: 'assets/user13.png',
    backgroundColor: '#FFFFFF',
    // S3 URL for web manifest (if different from local)
    webUrl: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/user13.png',
  },

  // Theme Colors
  theme: {
    primary: '#5343b1',
    background: '#1c1d40',
    statusBarBackground: '#141943',
  },

  // Platform-specific configurations
  platforms: {
    android: {
      webContentsDebuggingEnabled: true,
      androidScheme: 'https',
      cleartext: true,
    },
    web: {
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      categories: ['games', 'entertainment', 'casino'],
      dir: 'ltr',
    },
  },

  // Capacitor Plugin Configurations
  plugins: {
    Browser: {
      androidCustomTabsService: 'com.android.chrome',
      androidShowTitle: true,
      androidShowURL: true,
      androidToolbarColor: '#ffffff',
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#141943',
      overlaysWebView: false,
    },
  },
};

export default appConfig;
