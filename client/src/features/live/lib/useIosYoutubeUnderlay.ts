import { useEffect } from 'react';

const UNDERLAY_CLASS = 'ios-youtube-underlay';

/** Transparent Capacitor shell so the native YouTube WKWebView shows through the player hole. */
export function useIosYoutubeUnderlay(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return undefined;

    const html = document.documentElement;
    html.classList.add(UNDERLAY_CLASS);
    return () => {
      html.classList.remove(UNDERLAY_CLASS);
    };
  }, [enabled]);
}
