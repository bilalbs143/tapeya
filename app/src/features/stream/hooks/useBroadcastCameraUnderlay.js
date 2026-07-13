import { useEffect } from 'react';

const UNDERLAY_CLASS = 'broadcast-camera-underlay';

/**
 * Transparent Capacitor webview + locked scroll while the native camera preview
 * renders beneath the broadcast overlay UI.
 */
export function useBroadcastCameraUnderlay(enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;

    const html = document.documentElement;
    const prevOverflow = document.body.style.overflow;

    html.classList.add(UNDERLAY_CLASS);
    document.body.style.overflow = 'hidden';

    return () => {
      html.classList.remove(UNDERLAY_CLASS);
      document.body.style.overflow = prevOverflow;
    };
  }, [enabled]);
}
