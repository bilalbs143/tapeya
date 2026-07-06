import { useEffect } from 'react';

/**
 * Applies document-level classes for mobile/tablet landscape live broadcast:
 *
 * - `live-broadcast-landscape` — hide global navbar/bottom nav, full-viewport main area
 * - `ios-native-stream-underlay` — transparent Capacitor webview (native YouTube video visible below)
 *
 * @param {boolean} isImmersiveLandscape
 * @param {boolean} usesIosNativeUnderlay — true only for iOS native YouTube iframe streams
 */
export function useLiveBroadcastImmersiveDocument(isImmersiveLandscape, usesIosNativeUnderlay = false) {
  useEffect(() => {
    const html = document.documentElement;

    if (isImmersiveLandscape) {
      html.classList.add('live-broadcast-landscape');
    }

    if (usesIosNativeUnderlay) {
      html.classList.add('ios-native-stream-underlay');
    }

    return () => {
      if (isImmersiveLandscape) {
        html.classList.remove('live-broadcast-landscape');
      }
      if (usesIosNativeUnderlay) {
        html.classList.remove('ios-native-stream-underlay');
      }
    };
  }, [isImmersiveLandscape, usesIosNativeUnderlay]);
}
