/** @type {import('@capacitor/cli').CapacitorConfig} */
const config = {
  appId: 'com.tapeya.app',
  appName: 'Tapeya',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Live reload for development (optional)
    // url: 'http://YOUR_IP:5173',
    // cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
    },
  },
  ios: {
    contentInset: 'automatic',
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
