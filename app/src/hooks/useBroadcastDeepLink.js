/**
 * Deep-link back into an in-progress self-serve broadcast — tapped from the Android
 * "You're live on Tapeya" foreground-service notification (`tapeya://live/go-live/:streamId`).
 * See LIVE_STREAM_MOBILE_BROADCAST.md's Android "Backgrounding" section. No-op on web/iOS,
 * since neither issues this deep link today.
 */

import { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { isNative } from '@/platform/platform';

const DEEP_LINK_PATH_PREFIX = 'live/go-live';

function pathFromDeepLink(url) {
  try {
    const parsed = new URL(url);
    const path = `${parsed.hostname}${parsed.pathname}`.replace(/\/+$/, '');
    return path.startsWith(DEEP_LINK_PATH_PREFIX) ? `/${path}` : null;
  } catch {
    return null;
  }
}

export function useBroadcastDeepLink() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNative()) return undefined;

    let listener;
    let cancelled = false;

    import('@capacitor/app').then(({ App }) => {
      if (cancelled) return;
      App.addListener('appUrlOpen', ({ url }) => {
        const path = pathFromDeepLink(url);
        if (path) navigate(path);
      }).then((l) => {
        if (cancelled) l.remove();
        else listener = l;
      });
    });

    return () => {
      cancelled = true;
      listener?.remove();
    };
  }, [navigate]);
}
