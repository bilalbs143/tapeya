import { useEffect } from 'react';

import { usesIosNativeStreamPlayer } from '@/lib/utils/liveStreamUtils';

/**
 * Applies document-level classes for mobile/tablet landscape live broadcast:
 *
 * - `live-broadcast-landscape` — hide global navbar/bottom nav, full-viewport main area
 * - `ios-native-stream-underlay` — transparent Capacitor webview (native video visible below)
 */
export function useLiveBroadcastImmersiveDocument(isImmersiveLandscape, isLandscape) {
  const isIosNativeLandscape = usesIosNativeStreamPlayer() && isLandscape;

  useEffect(() => {
    const html = document.documentElement;

    if (isImmersiveLandscape) {
      html.classList.add('live-broadcast-landscape');
    }

    if (isIosNativeLandscape) {
      html.classList.add('ios-native-stream-underlay');
    }

    return () => {
      if (isImmersiveLandscape) {
        html.classList.remove('live-broadcast-landscape');
      }
      if (isIosNativeLandscape) {
        html.classList.remove('ios-native-stream-underlay');
      }
    };
  }, [isImmersiveLandscape, isIosNativeLandscape]);
}
