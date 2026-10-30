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
    // One keyboard contract on both platforms: WebView stays full height; JS lifts
    // chrome via `--keyboard-inset` (PageDock / sheets / StickyActionBar).
    //
    // iOS: `resize: 'none'` is required (this option is iOS-only in @capacitor/keyboard).
    // Android: `resize` is ignored. Pair with:
    //   1. MainActivity `windowSoftInputMode=adjustNothing` (Activity must not shrink)
    //   2. SystemBars `insetsHandling: 'disable'` — Cap 8 otherwise pads the decor view
    //      by IME height (shows as a white band) while JS also pads → double lift.
    // Never set `Keyboard.resizeOnFullScreen: true`.
    Keyboard: {
      resize: 'none',
    },
    SystemBars: {
      insetsHandling: 'disable',
    },
  },
  // Do not enable android.allowMixedContent — cleartext / mixed HTTP is a
  // store-policy and security risk. Point native builds at HTTPS APIs only.
};

export default config;
