import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tapbytapeya.app',
  appName: 'Tapeya',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'never',
  },
  plugins: {
    // Native splash stays until hideNativeSplash() after auth hydrate.
    // Do not set launchShowDuration to 0 — Cap iOS then skips showOnLaunch.
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#000000ff',
    },
    // WebView stays full height; JS lifts chrome via `--keyboard-inset` (PageDock / sheets).
    // Android also needs MainActivity `windowSoftInputMode=adjustNothing` — without it the
    // Activity still adjustResize's, CSS viewport stays full-screen, and a white gap appears
    // above the keyboard. Never set `resizeOnFullScreen: true` (forces native resize).
    Keyboard: {
      resize: 'none',
    },
  },
  // Do not enable android.allowMixedContent — cleartext / mixed HTTP is a
  // store-policy and security risk. Point native builds at HTTPS APIs only.
};

export default config;
