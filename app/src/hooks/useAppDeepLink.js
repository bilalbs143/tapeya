/**
 * Handle OS / Capacitor deep links into the consumer app.
 * Routes are registered in {@link DEEP_LINK_ROUTES}.
 */

import { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { pathFromDeepLinkUrl } from '@/lib/deepLinks/deepLinkUtils';
import { isNative } from '@/platform/platform';

export function useAppDeepLink() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNative()) return undefined;

    let listener;
    let cancelled = false;

    import('@capacitor/app').then(({ App }) => {
      if (cancelled) return;

      App.addListener('appUrlOpen', ({ url }) => {
        const path = pathFromDeepLinkUrl(url);
        if (path) navigate(path);
      }).then((l) => {
        if (cancelled) l.remove();
        else listener = l;
      });

      App.getLaunchUrl?.()
        .then((result) => {
          const launchUrl = result?.url;
          if (!launchUrl || cancelled) return;
          const path = pathFromDeepLinkUrl(launchUrl);
          if (path) navigate(path);
        })
        .catch(() => {
          // getLaunchUrl unavailable on some platforms — ignore.
        });
    });

    return () => {
      cancelled = true;
      listener?.remove();
    };
  }, [navigate]);
}
