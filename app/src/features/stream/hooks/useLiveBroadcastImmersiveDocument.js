import { useEffect } from 'react';

export const IOS_NATIVE_STREAM_UNDERLAY_CLASS = 'ios-native-stream-underlay';
const LANDSCAPE_CLASS = 'live-broadcast-landscape';

/**
 * Document classes for live broadcast:
 * - landscape: hide global navbar / bottom nav
 * - underlay: clear document + layout root so native YouTube shows through the video hole
 *
 * @param {boolean} isImmersiveLandscape
 * @param {boolean} usesIosNativeUnderlay
 */
export function useLiveBroadcastImmersiveDocument(isImmersiveLandscape, usesIosNativeUnderlay = false) {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle(LANDSCAPE_CLASS, isImmersiveLandscape);
    html.classList.toggle(IOS_NATIVE_STREAM_UNDERLAY_CLASS, usesIosNativeUnderlay);

    return () => {
      html.classList.remove(LANDSCAPE_CLASS);
      html.classList.remove(IOS_NATIVE_STREAM_UNDERLAY_CLASS);
    };
  }, [isImmersiveLandscape, usesIosNativeUnderlay]);
}
