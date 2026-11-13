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
    // launchShowDuration 0: Cap does not own launch splash (Android 12 keep = double splash).
    // Branding is LaunchScreen / solid OS page → SplashBrandOverlay until hideNativeSplash().
    SplashScreen: {
      launchShowDuration: 0,
      // No backgroundColor — Cap would paint one fixed hex and wipe system dark/light.
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
