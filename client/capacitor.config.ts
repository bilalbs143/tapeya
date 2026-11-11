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
  // Capawesome Firebase Analytics — SPM symlink + no IDFA (avoids ATT for first-party analytics).
  experimental: {
    ios: {
      spm: {
        swiftToolsVersion: '6.1',
        packageOptions: {
          '@capacitor-firebase/analytics': {
            symlink: true,
          },
        },
        packageTraits: {
          '@capacitor-firebase/analytics': ['AnalyticsWithoutAdIdSupport'],
        },
      },
    },
  },
  plugins: {
    // Native splash stays until hideNativeSplash() after auth hydrate.
    // Do not set launchShowDuration to 0 — Cap iOS then skips showOnLaunch.
    SplashScreen: {
      launchAutoHide: false,
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
