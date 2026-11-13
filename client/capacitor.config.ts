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
  // Capawesome Firebase Analytics no-IDFA: Podfile
  // `CapacitorFirebaseAnalytics/AnalyticsWithoutAdIdSupport` (CocoaPods — ships dSYMs).
  plugins: {
    // SplashBrandOverlay (full logo + tagline) stays until hideNativeSplash() after auth hydrate.
    // Do not set launchShowDuration to 0 — Cap iOS then skips showOnLaunch.
    // Android: MainActivity dismisses Cap's circular system splash immediately after the overlay
    // is shown (Cap launchAutoHide only starts after first WebView predraw — too late / double splash).
    // launchAutoHide remains a backup if that native dismiss misses.
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 200,
      // No backgroundColor — Cap would paint one fixed hex and wipe system dark/light.
      // Native splash assets already own page bg + mark (iOS colorset / Android values-night).
      androidSplashResourceName: 'splash',
    },
    // WebView box stays fixed; AppShell is `fixed inset-0` + shared `KeyboardInsetPad`.
    // Android also needs MainActivity `adjustNothing` + SystemBars `insetsHandling: disable`
    // (Cap 8 otherwise IME-pads the decor view while JS pads → white gap). Never resizeOnFullScreen.
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
